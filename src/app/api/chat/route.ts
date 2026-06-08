import { streamText } from 'ai';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { getModel, AVAILABLE_MODELS, type SupportedModel } from '@/lib/ai-provider';

const fmt = (n: number) => 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const subscriptionSchema = z.object({
  name: z.string(),
  amount: z.number(),
  billingCycle: z.enum(['monthly', 'yearly', 'quarterly']),
  nextBillingDate: z.string().optional(),
});

const billSchema = z.object({
  name: z.string(),
  defaultAmount: z.number(),
  dueDay: z.number(),
});

const debtSchema = z.object({
  name: z.string(),
  creditor: z.string().optional(),
  principalAmount: z.number(),
  interestRate: z.number().optional(),
  monthlyPayment: z.number(),
});

const incomeSchema = z.object({
  source: z.string(),
  amount: z.number(),
});

const emptySchema = z.object({});

export async function GET() {
  return Response.json({ models: AVAILABLE_MODELS });
}

export async function POST(req: Request) {
  try {
    const { messages, conversationId, model } = await req.json();
    const selectedModel: SupportedModel = model || 'deepseek-chat';
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Save user message if conversationId is provided
    const lastMsg = messages?.[messages.length - 1];
    if (conversationId && lastMsg?.role === 'user') {
      await prisma.aiMessage.create({
        data: { conversationId, role: 'user', content: lastMsg.content },
      });
    }

    // Gather financial context
    const [incomeAgg, budgetAgg, subs, bills, debts] = await Promise.all([
      prisma.incomeEntry.aggregate({ where: { month }, _sum: { amount: true } }),
      prisma.budgetAllocation.aggregate({ where: { month }, _sum: { allocatedAmount: true } }),
      prisma.subscription.findMany({ include: { category: true } }),
      prisma.recurringBill.findMany({ include: { category: true } }),
      prisma.debt.findMany({ include: { category: true } }),
    ]);

    const income = incomeAgg._sum.amount ?? 0;
    const committed = budgetAgg._sum.allocatedAmount ?? 0;
    const activeSubs = subs.filter((s) => s.status === 'active');
    const subTotal = activeSubs.reduce((s, sub) => s + sub.amount, 0);
    const activeDebts = debts.filter((d) => d.status === 'active');

    const systemPrompt = `You are Stasis, a personal finance assistant for a user in Indonesia. All amounts are in Indonesian Rupiah (IDR). Be direct, practical, and conversational.

Current financial snapshot (${month}):
- Income: ${fmt(income)}
- Budget allocated: ${fmt(committed)}
- Subscriptions: ${activeSubs.length} active (${fmt(subTotal)}/month)
- Bills: ${bills.length} recurring
- Debts: ${activeDebts.length} active (${fmt(activeDebts.reduce((s, d) => s + d.remainingAmount, 0))} remaining)

Use the available tools to help the user. When they describe data in natural language ("Netflix 149k per month"), parse it and create entries. Always confirm what you've done. Keep responses brief and useful.`;

    const result = streamText({
      model: getModel(selectedModel),
      system: systemPrompt,
      messages: messages.map(({ role, content, tool_call_id, tool_calls }: any) => ({
        role,
        content: content ?? '',
        ...(tool_call_id ? { tool_call_id } : {}),
        ...(tool_calls ? { tool_calls } : {}),
      })),
      tools: {
        add_subscription: {
          description: 'Add a new subscription. All amounts in IDR.',
          inputSchema: subscriptionSchema,
          execute: async ({ name, amount, billingCycle, nextBillingDate }: z.infer<typeof subscriptionSchema>) => {
            const cat = await prisma.category.findFirst({ where: { name: 'Subscriptions' } });
            const sub = await prisma.subscription.create({
              data: {
                name,
                amount,
                currency: 'IDR',
                billingCycle,
                nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : new Date(),
                categoryId: cat!.id,
              },
            });
            return `Created subscription: ${sub.name} at ${fmt(amount)}/${billingCycle}`;
          },
        },
        add_bill: {
          description: 'Add a recurring bill. All amounts in IDR.',
          inputSchema: billSchema,
          execute: async ({ name, defaultAmount, dueDay }: z.infer<typeof billSchema>) => {
            const cat = await prisma.category.findFirst({ where: { name: 'Utilities' } });
            const bill = await prisma.recurringBill.create({
              data: { name, defaultAmount, dueDay, categoryId: cat!.id },
            });
            return `Added bill: ${bill.name} - ${fmt(defaultAmount)} due on day ${dueDay}`;
          },
        },
        add_debt: {
          description: 'Add a new debt. All amounts in IDR.',
          inputSchema: debtSchema,
          execute: async ({ name, creditor, principalAmount, interestRate, monthlyPayment }: z.infer<typeof debtSchema>) => {
            const cat = await prisma.category.findFirst({ where: { name: 'Debt Repayment' } });
            const debt = await prisma.debt.create({
              data: {
                name,
                creditor: creditor || 'Unknown',
                principalAmount,
                remainingAmount: principalAmount,
                interestRate: interestRate ?? 0,
                monthlyPayment,
                startDate: new Date(),
                categoryId: cat!.id,
              },
            });
            return `Added debt: ${debt.name} - ${fmt(principalAmount)} to ${debt.creditor}`;
          },
        },
        add_income: {
          description: 'Log income for the current month. All amounts in IDR.',
          inputSchema: incomeSchema,
          execute: async ({ source, amount }: z.infer<typeof incomeSchema>) => {
            const cat = await prisma.category.findFirst({ where: { name: 'Salary' } });
            await prisma.incomeEntry.create({
              data: { source, amount, month, categoryId: cat!.id },
            });
            return `Logged income: ${source} - ${fmt(amount)}`;
          },
        },
        get_summary: {
          description: 'Get the current financial summary.',
          inputSchema: emptySchema,
          execute: async () => {
            return JSON.stringify({
              month,
              income: fmt(income),
              allocated: fmt(committed),
              free: fmt(income - committed),
              subscriptions: `${activeSubs.length} active (${fmt(subTotal)}/month)`,
              debts: `${activeDebts.length} active (${fmt(activeDebts.reduce((s, d) => s + d.remainingAmount, 0))} remaining)`,
            });
          },
        },
      },
      onFinish: async ({ text }) => {
        if (conversationId && text) {
          await prisma.aiMessage.create({
            data: { conversationId, role: 'assistant', content: text },
          }).catch(() => {
            // Non-blocking - don't fail the response if saving fails
          });
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

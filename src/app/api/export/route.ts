import { prisma } from '@/server/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [categories, incomeEntries, budgetAllocations, subscriptions, bills, debts] = await Promise.all([
      prisma.category.findMany(),
      prisma.incomeEntry.findMany({ where: { month } }),
      prisma.budgetAllocation.findMany({ where: { month } }),
      prisma.subscription.findMany(),
      prisma.recurringBill.findMany(),
      prisma.debt.findMany(),
    ]);

    const catName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name ?? '';
    const fmt = (n: number) => n.toString();

    const rows: string[] = [];

    rows.push('Type,Name,Category,Amount,Details');
    rows.push(
      ...incomeEntries.map(
        e => `Income,${e.source},"${catName(e.categoryId)}",${fmt(e.amount)},${e.month}`,
      ),
    );
    rows.push(
      ...budgetAllocations.map(
        a =>
          `Budget,"${catName(a.categoryId)}","${catName(a.categoryId)}",${fmt(a.allocatedAmount)},${a.month}`,
      ),
    );
    rows.push(
      ...subscriptions.map(
        s => `Subscription,${s.name},"${catName(s.categoryId)}",${fmt(s.amount)},${s.billingCycle} / ${s.status}`,
      ),
    );
    rows.push(
      ...bills.map(
        b => `Bill,${b.name},"${catName(b.categoryId)}",${fmt(b.defaultAmount)},Due day ${b.dueDay}`,
      ),
    );
    rows.push(
      ...debts.map(
        d =>
          `Debt,${d.name},"${catName(d.categoryId)}",${fmt(d.remainingAmount)},${d.creditor} (${fmt(d.monthlyPayment)}/mo)`,
      ),
    );

    return new NextResponse(rows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="stasis-export-${month}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to export data' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

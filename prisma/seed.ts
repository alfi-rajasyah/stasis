import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Idempotency: skip if categories already exist
  const existingCategories = await prisma.category.count();
  if (existingCategories > 0) {
    console.log(`Found ${existingCategories} existing categories, skipping seed.`);
    return;
  }

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // 10 categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Salary", type: "INCOME", color: "#22C55E" } }),
    prisma.category.create({ data: { name: "Freelance", type: "INCOME", color: "#3B82F6" } }),
    prisma.category.create({ data: { name: "Housing", type: "EXPENSE", color: "#EF4444" } }),
    prisma.category.create({ data: { name: "Food & Dining", type: "EXPENSE", color: "#F97316" } }),
    prisma.category.create({ data: { name: "Transport", type: "EXPENSE", color: "#EAB308" } }),
    prisma.category.create({ data: { name: "Entertainment", type: "EXPENSE", color: "#A855F7" } }),
    prisma.category.create({ data: { name: "Subscriptions", type: "EXPENSE", color: "#EC4899" } }),
    prisma.category.create({ data: { name: "Utilities", type: "EXPENSE", color: "#06B6D4" } }),
    prisma.category.create({ data: { name: "Debt Repayment", type: "EXPENSE", color: "#DC2626" } }),
    prisma.category.create({ data: { name: "Savings", type: "EXPENSE", color: "#10B981" } }),
  ]);

  const salaryCat = categories.find((c) => c.name === "Salary")!;
  const housingCat = categories.find((c) => c.name === "Housing")!;

  // 1 sample income entry
  await prisma.incomeEntry.create({
    data: { source: "Monthly Salary", categoryId: salaryCat.id, amount: 15000000, month },
  });

  // 1 sample budget allocation
  await prisma.budgetAllocation.create({
    data: { categoryId: housingCat.id, month, allocatedAmount: 5000000 },
  });

  console.log(`Seeded: ${categories.length} categories, 1 income, 1 allocation for ${month}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

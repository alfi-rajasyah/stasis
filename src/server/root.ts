import { router } from './trpc';
import { categoriesRouter } from './routers/categories';
import { incomeRouter } from './routers/income';
import { budgetRouter } from './routers/budget';
import { dashboardRouter } from './routers/dashboard';
import { debtsRouter } from './routers/debts';
import { billsRouter } from './routers/bills';
import { subscriptionsRouter } from './routers/subscriptions';

export const appRouter = router({
  categories: categoriesRouter,
  income: incomeRouter,
  budget: budgetRouter,
  dashboard: dashboardRouter,
  debts: debtsRouter,
  recurringBills: billsRouter,
  subscriptions: subscriptionsRouter,
});

export type AppRouter = typeof appRouter;

import { router } from './trpc';
import { categoriesRouter } from './routers/categories';
import { incomeRouter } from './routers/income';
import { budgetRouter } from './routers/budget';
import { dashboardRouter } from './routers/dashboard';

export const appRouter = router({
  categories: categoriesRouter,
  income: incomeRouter,
  budget: budgetRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;

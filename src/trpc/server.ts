import { createCallerFactory } from '@/server/trpc';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/context';

export const serverClient = createCallerFactory(appRouter)(() =>
  createTRPCContext()
);

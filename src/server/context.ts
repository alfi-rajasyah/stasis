import { prisma } from './db';

export const createTRPCContext = async () => {
  return { prisma };
};

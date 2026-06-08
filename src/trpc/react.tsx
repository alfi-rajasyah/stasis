'use client';

import { QueryCache, MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpLink, TRPCClientError } from '@trpc/client';
import { observable } from '@trpc/server/observable';
import { useState } from 'react';
import { toast } from 'sonner';
import type { AppRouter } from '@/server/root';
import { trpc } from './client';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError(error) {
            if (!(error instanceof TRPCClientError)) {
              toast.error('Something went wrong');
            }
          },
        }),
        mutationCache: new MutationCache({
          onError(error) {
            if (!(error instanceof TRPCClientError)) {
              toast.error('Something went wrong');
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        (runtime) => {
          return ({ op, next }) => {
            return observable((observer) => {
              return next(op).subscribe({
                next(value) {
                  observer.next(value);
                },
                error(err) {
                  if (err instanceof TRPCClientError) {
                    toast.error(err.message);
                  } else {
                    toast.error('Something went wrong');
                  }
                  observer.error(err as TRPCClientError<AppRouter>);
                },
                complete() {
                  observer.complete();
                },
              });
            });
          };
        },
        httpLink({ url: '/api/trpc' }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

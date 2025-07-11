import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import superjson from 'superjson';
import type { AppRouter } from '@march-organizer/server';

export const trpc = createTRPCReact<AppRouter>();

// tRPC Provider component
export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 3,
        refetchOnWindowFocus: false,
        // Disable prefetching to avoid the experimental feature warning
        experimental_prefetchInRender: true
      },
    },
  }));

  const [trpcClient] = useState(() => createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: 'http://localhost:3001/trpc',
        transformer: superjson,
        headers: () => {
          // Get token from localStorage
          const token = localStorage.getItem('auth_token');
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  }));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}; 
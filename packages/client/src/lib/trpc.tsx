import { createTRPCReact,  } from '@trpc/react-query';
import { createTRPCClient,  httpBatchLink, httpLink } from '@trpc/client';
import { QueryClient, QueryClientProvider,  } from '@tanstack/react-query';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import superjson from 'superjson';
import type { AppRouter } from '@march-organizer/server';


const queryClient = new QueryClient({
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
});

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: 'http://localhost:3001/trpc',
      transformer: superjson, 
      headers: () => {
        // Get token from localStorage
        const token = localStorage.getItem('auth_token');
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

// tRPC Provider component
export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  return (
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
  );
}; 
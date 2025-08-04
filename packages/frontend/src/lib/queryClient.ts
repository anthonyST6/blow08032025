import { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: any) => {
        const message = error?.response?.data?.message || error?.message || 'An error occurred';
        toast.error(message);
      },
    },
  },
});

// Global error handler for queries
queryClient.setMutationDefaults(['global'], {
  mutationFn: async () => {
    // This is just a placeholder
  },
  onError: (error: any) => {
    console.error('Global mutation error:', error);
  },
});

// Invalidate queries helper
export const invalidateQueries = (queryKeys: string[]) => {
  queryKeys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
};

// Prefetch query helper
export const prefetchQuery = async (queryKey: string[], queryFn: () => Promise<any>) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
};
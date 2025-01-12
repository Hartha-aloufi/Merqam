import { QueryClient } from '@tanstack/react-query';

// Configure queryClient with default options
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: (failureCount, error) => {
				// Don't retry on 401/403 errors
				if (
					error instanceof Error &&
					'statusCode' in error &&
					[401, 403].includes((error as any).statusCode)
				) {
					return false;
				}
				return failureCount < 3;
			},
		},
	},
});

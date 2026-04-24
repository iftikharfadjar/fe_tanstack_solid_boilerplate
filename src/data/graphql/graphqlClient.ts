import { createClient, cacheExchange, fetchExchange } from 'urql';

export const graphqlClient = createClient({
  url: '/api/graphql', // Placeholder for actual GraphQL endpoint
  exchanges: [cacheExchange, fetchExchange],
  // Add authentication headers or context if needed
  fetchOptions: () => {
    return {
      headers: {
        // e.g., Authorization: `Bearer ${token}`
      },
    };
  },
});

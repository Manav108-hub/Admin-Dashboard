import { ApolloClient, InMemoryCache } from '@apollo/client';

export const GRAPHQL_URL = 'https://croche-backend-production-64d2.up.railway.app/graphql';

export const client = new ApolloClient({
    uri: GRAPHQL_URL,
    cache: new InMemoryCache(),
});
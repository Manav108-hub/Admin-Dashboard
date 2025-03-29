import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
    mutation Login($input: LoginInput!) {
    login(input: $input) {
      access_token
      user {
        id
        name
        email
        isAdmin
        createdAt
        updatedAt
      }
    }
  }
`;
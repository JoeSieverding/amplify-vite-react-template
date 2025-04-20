/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getSca = /* GraphQL */ `
  query GetSca($id: ID!) {
    getSca(id: $id) {
      contract_aws_contributions
      contract_comments
      contract_description
      contract_name
      contract_overall_status
      contract_partner_contributions
      contract_primary_industry
      contract_status
      contract_theme
      contract_time_based_targets
      contract_type
      createdAt
      end_date
      id
      partner
      start_date
      updatedAt
      __typename
    }
  }
`;
export const getTodo = /* GraphQL */ `
  query GetTodo($id: ID!) {
    getTodo(id: $id) {
      comment
      content
      createdAt
      id
      updatedAt
      __typename
    }
  }
`;
export const listScas = /* GraphQL */ `
  query ListScas(
    $filter: ModelScaFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listScas(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        contract_aws_contributions
        contract_comments
        contract_description
        contract_name
        contract_overall_status
        contract_partner_contributions
        contract_primary_industry
        contract_status
        contract_theme
        contract_time_based_targets
        contract_type
        createdAt
        end_date
        id
        partner
        start_date
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const listTodos = /* GraphQL */ `
  query ListTodos(
    $filter: ModelTodoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTodos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        comment
        content
        createdAt
        id
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;

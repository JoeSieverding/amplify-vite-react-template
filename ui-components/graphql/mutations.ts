/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createSca = /* GraphQL */ `
  mutation CreateSca(
    $condition: ModelScaConditionInput
    $input: CreateScaInput!
  ) {
    createSca(condition: $condition, input: $input) {
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
export const createTodo = /* GraphQL */ `
  mutation CreateTodo(
    $condition: ModelTodoConditionInput
    $input: CreateTodoInput!
  ) {
    createTodo(condition: $condition, input: $input) {
      comment
      content
      createdAt
      id
      updatedAt
      __typename
    }
  }
`;
export const deleteSca = /* GraphQL */ `
  mutation DeleteSca(
    $condition: ModelScaConditionInput
    $input: DeleteScaInput!
  ) {
    deleteSca(condition: $condition, input: $input) {
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
export const deleteTodo = /* GraphQL */ `
  mutation DeleteTodo(
    $condition: ModelTodoConditionInput
    $input: DeleteTodoInput!
  ) {
    deleteTodo(condition: $condition, input: $input) {
      comment
      content
      createdAt
      id
      updatedAt
      __typename
    }
  }
`;
export const updateSca = /* GraphQL */ `
  mutation UpdateSca(
    $condition: ModelScaConditionInput
    $input: UpdateScaInput!
  ) {
    updateSca(condition: $condition, input: $input) {
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
export const updateTodo = /* GraphQL */ `
  mutation UpdateTodo(
    $condition: ModelTodoConditionInput
    $input: UpdateTodoInput!
  ) {
    updateTodo(condition: $condition, input: $input) {
      comment
      content
      createdAt
      id
      updatedAt
      __typename
    }
  }
`;

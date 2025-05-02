import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  Milestone: a
    .model({
      milestone_type: a.string(),
      milestone_description: a.string(),
      is_tech: a.boolean(),
      is_currency: a.boolean(),
      kpi_value: a.string(),
      targeted_date: a.string(),
      input_type: a.string(),
      milestone_goal: a.string(),
      latest_actuals: a.string(),
      calc_rag_type: a.string(),
      is_rag_override: a.boolean(),
      updated_last_by: a.string(),
      scaId: a.string(),
      // New fields added - fields are optional by default
      is_baselined: a.boolean(),
      milestone_start_date: a.string(),
      comments: a.string(),
      // Relationships
      sca: a.belongsTo('Sca', 'scaId'),
      milestone_statuses: a.hasMany('MilestoneStatus', 'milestoneId')
    })
    .authorization((allow) => [allow.publicApiKey()]),
  Sca: a
    .model({
      partner: a.string(),
      start_date: a.string(),
      end_date: a.string(),
      contract_name: a.string(),
      contract_description: a.string(),
      contract_type: a.string(),
      contract_status: a.string(),
      contract_comments: a.string(),
      contract_aws_contributions: a.string(),
      contract_partner_contributions: a.string(),
      contract_time_based_targets: a.string(),
      contract_primary_industry: a.string(),
      contract_overall_status: a.string(),
      contract_theme: a.string(),
      // New fields added - fields are optional by default
      contract_spcg_id: a.string(),
      primary_use_cases: a.string(),
      // Relationships
      milestones: a.hasMany('Milestone', 'scaId')
    })
    .authorization((allow) => [allow.publicApiKey()]),
  MilestoneStatus: a
    .model({
      lastest_kpi_planned: a.string(),
      latest_status_actuals: a.string(),
      status_rag_status: a.string(),
      is_status_rag_override: a.boolean(),
      status_notes: a.string(),
      updated_by: a.string(),
      milestoneId: a.string(),
      // Relationship
      milestone: a.belongsTo('Milestone', 'milestoneId')
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export { schema };

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
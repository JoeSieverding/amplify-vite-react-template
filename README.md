## SCA Suite - Strategic Contract Agreement Management

SCA Suite is a comprehensive application for managing Strategic Contract Agreements (SCAs) between AWS and partners. It provides tools for tracking contracts, milestones, and performance metrics.

## Overview

This application helps AWS teams manage strategic partnerships by providing a centralized platform for contract management, milestone tracking, and analytics. Built with React, Vite, and AWS Amplify, it offers a responsive and intuitive interface for managing complex partner relationships.

## Environment Switching

This application supports two environments:

- **Sandbox**: Development/testing environment
- **Production**: Production environment

### How to Switch Environments

You can switch between environments using the provided script:

```bash
# Switch to production environment
node switch-env.cjs prod

# Switch to sandbox environment
node switch-env.cjs sandbox
```

After switching environments, you'll need to restart your application for the changes to take effect.

## Features

- **Contract Management**: Create, view, and update Strategic Contract Agreements with partners.
- **Milestone Tracking**: Define and track technical and business milestones with RAG status indicators.
- **Analytics**: Analyze contract performance and milestone completion through interactive dashboards.
- **ChatBot Integration**: Import SCA data and analyze metrics using AI-powered chatbots.
- **Authentication**: Secure access with Amazon Cognito authentication limited to @amazon.com email addresses.

## Development

```bash
npm run dev
```

This will start the development server.

## Production Deployment

```bash
npm run build
```

## Application Structure

- **Authentication**: Uses AWS Cognito with custom validation for @amazon.com emails.
- **Data Model**: Includes Sca and Milestone models with relationships between them.
- **UI Components**: Built with Cloudscape Design components for a consistent AWS look and feel.
- **Routing**: React Router for navigation between different views.
- **State Management**: React hooks for local state management.
- **API Integration**: AWS AppSync GraphQL API for data operations.

## Configuration Files

- `amplify_outputs.json`: The active configuration file used by the application
- `amplify_outputs.sandbox.json`: Sandbox environment configuration
- `amplify_outputs.prod.json`: Production environment configuration

## API Endpoints

- Sandbox: https://esheqvoqgjfnbgmxy2dw7mks2u.appsync-api.us-east-1.amazonaws.com/graphql
- Production: https://h2qagbm7vjb4tlk5ebnq2dmq4m.appsync-api.us-east-1.amazonaws.com/graphql

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Access the application at http://localhost:5173

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This application is licensed under the MIT-0 License. See the LICENSE file for details.
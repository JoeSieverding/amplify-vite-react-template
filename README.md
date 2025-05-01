## SCA Suite - Strategic Contract Agreement Management

SCA Suite is a comprehensive application for managing Strategic Contract Agreements (SCAs) between AWS and partners. It provides tools for tracking contracts, milestones, and performance metrics.

## Overview

This application helps AWS teams manage strategic partnerships by providing a centralized platform for contract management, milestone tracking, and analytics. Built with React, Vite, and AWS Amplify, it offers a responsive and intuitive interface for managing complex partner relationships.

## Features

- **Contract Management**: Create, view, and update Strategic Contract Agreements with partners.
- **Milestone Tracking**: Define and track technical and business milestones with RAG status indicators.
- **Analytics**: Analyze contract performance and milestone completion through interactive dashboards.
- **ChatBot Integration**: Import SCA data and analyze metrics using AI-powered chatbots.
- **Authentication**: Secure access with Amazon Cognito authentication limited to @amazon.com email addresses.

## Development with Different Backends

You can run the application against different backend environments:

### Sandbox Environment (Default for Local Development)

```bash
npm run dev
```

This uses the sandbox configuration from `amplify_outputs.sandbox.json`.

### Production Environment

```bash
npm run dev:prod
```

This uses the production backend configuration while running your local code.

## Setting Up Local Environment

1. Copy the example environment file:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` to customize your environment:

```
# Set to 'false' to use production backend locally
# VITE_USE_SANDBOX=false
```

## Production Deployment

The production build always uses the production backend configuration from `amplify_outputs.json`.

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

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Access the application at http://localhost:5173

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This application is licensed under the MIT-0 License. See the LICENSE file for details.
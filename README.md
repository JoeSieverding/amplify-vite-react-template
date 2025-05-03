# SCA Suite

A React application built with Amplify Gen 2, Vite, and TypeScript.

## Environment Setup

This application supports two environments:

- **Sandbox**: For local development with a sandbox backend
- **Production**: For connecting to the production backend

## Running the Application

### Development Mode (Sandbox)

To run the application in development mode with the sandbox backend:

```bash
# Using npm scripts with cross-env
npm run dev

# For Windows users (if cross-env has issues)
npm run dev:win:sandbox
```

This will start the application with the sandbox environment configuration.

### Production Mode

To run the application locally but connected to the production backend:

```bash
# Using npm scripts with cross-env
npm run dev:prod

# For Windows users (if cross-env has issues)
npm run dev:win:prod
```

This will start the application with the production environment configuration.

## Switching Environments

You can also switch between environments using the following commands:

```bash
# Switch to sandbox environment
npm run switch:sandbox

# Switch to production environment
npm run switch:prod
```

These commands will update the `amplify_outputs.json` file with the appropriate configuration.

## Building for Production

To build the application for production:

```bash
npm run build
```

This will create a production build in the `dist` directory.

## Additional Scripts

- `npm run build:sandbox`: Build the application with sandbox configuration
- `npm run lint`: Run ESLint to check for code issues
- `npm run preview`: Preview the built application locally

## Troubleshooting

If you encounter issues with the `cross-env` package, try the following:

1. Make sure you have installed the dependencies:
   ```bash
   npm install
   ```

2. Use the Windows-specific scripts:
   ```bash
   npm run dev:win:sandbox
   # or
   npm run dev:win:prod
   ```

3. Set the environment variables manually:
   ```bash
   # On Windows
   set VITE_ENV=sandbox
   npx vite
   
   # On macOS/Linux
   VITE_ENV=sandbox npx vite
   ```
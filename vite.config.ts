import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser'
    }
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: [
        'aws-amplify',
        '@aws-amplify/core/internals/utils',
        /^@aws-amplify\/.*/  // This will catch all @aws-amplify packages
      ],
      output: {
        globals: {
          'aws-amplify': 'aws-amplify',
          '@aws-amplify/core/internals/utils': 'aws_amplify_core_internals_utils'
        }
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    },
    include: [
      '@aws-amplify/ui-react',
      'aws-amplify'
    ]
  },
  define: {
    global: 'globalThis'
  }
})

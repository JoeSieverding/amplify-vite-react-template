import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { RollupOptions } from 'rollup'

type WarningHandler = NonNullable<RollupOptions['onwarn']>

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: './runtimeConfig',
        replacement: './runtimeConfig.browser'
      }
    ]
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      requireReturnsDefault: 'namespace'
    },
    rollupOptions: {
      external: [
        'aws-amplify',
        '@aws-amplify/core/internals/utils',
        /^@aws-amplify\/.*/,
        'react',
        'react-dom',
        'react-router-dom'
      ],
      output: {
        globals: {
          'aws-amplify': 'aws-amplify',
          '@aws-amplify/core/internals/utils': 'aws_amplify_core_internals_utils',
          '@aws-amplify/ui-react': '@aws_amplify/ui-react',
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM'
        },
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
          cloudscape: ['@cloudscape-design/components', '@cloudscape-design/global-styles']
        }
      },
      onwarn: ((warning, handler) => {
        if (
          warning.code === 'EVAL' && 
          warning.id && 
          typeof warning.id === 'string' && 
          warning.id.indexOf('pdfjs-dist') !== -1
        ) {
          return;
        }
        handler(warning);
      }) as WarningHandler
    },
    terserOptions: {
      mangle: {
        reserved: ['FileReader', 'Uint8Array']
      },
      compress: {
        drop_console: false,
        unsafe_Function: true
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
      'aws-amplify',
      '@cloudscape-design/components',
      '@cloudscape-design/global-styles',
      'react-router-dom'
    ],
    exclude: ['pdfjs-dist']
  },
  define: {
    global: 'globalThis',
    'window.global': {}
  },
  server: {
    watch: {
      usePolling: true
    }
  }
})

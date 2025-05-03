/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: 'production' | 'sandbox'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

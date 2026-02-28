import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import devServer from '@hono/vite-dev-server'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key in env) {
    process.env[key] ??= env[key]
  }

  return {
    plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    devServer({
      entry: './api/index.ts',
      injectClientScript: false,
      exclude: [
        /^\/$/,
        /^\/@.+$/,
        /^\/src\/.+$/,
        /^\/node_modules\/.+$/,
        /\.(ts|tsx|css|html|png|jpg|svg|ico)$/,
      ],
    }),
  ],
  }
})

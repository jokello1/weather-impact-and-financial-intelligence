import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { geocodeQuery } from './geocode-handler.mjs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.WEATHERAI_API_KEY || env.VITE_WEATHERAI_API_KEY

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'geocode-dev-api',
        configureServer(server) {
          server.middlewares.use('/api/geocode', async (req, res) => {
            const requestUrl = new URL(req.url ?? '/', 'http://localhost')
            const { status, body } = await geocodeQuery(requestUrl.searchParams.get('q') ?? '')
            res.statusCode = status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(body))
          })
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/weather-ai': {
          target: 'https://api.weather-ai.co',
          changeOrigin: true,
          rewrite: (requestPath) => requestPath.replace(/^\/api\/weather-ai/, ''),
          headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
        },
      },
    },
  }
})

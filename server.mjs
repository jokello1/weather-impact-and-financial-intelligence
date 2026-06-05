import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { geocodeQuery } from './geocode-handler.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000
const API_KEY = process.env.WEATHERAI_API_KEY || process.env.VITE_WEATHERAI_API_KEY

if (!API_KEY) {
  console.warn('Warning: WEATHERAI_API_KEY is not set. Weather API requests will fail.')
}

app.use('/api/weather-ai', async (req, res) => {
  if (!API_KEY) {
    res.status(500).json({ error: 'Weather API key is not configured on the server' })
    return
  }

  const targetUrl = new URL(`https://api.weather-ai.co${req.url}`)

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    const body = await response.text()
    res
      .status(response.status)
      .type(response.headers.get('content-type') || 'application/json')
      .send(body)
  } catch {
    res.status(502).json({ error: 'Weather API proxy failed' })
  }
})

app.get('/api/geocode', async (req, res) => {
  const { status, body } = await geocodeQuery(req.query.q ?? '')
  res.status(status).json(body)
})

app.use(express.static(path.join(__dirname, 'dist')))

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

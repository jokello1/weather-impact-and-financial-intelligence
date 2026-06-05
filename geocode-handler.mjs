const CACHE_TTL_MS = 1000 * 60 * 60 * 24
const geocodeCache = new Map()

function normalizeQuery(query) {
  return String(query).trim().toLowerCase()
}

function getCached(query) {
  const entry = geocodeCache.get(normalizeQuery(query))
  if (!entry) return null
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    geocodeCache.delete(normalizeQuery(query))
    return null
  }
  return entry.result
}

function setCached(query, result) {
  geocodeCache.set(normalizeQuery(query), {
    result,
    cachedAt: Date.now(),
  })
}

export async function geocodeQuery(query) {
  const trimmed = String(query).trim()
  if (!trimmed) {
    return { status: 400, body: { error: 'Location query is required' } }
  }

  const cached = getCached(trimmed)
  if (cached) {
    return { status: 200, body: cached }
  }

  const targetUrl = new URL('https://geocoding-api.open-meteo.com/v1/search')
  targetUrl.searchParams.set('name', trimmed)
  targetUrl.searchParams.set('count', '1')
  targetUrl.searchParams.set('language', 'en')
  targetUrl.searchParams.set('format', 'json')

  let response
  try {
    response = await fetch(targetUrl)
  } catch {
    return { status: 502, body: { error: 'Geocoding service unavailable' } }
  }

  if (!response.ok) {
    if (response.status === 429) {
      return {
        status: 429,
        body: { error: 'Too many location searches. Please wait a moment and try again.' },
      }
    }

    return { status: response.status, body: { error: 'Failed to geocode location' } }
  }

  const data = await response.json()
  const match = data.results?.[0]

  if (!match) {
    return { status: 404, body: { error: `No location found for "${trimmed}"` } }
  }

  const result = {
    lat: match.latitude,
    lon: match.longitude,
    displayName: [match.name, match.admin1, match.country].filter(Boolean).join(', '),
    city: match.name,
    country: match.country,
  }

  setCached(trimmed, result)
  return { status: 200, body: result }
}

import type {
  GeoResult,
  HourlyPoint,
  WeatherAlert,
  WeatherDay,
  WeatherForecast,
} from '@/types/weather'

const API_BASE = '/api/weather-ai/v1'

async function weatherFetch<T>(path: string, params: Record<string, string | number | boolean>) {
  const url = new URL(`${API_BASE}${path}`, window.location.origin)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value))
  })

  const response = await fetch(url)

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Weather API error (${response.status}): ${message}`)
  }

  return response.json() as Promise<T>
}

interface RawDaily {
  date: string
  temp_min: number
  temp_max: number
  precipitation_probability: number
  wind_max: number
  precipitation_sum: number
  condition_code: string
  icon?: string
  sunrise?: string
  sunset?: string
}

interface RawHourly {
  time: string
  temperature?: number
  humidity?: number
  precipitation_probability?: number
  wind_speed?: number
}

interface RawWeatherResponse {
  location: {
    lat: number
    lon: number
    timezone: string
    country?: string
    city?: string
  }
  current: {
    temperature: number
    wind_speed: number
    wind_direction?: number
    condition_code: string
    icon?: string
  }
  daily: RawDaily[]
  hourly?: RawHourly[]
  alerts?: Array<{
    id?: string
    title?: string
    description?: string
    severity?: string
  }>
}

function computeSeverityIndex(day: RawDaily, humidity: number): number {
  const rainScore = Math.min(day.precipitation_probability, 100) * 0.35
  const windScore = Math.min((day.wind_max / 25) * 100, 100) * 0.25
  const precipScore = Math.min((day.precipitation_sum / 15) * 100, 100) * 0.2
  const heatScore =
    day.temp_max > 35 ? Math.min(((day.temp_max - 35) / 10) * 100, 100) * 0.1 : 0
  const coldScore =
    day.temp_min < 5 ? Math.min(((5 - day.temp_min) / 10) * 100, 100) * 0.1 : 0
  const humidityScore = humidity > 85 ? 10 : humidity < 25 ? 5 : 0

  return Math.round(
    Math.min(100, rainScore + windScore + precipScore + heatScore + coldScore + humidityScore),
  )
}

function averageHumidityByDate(hourly: RawHourly[] = []) {
  const buckets = new Map<string, number[]>()

  hourly.forEach((hour) => {
    if (hour.humidity == null) return
    const date = hour.time.slice(0, 10)
    const values = buckets.get(date) ?? []
    values.push(hour.humidity)
    buckets.set(date, values)
  })

  const averages = new Map<string, number>()
  buckets.forEach((values, date) => {
    averages.set(date, values.reduce((sum, value) => sum + value, 0) / values.length)
  })

  return averages
}

function normalizeAlerts(alerts: RawWeatherResponse['alerts'] = []): WeatherAlert[] {
  return alerts.map((alert, index) => ({
    id: alert.id ?? `alert-${index}`,
    title: alert.title ?? 'Weather alert',
    description: alert.description ?? 'Severe weather conditions expected.',
    severity:
      alert.severity === 'high' || alert.severity === 'extreme'
        ? 'high'
        : alert.severity === 'medium' || alert.severity === 'moderate'
          ? 'medium'
          : 'low',
  }))
}

function deriveAlertsFromForecast(days: WeatherDay[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = []

  days.forEach((day) => {
    if (day.rainProbability >= 70 || day.precipitationSum >= 10) {
      alerts.push({
        id: `rain-${day.date}`,
        title: 'Heavy rainfall risk',
        description: `${day.rainProbability}% rain chance with ${day.precipitationSum.toFixed(1)}mm expected on ${day.date}.`,
        severity: day.rainProbability >= 85 ? 'high' : 'medium',
      })
    }

    if (day.windSpeed >= 18) {
      alerts.push({
        id: `wind-${day.date}`,
        title: 'High wind warning',
        description: `Wind gusts up to ${day.windSpeed.toFixed(1)} m/s expected on ${day.date}.`,
        severity: day.windSpeed >= 25 ? 'high' : 'medium',
      })
    }

    if (day.tempMax >= 38) {
      alerts.push({
        id: `heat-${day.date}`,
        title: 'Extreme heat advisory',
        description: `Peak temperature of ${day.tempMax.toFixed(1)}°C forecast on ${day.date}.`,
        severity: 'high',
      })
    }
  })

  return alerts
}

function normalizeForecast(data: RawWeatherResponse, city?: string): WeatherForecast {
  const humidityByDate = averageHumidityByDate(data.hourly)

  const days: WeatherDay[] = data.daily.map((day) => {
    const humidity = Math.round(humidityByDate.get(day.date) ?? 60)
    return {
      date: day.date,
      temperature: (day.temp_min + day.temp_max) / 2,
      tempMin: day.temp_min,
      tempMax: day.temp_max,
      rainProbability: day.precipitation_probability,
      windSpeed: day.wind_max,
      humidity,
      precipitationSum: day.precipitation_sum,
      severityIndex: computeSeverityIndex(day, humidity),
      conditionCode: day.condition_code,
      icon: day.icon,
      sunrise: day.sunrise,
      sunset: day.sunset,
    }
  })

  const apiAlerts = normalizeAlerts(data.alerts)
  const derivedAlerts = deriveAlertsFromForecast(days)

  const hourly: HourlyPoint[] = (data.hourly ?? []).map((hour) => ({
    time: hour.time,
    temperature: hour.temperature ?? 0,
    rainProbability: hour.precipitation_probability ?? 0,
    humidity: hour.humidity ?? 60,
    windSpeed: hour.wind_speed ?? 0,
  }))

  return {
    location: {
      lat: data.location.lat,
      lon: data.location.lon,
      timezone: data.location.timezone,
      country: data.location.country,
      city: city ?? data.location.city,
    },
    current: {
      temperature: data.current.temperature,
      windSpeed: data.current.wind_speed,
      windDirection: data.current.wind_direction,
      conditionCode: data.current.condition_code,
      icon: data.current.icon,
    },
    days,
    hourly,
    alerts: [...apiAlerts, ...derivedAlerts],
  }
}

export async function fetchWeatherForecast(
  lat: number,
  lon: number,
  days = 7,
  city?: string,
): Promise<WeatherForecast> {
  const data = await weatherFetch<RawWeatherResponse>('/weather', {
    lat,
    lon,
    days,
    ai: false,
    units: 'metric',
  })
  return normalizeForecast(data, city)
}

const GEOCODE_API = 'https://geocoding-api.open-meteo.com/v1/search'
const geocodeCache = new Map<string, GeoResult>()

interface OpenMeteoGeocodeResponse {
  results?: Array<{
    name: string
    latitude: number
    longitude: number
    country?: string
    admin1?: string
  }>
}

export async function geocodeLocation(query: string): Promise<GeoResult> {
  const trimmed = query.trim()
  if (!trimmed) {
    throw new Error('Enter a location to search')
  }

  const cacheKey = trimmed.toLowerCase()
  const cached = geocodeCache.get(cacheKey)
  if (cached) return cached

  const url = new URL(GEOCODE_API)
  url.searchParams.set('name', trimmed)
  url.searchParams.set('count', '1')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  const response = await fetch(url)

  if (response.status === 429) {
    throw new Error('Too many location searches. Please wait a moment and try again.')
  }

  if (!response.ok) {
    throw new Error('Failed to geocode location')
  }

  const data = (await response.json()) as OpenMeteoGeocodeResponse
  const match = data.results?.[0]

  if (!match) {
    throw new Error(`No location found for "${trimmed}"`)
  }

  const result: GeoResult = {
    lat: match.latitude,
    lon: match.longitude,
    displayName: [match.name, match.admin1, match.country].filter(Boolean).join(', '),
    city: match.name,
    country: match.country,
  }

  geocodeCache.set(cacheKey, result)
  return result
}

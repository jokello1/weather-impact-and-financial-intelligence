import type { WeatherForecast } from '@/types/weather'

export type BackdropCategory = 'night' | 'storm' | 'rain' | 'cloudy' | 'sunny'

export type BackdropVariant =
  | 'night'
  | 'storm'
  | 'rain-heavy'
  | 'rain-light'
  | 'cloudy-heavy'
  | 'cloudy-light'
  | 'sunny-hot'
  | 'sunny-mild'
  | 'sunny-clear'

export interface BackdropConfig {
  variant: BackdropVariant
  category: BackdropCategory
  intensity: 'light' | 'moderate' | 'heavy' | null
  image: string
  overlay: string
  label: string
}

const BACKDROPS: Record<BackdropVariant, BackdropConfig> = {
  night: {
    variant: 'night',
    category: 'night',
    intensity: null,
    image: '/night-bg.jpg',
    overlay: 'from-indigo-950/50 via-violet-950/40 to-black/55',
    label: 'Night',
  },
  storm: {
    variant: 'storm',
    category: 'storm',
    intensity: 'heavy',
    image: '/storm-bg.jpg',
    overlay: 'from-black/45 via-slate-950/35 to-black/50',
    label: 'Thunderstorm',
  },
  'rain-heavy': {
    variant: 'rain-heavy',
    category: 'rain',
    intensity: 'heavy',
    image: '/rain-heavy-bg.jpg',
    overlay: 'from-slate-950/25 via-slate-900/15 to-black/30',
    label: 'Heavy rain',
  },
  'rain-light': {
    variant: 'rain-light',
    category: 'rain',
    intensity: 'light',
    image: '/rain-light-bg.jpg',
    overlay: 'from-slate-900/35 via-slate-800/25 to-slate-950/40',
    label: 'Light rain',
  },
  'cloudy-heavy': {
    variant: 'cloudy-heavy',
    category: 'cloudy',
    intensity: 'heavy',
    image: '/cloudy-heavy-bg.jpg',
    overlay: 'from-slate-900/45 via-slate-800/35 to-slate-950/50',
    label: 'Very cloudy',
  },
  'cloudy-light': {
    variant: 'cloudy-light',
    category: 'cloudy',
    intensity: 'light',
    image: '/cloudy-light-bg.jpg',
    overlay: 'from-slate-900/30 via-slate-800/20 to-slate-950/35',
    label: 'Slightly cloudy',
  },
  'sunny-hot': {
    variant: 'sunny-hot',
    category: 'sunny',
    intensity: 'heavy',
    image: '/sunny-hot-bg.jpg',
    overlay: 'from-amber-900/30 via-orange-950/20 to-slate-900/25',
    label: 'Sunny · hot',
  },
  'sunny-mild': {
    variant: 'sunny-mild',
    category: 'sunny',
    intensity: 'moderate',
    image: '/sunny-mild-bg.jpg',
    overlay: 'from-emerald-950/20 via-slate-900/15 to-amber-950/20',
    label: 'Sunny · mild',
  },
  'sunny-clear': {
    variant: 'sunny-clear',
    category: 'sunny',
    intensity: 'light',
    image: '/sunny-clear-bg.jpg',
    overlay: 'from-sky-900/10 via-transparent to-blue-950/15',
    label: 'Clear sky',
  },
}

function parseCode(code: string | undefined) {
  return Number.parseInt(code ?? '0', 10) || 0
}

function getMinutesInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0)
  return hour * 60 + minute
}

function parseSunTime(value: string) {
  const time = value.split('T')[1] ?? '12:00'
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + (minute ?? 0)
}

function isNightTime(forecast: WeatherForecast, now = new Date()) {
  const today = forecast.days[0]
  const timezone = forecast.location.timezone
  const nowMinutes = getMinutesInTimezone(now, timezone)

  if (today?.sunrise && today?.sunset) {
    const sunriseMinutes = parseSunTime(today.sunrise)
    const sunsetMinutes = parseSunTime(today.sunset)
    return nowMinutes < sunriseMinutes || nowMinutes >= sunsetMinutes
  }

  const hour = Math.floor(nowMinutes / 60)
  return hour < 6 || hour >= 20
}

function isThunderOrStormCode(code: number) {
  return code >= 95
}

function isHeavyRainCode(code: number) {
  return (code >= 61 && code <= 67) || (code >= 80 && code <= 82)
}

function isLightRainCode(code: number) {
  return code >= 51 && code <= 57
}

function isOvercastCode(code: number) {
  return code === 3 || code === 45 || code === 48
}

function isPartlyCloudyCode(code: number) {
  return code === 2
}

function isClearCode(code: number) {
  return code <= 1
}

function hasStormAlert(forecast: WeatherForecast) {
  return forecast.alerts.some(
    (alert) =>
      alert.severity !== 'low' &&
      /storm|thunder|heavy rain|extreme wind|heat/i.test(`${alert.title} ${alert.description}`),
  )
}

function resolveVariant(forecast: WeatherForecast): BackdropVariant {
  const today = forecast.days[0]
  const currentCode = parseCode(forecast.current.conditionCode)
  const dailyCode = parseCode(today?.conditionCode)
  const rain = today?.rainProbability ?? 0
  const precip = today?.precipitationSum ?? 0
  const temp = forecast.current.temperature
  const tempMax = today?.tempMax ?? temp

  if (isNightTime(forecast)) return 'night'

  if (
    hasStormAlert(forecast) ||
    isThunderOrStormCode(currentCode) ||
    (isThunderOrStormCode(dailyCode) && rain >= 40)
  ) {
    return 'storm'
  }

  if (
    rain >= 65 ||
    precip >= 8 ||
    isHeavyRainCode(currentCode) ||
    (isHeavyRainCode(dailyCode) && rain >= 50)
  ) {
    return 'rain-heavy'
  }

  if (
    rain >= 25 ||
    isLightRainCode(currentCode) ||
    isLightRainCode(dailyCode) ||
    (precip >= 0.5 && precip < 8)
  ) {
    return 'rain-light'
  }

  if (isOvercastCode(currentCode) || isOvercastCode(dailyCode) || rain >= 15) {
    return 'cloudy-heavy'
  }

  if (isPartlyCloudyCode(currentCode) || isPartlyCloudyCode(dailyCode) || rain >= 5) {
    return 'cloudy-light'
  }

  if (isClearCode(currentCode) || isClearCode(dailyCode)) {
    if (temp >= 32 || tempMax >= 34) return 'sunny-hot'
    if (rain < 10 && precip < 0.5) return 'sunny-clear'
    if (temp >= 18) return 'sunny-mild'
    return 'sunny-clear'
  }

  if (temp >= 33 || tempMax >= 35) return 'sunny-hot'
  if (temp >= 18) return 'sunny-mild'
  return 'cloudy-light'
}

export function resolveWeatherBackdrop(forecast?: WeatherForecast): BackdropConfig {
  if (!forecast) {
    return BACKDROPS['cloudy-light']
  }

  return BACKDROPS[resolveVariant(forecast)]
}

export function getAllBackdrops() {
  return Object.values(BACKDROPS)
}

export function showRainOverlay(variant: BackdropVariant) {
  return variant === 'storm' || variant === 'rain-light'
}

export function showStormTreatment(variant: BackdropVariant) {
  return variant === 'storm'
}

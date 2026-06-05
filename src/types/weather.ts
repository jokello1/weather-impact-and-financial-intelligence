export interface WeatherDay {
  date: string
  temperature: number
  tempMin: number
  tempMax: number
  rainProbability: number
  windSpeed: number
  humidity: number
  precipitationSum: number
  severityIndex: number
  conditionCode: string
  icon?: string
  sunrise?: string
  sunset?: string
}

export interface WeatherAlert {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

export interface WeatherLocation {
  lat: number
  lon: number
  timezone: string
  country?: string
  city?: string
}

export interface HourlyPoint {
  time: string
  temperature: number
  rainProbability: number
  humidity: number
  windSpeed: number
}

export interface WeatherForecast {
  location: WeatherLocation
  current: {
    temperature: number
    windSpeed: number
    windDirection?: number
    conditionCode: string
    icon?: string
  }
  days: WeatherDay[]
  hourly: HourlyPoint[]
  alerts: WeatherAlert[]
}

export interface GeoResult {
  lat: number
  lon: number
  displayName: string
  city?: string
  country?: string
}

import { useQueries } from '@tanstack/react-query'
import { fetchWeatherForecast } from '@/lib/weather-api'

export interface ComparisonCity {
  name: string
  lat: number
  lon: number
}

export const COMPARISON_CITIES: ComparisonCity[] = [
  { name: 'Nairobi', lat: -1.2921, lon: 36.8219 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
]

export function useMultiCityWeather(cities = COMPARISON_CITIES, enabled = true) {
  return useQueries({
    queries: cities.map((city) => ({
      queryKey: ['weather', 'city-compare', city.name, city.lat, city.lon],
      queryFn: () => fetchWeatherForecast(city.lat, city.lon, 7, city.name),
      enabled,
      staleTime: 1000 * 60 * 30,
    })),
  })
}

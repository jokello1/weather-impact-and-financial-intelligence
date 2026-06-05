import { useQuery } from '@tanstack/react-query'
import { fetchWeatherForecast } from '@/lib/weather-api'

export function useWeather(lat?: number, lon?: number, days = 7, city?: string, enabled = true) {
  return useQuery({
    queryKey: ['weather', lat, lon, days, city],
    queryFn: () => fetchWeatherForecast(lat!, lon!, days, city),
    enabled: enabled && lat != null && lon != null,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })
}

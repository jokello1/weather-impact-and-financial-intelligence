import type { WeatherDay } from '@/types/weather'

export function getConditionHeadline(day?: WeatherDay, rainProbability?: number) {
  const rain = rainProbability ?? day?.rainProbability ?? 0
  const wind = day?.windSpeed ?? 0
  const code = day?.conditionCode ?? ''

  if (rain >= 70 || code.startsWith('6') || code.startsWith('7') || code.startsWith('8')) {
    return 'Storm with Heavy Rain'
  }
  if (rain >= 45 || code.startsWith('5')) {
    return 'Rain Showers Expected'
  }
  if (wind >= 15) {
    return 'Windy with Variable Clouds'
  }
  if (code.startsWith('0') || code.startsWith('1')) {
    return 'Clear Skies Ahead'
  }
  if (code.startsWith('2') || code.startsWith('3')) {
    return 'Partly Cloudy Conditions'
  }
  return 'Variable Clouds'
}

export function getConditionDescription(forecast: {
  days: WeatherDay[]
  current: { windSpeed: number }
}) {
  const today = forecast.days[0]
  if (!today) return 'Forecast data is loading.'

  const windMph = (forecast.current.windSpeed * 2.237).toFixed(0)
  const rain = today.rainProbability

  if (rain >= 50) {
    return `Variable clouds with rain showers. High ${today.tempMax.toFixed(0)}°C. Winds up to ${windMph} mph. Chance of rain ${rain}%. Precipitation up to ${today.precipitationSum.toFixed(1)} mm.`
  }

  return `Variable clouds with mixed conditions. High ${today.tempMax.toFixed(0)}°C and low ${today.tempMin.toFixed(0)}°C. Winds up to ${windMph} mph. Rain chance ${rain}% across the forecast period.`
}

export function getImpactSummary(riskScore: number) {
  if (riskScore >= 65) {
    return 'Weather conditions may significantly disrupt operations. Sensitive activities should prepare contingency plans.'
  }
  if (riskScore >= 35) {
    return 'Conditions are generally manageable, though intermittent disruption is possible for outdoor and travel activities.'
  }
  return 'The weather outlook is relatively stable. Most individuals and operations can proceed with standard planning.'
}

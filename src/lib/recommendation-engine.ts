import type { ActivityType, Recommendation, RiskLevel } from '@/types/financial'
import type { WeatherDay } from '@/types/weather'

function toRiskLevel(score: number): RiskLevel {
  if (score >= 65) return 'High'
  if (score >= 35) return 'Medium'
  return 'Low'
}

export function generateRecommendations(
  days: WeatherDay[],
  activity: ActivityType,
  riskScore: number,
): Recommendation {
  const riskLevel = toRiskLevel(riskScore)
  const avgRain =
    days.reduce((sum, day) => sum + day.rainProbability, 0) / Math.max(days.length, 1)
  const avgWind =
    days.reduce((sum, day) => sum + day.windSpeed, 0) / Math.max(days.length, 1)
  const maxTemp = Math.max(...days.map((day) => day.tempMax))
  const actions: string[] = []

  if (avgRain >= 60) {
    actions.push('High probability of rainfall — delay outdoor activity and protect inventory.')
  } else if (avgRain >= 35) {
    actions.push('Moderate rain expected — prepare contingency plans for outdoor operations.')
  } else {
    actions.push('Low rainfall risk — suitable window for outdoor scheduling.')
  }

  if (avgWind >= 15) {
    actions.push('Elevated wind speeds — secure equipment and avoid high-risk transport routes.')
  } else {
    actions.push('Low wind conditions — generally safe for travel and field logistics.')
  }

  if (maxTemp >= 35) {
    actions.push('High heat index — reduce outdoor farming activity during peak afternoon hours.')
  }

  if (activity === 'farming') {
    actions.push('Review irrigation schedule based on cumulative precipitation forecast.')
  } else if (activity === 'business') {
    actions.push('Align staffing and promotions with days showing highest disruption scores.')
  } else {
    actions.push('Add buffer time on days with highest delay-risk scores.')
  }

  const summary =
    riskLevel === 'High'
      ? 'Weather conditions pose significant financial and operational risk this week.'
      : riskLevel === 'Medium'
        ? 'Mixed weather signals — proactive planning can limit financial exposure.'
        : 'Weather outlook is relatively stable with manageable operational risk.'

  return {
    riskLevel,
    summary,
    actions: actions.slice(0, 4),
  }
}

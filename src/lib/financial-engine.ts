import type {
  ActivityComparison,
  ActivityImpact,
  ActivityType,
  BusinessImpact,
  FarmingImpact,
  ImpactAnalysis,
  ImpactConfig,
  RiskLevel,
  SensitivityMode,
  TravelImpact,
} from '@/types/financial'
import type { WeatherDay } from '@/types/weather'
import { generateRecommendations } from './recommendation-engine'

const DEFAULTS = {
  cropValue: 12000,
  dailyRevenue: 2500,
  costPerHour: 85,
  delayHours: 2,
}

function sensitivityMultiplier(mode: SensitivityMode) {
  switch (mode) {
    case 'conservative':
      return 0.75
    case 'aggressive':
      return 1.35
    default:
      return 1
  }
}

function toRiskLevel(score: number): RiskLevel {
  if (score >= 65) return 'High'
  if (score >= 35) return 'Medium'
  return 'Low'
}

function rainRiskFactor(day: WeatherDay) {
  return Math.min(1, day.rainProbability / 100 + day.precipitationSum / 30)
}

function seasonalityFactor(date: string) {
  const month = new Date(`${date}T12:00:00`).getMonth() + 1
  if ([3, 4, 5, 10, 11].includes(month)) return 1.15
  if ([6, 7, 8].includes(month)) return 0.95
  return 1
}

function weatherDisruptionScore(day: WeatherDay) {
  const rain = day.rainProbability / 100
  const wind = Math.min(day.windSpeed / 20, 1)
  const severity = day.severityIndex / 100
  return Math.min(1, rain * 0.5 + wind * 0.2 + severity * 0.3)
}

function calculateFarmingDayLoss(day: WeatherDay, cropValue: number, sensitivity: number) {
  const factor = rainRiskFactor(day) * seasonalityFactor(day.date) * sensitivity
  const yieldLossPct = Math.min(0.45, factor * 0.35)
  const dailyLoss = cropValue * yieldLossPct / 7
  return {
    dailyLoss,
    yieldLossPct,
    cropDamageRisk: Math.min(100, factor * 100),
  }
}

function calculateBusinessDayLoss(day: WeatherDay, dailyRevenue: number, sensitivity: number) {
  const disruption = weatherDisruptionScore(day) * sensitivity
  const footTrafficReduction = Math.min(0.6, disruption * 0.55)
  const dailyLoss = dailyRevenue * disruption
  return {
    dailyLoss,
    footTrafficReduction,
    disruption,
  }
}

function calculateTravelDayLoss(
  day: WeatherDay,
  costPerHour: number,
  baseDelayHours: number,
  sensitivity: number,
) {
  const delayRisk = Math.min(1, weatherDisruptionScore(day) * 1.2 * sensitivity)
  const delayHours = baseDelayHours * (0.5 + delayRisk)
  const dailyLoss = delayHours * costPerHour
  return {
    dailyLoss,
    delayRisk: delayRisk * 100,
    delayHours,
  }
}

function buildFarmingImpact(
  days: WeatherDay[],
  config: ImpactConfig,
  sensitivity: number,
): FarmingImpact {
  const cropValue = config.cropValue ?? DEFAULTS.cropValue
  const results = days.map((day) => calculateFarmingDayLoss(day, cropValue, sensitivity))
  const avgYieldLoss =
    results.reduce((sum, result) => sum + result.yieldLossPct, 0) / results.length
  const avgDamageRisk =
    results.reduce((sum, result) => sum + result.cropDamageRisk, 0) / results.length
  const dailyLoss = results.reduce((sum, result) => sum + result.dailyLoss, 0) / results.length

  let recommendedAction = 'Conditions are favorable for regular field operations.'
  if (avgDamageRisk >= 60) {
    recommendedAction = 'Delay harvesting and reinforce crop protection against heavy rain.'
  } else if (avgDamageRisk >= 35) {
    recommendedAction = 'Monitor soil moisture and adjust irrigation to reduce waterlogging risk.'
  }

  return {
    activity: 'farming',
    riskOfCropDamage: Math.round(avgDamageRisk),
    estimatedYieldLoss: Math.round(avgYieldLoss * 100),
    recommendedAction,
    dailyLoss,
  }
}

function buildBusinessImpact(
  days: WeatherDay[],
  config: ImpactConfig,
  sensitivity: number,
): BusinessImpact {
  const dailyRevenue = config.dailyRevenue ?? DEFAULTS.dailyRevenue
  const results = days.map((day) => calculateBusinessDayLoss(day, dailyRevenue, sensitivity))
  const avgFootTraffic =
    results.reduce((sum, result) => sum + result.footTrafficReduction, 0) / results.length
  const totalLoss = results.reduce((sum, result) => sum + result.dailyLoss, 0)
  const dailyLoss = totalLoss / results.length

  const recommendations: string[] = []
  if (avgFootTraffic >= 0.3) {
    recommendations.push('Shift promotions to online channels during high-rain days.')
    recommendations.push('Reduce outdoor staffing and extend indoor service hours.')
  } else {
    recommendations.push('Maintain standard operations with light weather contingency planning.')
  }

  return {
    activity: 'business',
    reducedFootTraffic: Math.round(avgFootTraffic * 100),
    revenueLossPrediction: Math.round(totalLoss),
    operationalRecommendations: recommendations,
    dailyLoss,
  }
}

function buildTravelImpact(
  days: WeatherDay[],
  config: ImpactConfig,
  sensitivity: number,
): TravelImpact {
  const costPerHour = config.costPerHour ?? DEFAULTS.costPerHour
  const delayHours = config.delayHours ?? DEFAULTS.delayHours
  const results = days.map((day) =>
    calculateTravelDayLoss(day, costPerHour, delayHours, sensitivity),
  )
  const avgDelayRisk = results.reduce((sum, result) => sum + result.delayRisk, 0) / results.length
  const totalCost = results.reduce((sum, result) => sum + result.dailyLoss, 0)
  const dailyLoss = totalCost / results.length

  let routeRecommendation = 'Routes are clear — maintain standard dispatch schedules.'
  if (avgDelayRisk >= 60) {
    routeRecommendation = 'Avoid low-lying routes and build extra buffer time into deliveries.'
  } else if (avgDelayRisk >= 35) {
    routeRecommendation = 'Use alternate routes during peak rain windows to reduce delay exposure.'
  }

  return {
    activity: 'travel',
    delayRisk: Math.round(avgDelayRisk),
    extraOperationalCost: Math.round(totalCost),
    routeRecommendation,
    dailyLoss,
  }
}

function buildDailyImpacts(
  days: WeatherDay[],
  activity: ActivityType,
  config: ImpactConfig,
  sensitivity: number,
) {
  const cropValue = config.cropValue ?? DEFAULTS.cropValue
  const dailyRevenue = config.dailyRevenue ?? DEFAULTS.dailyRevenue
  const costPerHour = config.costPerHour ?? DEFAULTS.costPerHour
  const delayHours = config.delayHours ?? DEFAULTS.delayHours

  return days.map((day) => {
    let expectedLoss = 0

    if (activity === 'farming') {
      expectedLoss = calculateFarmingDayLoss(day, cropValue, sensitivity).dailyLoss
    } else if (activity === 'business') {
      expectedLoss = calculateBusinessDayLoss(day, dailyRevenue, sensitivity).dailyLoss
    } else {
      expectedLoss = calculateTravelDayLoss(day, costPerHour, delayHours, sensitivity).dailyLoss
    }

    return {
      date: day.date,
      expectedLoss,
      bestCase: expectedLoss * 0.55,
      worstCase: expectedLoss * 1.65,
    }
  })
}

export function analyzeImpact(days: WeatherDay[], config: ImpactConfig): ImpactAnalysis {
  const sensitivity = sensitivityMultiplier(config.sensitivity)
  const scopedDays = days.slice(0, config.days)

  let impact: ActivityImpact
  if (config.activity === 'farming') {
    impact = buildFarmingImpact(scopedDays, config, sensitivity)
  } else if (config.activity === 'business') {
    impact = buildBusinessImpact(scopedDays, config, sensitivity)
  } else {
    impact = buildTravelImpact(scopedDays, config, sensitivity)
  }

  const dailyImpacts = buildDailyImpacts(scopedDays, config.activity, config, sensitivity)
  const totalExpectedLoss = dailyImpacts.reduce((sum, day) => sum + day.expectedLoss, 0)
  const bestCaseLoss = dailyImpacts.reduce((sum, day) => sum + day.bestCase, 0)
  const worstCaseLoss = dailyImpacts.reduce((sum, day) => sum + day.worstCase, 0)
  const riskScore = Math.round(
    scopedDays.reduce((sum, day) => sum + day.severityIndex, 0) / scopedDays.length,
  )

  return {
    activity: config.activity,
    overallRisk: toRiskLevel(riskScore),
    riskScore,
    totalExpectedLoss,
    bestCaseLoss,
    worstCaseLoss,
    dailyImpacts,
    impact,
    recommendation: generateRecommendations(scopedDays, config.activity, riskScore),
  }
}

export function compareActivities(days: WeatherDay[], config: Omit<ImpactConfig, 'activity'>) {
  const activities: ActivityType[] = ['farming', 'business', 'travel']
  const comparison = {} as ActivityComparison

  activities.forEach((activity) => {
    comparison[activity] = analyzeImpact(days, { ...config, activity })
  })

  return comparison
}

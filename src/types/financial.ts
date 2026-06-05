import type { WeatherDay } from './weather'

export type ActivityType = 'farming' | 'business' | 'travel'
export type RiskLevel = 'Low' | 'Medium' | 'High'
export type SensitivityMode = 'conservative' | 'balanced' | 'aggressive'

export interface Recommendation {
  riskLevel: RiskLevel
  summary: string
  actions: string[]
}

export interface FarmingImpact {
  activity: 'farming'
  riskOfCropDamage: number
  estimatedYieldLoss: number
  recommendedAction: string
  dailyLoss: number
}

export interface BusinessImpact {
  activity: 'business'
  reducedFootTraffic: number
  revenueLossPrediction: number
  operationalRecommendations: string[]
  dailyLoss: number
}

export interface TravelImpact {
  activity: 'travel'
  delayRisk: number
  extraOperationalCost: number
  routeRecommendation: string
  dailyLoss: number
}

export type ActivityImpact = FarmingImpact | BusinessImpact | TravelImpact

export interface ImpactAnalysis {
  activity: ActivityType
  overallRisk: RiskLevel
  riskScore: number
  totalExpectedLoss: number
  bestCaseLoss: number
  worstCaseLoss: number
  dailyImpacts: Array<{
    date: string
    expectedLoss: number
    bestCase: number
    worstCase: number
  }>
  impact: ActivityImpact
  recommendation: Recommendation
}

export interface ImpactConfig {
  activity: ActivityType
  sensitivity: SensitivityMode
  days: number
  cropValue?: number
  dailyRevenue?: number
  costPerHour?: number
  delayHours?: number
}

export interface ActivityComparison {
  farming: ImpactAnalysis
  business: ImpactAnalysis
  travel: ImpactAnalysis
}

export type { WeatherDay }

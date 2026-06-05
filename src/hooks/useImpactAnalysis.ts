import { useMemo } from 'react'
import { analyzeImpact, compareActivities } from '@/lib/financial-engine'
import type { ImpactConfig } from '@/types/financial'
import type { WeatherDay } from '@/types/weather'

export function useImpactAnalysis(days: WeatherDay[] | undefined, config: ImpactConfig) {
  return useMemo(() => {
    if (!days?.length) return null
    return analyzeImpact(days, config)
  }, [days, config])
}

export function useActivityComparison(
  days: WeatherDay[] | undefined,
  config: Omit<ImpactConfig, 'activity'>,
) {
  return useMemo(() => {
    if (!days?.length) return null
    return compareActivities(days, config)
  }, [days, config])
}

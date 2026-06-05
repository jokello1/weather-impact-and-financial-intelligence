import { ActivityComparisonChart } from '@/components/Charts/ActivityComparisonChart'
import { ImpactChart } from '@/components/Charts/ImpactChart'
import { WeatherTrendChart } from '@/components/Charts/WeatherTrendChart'
import { FinancialImpactCard } from '@/components/FinancialImpactCard'
import { RecommendationPanel } from '@/components/RecommendationPanel'
import { RiskGauge } from '@/components/RiskGauge'
import type { ActivityComparison, ImpactAnalysis } from '@/types/financial'
import type { WeatherForecast } from '@/types/weather'

interface DetailsSectionProps {
  id?: string
  forecast?: WeatherForecast
  analysis: ImpactAnalysis | null
  comparison: ActivityComparison | null
  days: number
}

export function DetailsSection({
  id = 'analysis-details',
  forecast,
  analysis,
  comparison,
  days,
}: DetailsSectionProps) {
  if (!forecast && !analysis) return null

  return (
    <section id={id} className="glass-panel scroll-mt-20 rounded-2xl p-4 lg:scroll-mt-28 lg:rounded-[28px] lg:p-6">
      <div className="mb-4 lg:mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 lg:text-[11px] lg:tracking-[0.25em]">
          Full analysis
        </p>
        <h2 className="mt-1.5 text-xl font-semibold text-white lg:mt-2 lg:text-2xl">
          Forecast & Financial Analysis
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {analysis && <RiskGauge riskScore={analysis.riskScore} riskLevel={analysis.overallRisk} />}
        <RecommendationPanel recommendation={analysis?.recommendation} />
        <FinancialImpactCard analysis={analysis} />
        <ActivityComparisonChart comparison={comparison} compact />
        {forecast && <WeatherTrendChart days={forecast.days.slice(0, days)} />}
        <ImpactChart analysis={analysis} />
      </div>
    </section>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { ImpactAnalysis } from '@/types/financial'

interface FinancialImpactCardProps {
  analysis: ImpactAnalysis | null
}

export function FinancialImpactCard({ analysis }: FinancialImpactCardProps) {
  if (!analysis) return null

  const { impact } = analysis

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Financial Impact</CardTitle>
        <CardDescription>Expected loss based on live weather forecast</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <Stat label="Expected" value={formatCurrency(analysis.totalExpectedLoss)} />
          <Stat label="Best case" value={formatCurrency(analysis.bestCaseLoss)} positive />
          <Stat label="Worst case" value={formatCurrency(analysis.worstCaseLoss)} negative />
        </div>

        {impact.activity === 'farming' && (
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-[11px] leading-snug lg:p-4 lg:text-sm">
            <Row label="Crop damage risk" value={`${impact.riskOfCropDamage}%`} />
            <Row label="Estimated yield loss" value={`${impact.estimatedYieldLoss}%`} />
            <p className="text-slate-300">{impact.recommendedAction}</p>
          </div>
        )}

        {impact.activity === 'business' && (
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-[11px] leading-snug lg:p-4 lg:text-sm">
            <Row label="Foot traffic reduction" value={`${impact.reducedFootTraffic}%`} />
            <Row label="Revenue loss (period)" value={formatCurrency(impact.revenueLossPrediction)} />
            <ul className="list-disc space-y-1 pl-5 text-slate-300">
              {impact.operationalRecommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {impact.activity === 'travel' && (
          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-[11px] leading-snug lg:p-4 lg:text-sm">
            <Row label="Delay risk" value={`${impact.delayRisk}%`} />
            <Row label="Extra operational cost" value={formatCurrency(impact.extraOperationalCost)} />
            <p className="text-slate-300">{impact.routeRecommendation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Stat({
  label,
  value,
  positive,
  negative,
}: {
  label: string
  value: string
  positive?: boolean
  negative?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-2.5 sm:p-3">
      <p className="text-[11px] text-slate-500 lg:text-sm">{label}</p>
      <p
        className={`mt-0.5 text-sm font-semibold lg:mt-1 lg:text-base ${
          positive ? 'text-emerald-400' : negative ? 'text-red-400' : 'text-slate-100'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-100">{value}</span>
    </div>
  )
}

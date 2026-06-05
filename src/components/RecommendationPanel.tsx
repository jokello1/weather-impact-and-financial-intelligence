import { Lightbulb } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardText, CardTitle } from '@/components/ui/card'
import type { Recommendation } from '@/types/financial'

interface RecommendationPanelProps {
  recommendation?: Recommendation | null
}

export function RecommendationPanel({ recommendation }: RecommendationPanelProps) {
  if (!recommendation) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Rule-based insights from forecast signals</CardDescription>
          </div>
          <Badge
            variant={
              recommendation.riskLevel === 'High'
                ? 'danger'
                : recommendation.riskLevel === 'Medium'
                  ? 'warning'
                  : 'success'
            }
            className="text-[11px] lg:text-sm"
          >
            {recommendation.riskLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 lg:space-y-4">
        <div className="flex gap-2 rounded-xl border border-slate-800 bg-slate-950/40 p-3 lg:gap-3 lg:p-4">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300 lg:h-4 lg:w-4" />
          <CardText>{recommendation.summary}</CardText>
        </div>
        <ul className="space-y-1.5 lg:space-y-2">
          {recommendation.actions.map((action) => (
            <li
              key={action}
              className="rounded-lg border border-slate-800/80 bg-slate-950/30 px-2.5 py-1.5 text-[11px] leading-snug text-slate-300 lg:px-3 lg:py-2 lg:text-sm"
            >
              {action}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

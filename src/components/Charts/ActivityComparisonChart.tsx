import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ActivityComparison } from '@/types/financial'

interface ActivityComparisonChartProps {
  comparison: ActivityComparison | null
  compact?: boolean
}

export function ActivityComparisonChart({ comparison, compact }: ActivityComparisonChartProps) {
  if (!comparison) return null

  const data = [
    {
      activity: 'Farming',
      loss: Math.round(comparison.farming.totalExpectedLoss),
      risk: comparison.farming.riskScore,
    },
    {
      activity: 'Business',
      loss: Math.round(comparison.business.totalExpectedLoss),
      risk: comparison.business.riskScore,
    },
    {
      activity: 'Travel',
      loss: Math.round(comparison.travel.totalExpectedLoss),
      risk: comparison.travel.riskScore,
    },
  ]

  return (
    <Card className={compact ? 'flex h-full flex-col' : undefined}>
      <CardHeader className={compact ? 'pb-1 lg:pb-2' : undefined}>
        <CardTitle>Activity Comparison</CardTitle>
        <CardDescription>Farming vs business vs travel under the same weather</CardDescription>
      </CardHeader>
      <CardContent className={compact ? 'min-h-[180px] flex-1 pb-3 sm:min-h-[220px] lg:pb-4' : 'h-52 sm:h-64 lg:h-72'}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={compact ? { top: 0, right: 4, left: -12, bottom: 0 } : undefined}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="activity" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} width={compact ? 36 : undefined} />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '12px',
              }}
            />
            <Bar dataKey="loss" name="Expected loss ($)" fill="#818cf8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

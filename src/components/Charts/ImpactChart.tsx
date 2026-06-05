import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { ImpactAnalysis } from '@/types/financial'

interface ImpactChartProps {
  analysis: ImpactAnalysis | null
}

export function ImpactChart({ analysis }: ImpactChartProps) {
  if (!analysis) return null

  const data = analysis.dailyImpacts.map((day) => ({
    date: formatDate(day.date),
    expected: Math.round(day.expectedLoss),
    best: Math.round(day.bestCase),
    worst: Math.round(day.worstCase),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Impact Trend</CardTitle>
        <CardDescription>Expected loss per day with best vs worst case</CardDescription>
      </CardHeader>
      <CardContent className="h-52 sm:h-64 lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="expected" name="Expected" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="best" name="Best case" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="worst" name="Worst case" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

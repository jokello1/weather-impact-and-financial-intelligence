import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { WeatherDay } from '@/types/weather'

interface WeatherTrendChartProps {
  days: WeatherDay[]
}

export function WeatherTrendChart({ days }: WeatherTrendChartProps) {
  const data = days.map((day) => ({
    date: formatDate(day.date),
    temperature: Math.round(day.temperature),
    rainProbability: day.rainProbability,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Weather Trend</CardTitle>
        <CardDescription>Temperature line with rainfall probability bars</CardDescription>
      </CardHeader>
      <CardContent className="h-52 sm:h-64 lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
            <YAxis yAxisId="left" stroke="#64748b" fontSize={11} />
            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar
              yAxisId="right"
              dataKey="rainProbability"
              name="Rain %"
              fill="#38bdf8"
              radius={[4, 4, 0, 0]}
              opacity={0.7}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              name="Temp °C"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

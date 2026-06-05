import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { HourlyPoint } from '@/types/weather'

interface MiniTrendChartProps {
  hourly: HourlyPoint[]
  compact?: boolean
}

export function MiniTrendChart({ hourly, compact }: MiniTrendChartProps) {
  const data = hourly.map((point) => ({
    time: new Date(point.time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    }),
    temperature: Math.round(point.temperature),
    rainProbability: point.rainProbability,
  }))

  const peak = data.reduce(
    (max, point) => (point.temperature > max.temperature ? point : max),
    data[0] ?? { time: '', temperature: 0, rainProbability: 0 },
  )

  if (!data.length) return null

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-white/10 bg-black/20',
        compact ? 'p-2' : 'p-3',
      )}
    >
      <div className={cn('flex items-center justify-between', compact ? 'mb-1' : 'mb-2')}>
        <p
          className={cn(
            'uppercase tracking-[0.15em] text-white/45',
            compact ? 'text-[9px]' : 'text-[10px]',
          )}
        >
          24h trend
        </p>
        {peak.temperature > 0 && (
          <span
            className={cn(
              'rounded-full bg-amber-400/20 text-amber-200',
              compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]',
            )}
          >
            peak {peak.temperature}°C
          </span>
        )}
      </div>

      <div className={cn(compact ? 'h-16' : 'h-24 lg:h-28')}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={
              compact
                ? { top: 2, right: 4, left: 4, bottom: 0 }
                : { top: 4, right: 0, left: -12, bottom: -4 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: compact ? 8 : 9 }}
              interval={compact ? 7 : 5}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis
              yAxisId="temp"
              stroke="#64748b"
              tick={{ fill: '#94a3b8', fontSize: compact ? 8 : 9 }}
              tickLine={false}
              axisLine={false}
              width={compact ? 22 : 28}
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(value) => `${value}°`}
            />
            <YAxis
              yAxisId="rain"
              orientation="right"
              hide
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: compact ? '10px' : '11px',
              }}
              formatter={(value, name) => {
                if (name === 'Temp') return [`${value}°C`, name]
                if (name === 'Rain') return [`${value}%`, name]
                return [value, name]
              }}
            />
            <Bar
              yAxisId="rain"
              dataKey="rainProbability"
              name="Rain"
              fill="#38bdf8"
              radius={[2, 2, 0, 0]}
              opacity={0.45}
              barSize={compact ? 3 : 4}
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              name="Temp"
              stroke="#f59e0b"
              strokeWidth={compact ? 1.5 : 2}
              dot={false}
              activeDot={{ r: compact ? 2.5 : 3, fill: '#f59e0b' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

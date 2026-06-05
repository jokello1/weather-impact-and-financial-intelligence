import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { WeatherForecast } from '@/types/weather'

interface CityComparisonChartProps {
  cities: Array<{
    name: string
    forecast?: WeatherForecast
    color: string
  }>
}

export function CityComparisonChart({ cities }: CityComparisonChartProps) {
  const activeCities = cities.filter((city) => city.forecast)

  if (!activeCities.length) {
    return (
      <div className="glass-panel rounded-2xl p-3 text-center text-[11px] text-white/50 lg:rounded-[28px] lg:p-6 lg:text-left lg:text-sm">
        Loading city comparison...
      </div>
    )
  }

  const length = Math.min(...activeCities.map((city) => city.forecast!.days.length))
  const chartData = Array.from({ length }, (_, index) => {
    const point: Record<string, string | number> = { day: `D${index + 1}` }
    activeCities.forEach((city) => {
      point[city.name] = Math.round(city.forecast!.days[index].temperature)
    })
    return point
  })

  return (
    <div className="glass-panel rounded-2xl p-3 text-center lg:rounded-[28px] lg:p-6 lg:text-left">
      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40 lg:mb-3 lg:text-[11px]">
        City comparison
      </p>
      <div className="mb-2 h-20 sm:h-28 lg:mb-4 lg:h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="day" hide />
            <YAxis hide domain={['dataMin - 4', 'dataMax + 4']} />
            <Tooltip
              contentStyle={{
                background: 'rgba(15,23,42,0.92)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
              }}
            />
            {activeCities.map((city) => (
              <Line
                key={city.name}
                type="monotone"
                dataKey={city.name}
                stroke={city.color}
                strokeWidth={2.5}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 justify-items-center gap-1 sm:gap-2 lg:grid-cols-7 lg:gap-4">
        {activeCities.map((city) => {
          const current = city.forecast!.current.temperature
          return (
            <div key={city.name} className="w-full min-w-0 text-center">
              <p className="text-base font-light text-white sm:text-lg lg:text-3xl">{Math.round(current)}°</p>
              <p className="mt-0.5 truncate px-0.5 text-[9px] text-white/50 sm:text-[10px] lg:mt-1 lg:text-xs">
                {city.name}
              </p>
              <div
                className="mx-auto mt-1 h-0.5 w-6 rounded-full sm:w-8 lg:mt-2 lg:w-10"
                style={{ backgroundColor: city.color }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

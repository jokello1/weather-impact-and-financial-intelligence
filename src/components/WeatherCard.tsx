import { CloudRain, Droplets, Thermometer, Wind } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { WeatherForecast } from '@/types/weather'

interface WeatherCardProps {
  forecast?: WeatherForecast
  isLoading?: boolean
}

export function WeatherCard({ forecast, isLoading }: WeatherCardProps) {
  if (isLoading) {
    return (
      <Card className="min-h-[280px] animate-pulse">
        <CardHeader>
          <CardTitle>Weather Overview</CardTitle>
          <CardDescription>Loading live forecast...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!forecast) return null

  const today = forecast.days[0]

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Weather Overview</CardTitle>
            <CardDescription>
              {forecast.location.city ?? 'Selected location'} · {forecast.location.country}
            </CardDescription>
          </div>
          {today.icon && <img src={today.icon} alt="" className="h-14 w-14" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-end gap-2">
          <span className="text-5xl font-semibold text-slate-50">
            {Math.round(forecast.current.temperature)}°
          </span>
          <span className="mb-2 text-slate-400">current</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric icon={Thermometer} label="Range" value={`${today.tempMin.toFixed(0)}° / ${today.tempMax.toFixed(0)}°`} />
          <Metric icon={CloudRain} label="Rain chance" value={`${today.rainProbability}%`} />
          <Metric icon={Wind} label="Wind" value={`${today.windSpeed.toFixed(1)} m/s`} />
          <Metric icon={Droplets} label="Humidity" value={`${today.humidity}%`} />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">7-day snapshot</p>
          <div className="grid grid-cols-7 gap-2">
            {forecast.days.map((day) => (
              <div
                key={day.date}
                className="rounded-xl border border-slate-800 bg-slate-950/50 p-2 text-center"
              >
                <p className="text-[10px] text-slate-500">{formatDate(day.date).split(',')[0]}</p>
                <p className="text-sm font-medium text-slate-100">{Math.round(day.temperature)}°</p>
                <p className="text-[10px] text-sky-300">{day.rainProbability}%</p>
              </div>
            ))}
          </div>
        </div>

        {forecast.alerts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {forecast.alerts.slice(0, 3).map((alert) => (
              <Badge
                key={alert.id}
                variant={
                  alert.severity === 'high'
                    ? 'danger'
                    : alert.severity === 'medium'
                      ? 'warning'
                      : 'secondary'
                }
              >
                {alert.title}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
      <div className="mb-1 flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium text-slate-100">{value}</p>
    </div>
  )
}

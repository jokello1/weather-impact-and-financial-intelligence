import { ArrowUpRight, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { getConditionDescription, getConditionHeadline } from '@/lib/weather-conditions'
import type { ActivityType } from '@/types/financial'
import type { WeatherForecast } from '@/types/weather'

interface HeroSectionProps {
  forecast?: WeatherForecast
  activity: ActivityType
  onOpenDetails?: () => void
}

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  farming: 'Farming',
  business: 'Business',
  travel: 'Travel & Logistics',
}

export function HeroSection({ forecast, activity, onOpenDetails }: HeroSectionProps) {
  if (!forecast) return null

  const today = forecast.days[0]
  const headline = getConditionHeadline(today)
  const description = getConditionDescription(forecast)
  const now = new Date()
  const dateLabel = formatDate(today?.date ?? now.toISOString().slice(0, 10))

  return (
    <section className="flex flex-1 flex-col justify-between px-2 py-3 text-center lg:px-8 lg:py-10 lg:text-left">
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/40 lg:mb-6 lg:text-[11px] lg:tracking-[0.35em]">
          Weather Impact Intelligence
        </p>

        <h2 className="mx-auto max-w-3xl text-2xl font-semibold leading-tight text-white sm:text-3xl md:text-5xl lg:mx-0 lg:text-6xl">
          {headline}
        </h2>

        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-white/55 lg:mt-5 lg:justify-start lg:text-sm">
          <Cloud className="h-3.5 w-3.5 shrink-0 text-amber-300 lg:h-4 lg:w-4" />
          <span>
            {forecast.location.country}, {dateLabel} · {ACTIVITY_LABELS[activity]} analysis
          </span>
        </div>

        <p className="mx-auto mt-3 max-w-2xl text-xs leading-6 text-white/60 md:text-sm md:leading-7 lg:mx-0 lg:mt-6 lg:text-base">
          {description}
        </p>

        <div className="mt-5 flex flex-wrap items-end justify-center gap-3 lg:mt-10 lg:justify-start lg:gap-8">
          <span className="text-5xl font-light leading-none text-white sm:text-6xl md:text-8xl lg:text-9xl">
            {Math.round(forecast.current.temperature)}°
          </span>
          <Button
            onClick={onOpenDetails}
            size="sm"
            className="mb-1 rounded-full border border-white/20 bg-white/10 px-4 text-xs text-white backdrop-blur hover:bg-white/20 lg:mb-4 lg:px-6 lg:text-sm"
          >
            See details
            <ArrowUpRight className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3 border-t border-white/10 pt-3 text-xs text-white/70 lg:mt-10 lg:justify-start lg:gap-8 lg:pt-6 lg:text-sm">
        {forecast.days.slice(0, 4).map((day) => (
          <div key={day.date}>
            <p className="text-white/40">{formatDate(day.date)}</p>
            <p className="mt-1 text-white">
              high {day.tempMax.toFixed(1)} °C / low {day.tempMin.toFixed(0)} °C
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

import { ArrowUpRight } from 'lucide-react'
import { MiniTrendChart } from '@/components/Charts/MiniTrendChart'
import { LocationSearchBar } from '@/components/layout/LocationSearchBar'
import { Button } from '@/components/ui/button'
import { getImpactSummary } from '@/lib/weather-conditions'
import { msToMph, windDirectionLabel } from '@/lib/wind'
import { cn } from '@/lib/utils'
import type { ImpactAnalysis } from '@/types/financial'
import type { WeatherForecast } from '@/types/weather'

interface SidebarPanelProps {
  forecast?: WeatherForecast
  analysis: ImpactAnalysis | null
  locationQuery: string
  onLocationChange: (value: string) => void
  onAnalyze: () => void
  isLoading?: boolean
  isSearching?: boolean
  onOpenDetails?: () => void
  className?: string
  inDrawer?: boolean
}

export function SidebarPanel({
  forecast,
  analysis,
  locationQuery,
  onLocationChange,
  onAnalyze,
  isLoading,
  isSearching,
  onOpenDetails,
  className,
  inDrawer,
}: SidebarPanelProps) {
  const today = forecast?.days[0]
  const riskScore = analysis?.riskScore ?? today?.severityIndex ?? 0
  const impactPct = analysis
    ? ((analysis.totalExpectedLoss / 17500) * 100).toFixed(1)
    : ((riskScore / 100) * 12).toFixed(1)

  const windMph = forecast ? msToMph(forecast.current.windSpeed).toFixed(1) : '—'
  const windDir = windDirectionLabel(forecast?.current.windDirection)

  return (
    <aside
      className={cn(
        'glass-panel flex w-full min-w-0 flex-col self-start rounded-2xl p-4 lg:sticky lg:top-4 lg:z-40 lg:max-h-[calc(100vh-2rem)] lg:max-w-[340px] lg:overflow-y-auto lg:rounded-[28px] lg:p-6',
        inDrawer && 'box-border rounded-none border-0 bg-transparent px-4 py-3 pr-5 shadow-none backdrop-blur-none',
        className,
      )}
    >
      <LocationSearchBar
        locationQuery={locationQuery}
        onLocationChange={onLocationChange}
        onAnalyze={onAnalyze}
        isSearching={isSearching}
        compact={inDrawer}
        className={cn(
          inDrawer ? 'mb-3' : 'mb-5 lg:mb-8 lg:gap-3 lg:rounded-2xl lg:px-4 lg:py-3',
        )}
      />

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-white/50">
          Loading forecast...
        </div>
      ) : forecast ? (
        <>
          <div className="space-y-0.5">
            <p
              className={cn(
                'uppercase tracking-[0.2em] text-white/45',
                inDrawer ? 'text-[10px]' : 'text-[11px]',
              )}
            >
              {forecast.location.city}, {forecast.location.country}
            </p>
            <div className="flex items-start gap-2">
              <span
                className={cn(
                  'font-light leading-none text-white',
                  inDrawer ? 'text-4xl' : 'text-5xl lg:text-7xl',
                )}
              >
                {Math.round(forecast.current.temperature)}°
              </span>
              {forecast.current.icon && (
                <img
                  src={forecast.current.icon}
                  alt=""
                  className={cn(
                    'opacity-90',
                    inDrawer ? 'mt-1 h-8 w-8' : 'mt-1 h-9 w-9 lg:mt-2 lg:h-12 lg:w-12',
                  )}
                />
              )}
            </div>
            <div
              className={cn(
                'flex gap-3 text-white/70',
                inDrawer ? 'pt-0.5 text-[11px]' : 'gap-4 pt-1 text-xs lg:gap-6 lg:pt-2 lg:text-sm',
              )}
            >
              <span>+/- {Math.round((today?.tempMax ?? 0) - (today?.tempMin ?? 0))}</span>
              <span>{today?.rainProbability ?? 0}%</span>
            </div>
            <p className={cn('text-white/55', inDrawer ? 'text-[11px]' : 'text-sm')}>
              Wind: {windDir} {windMph} mph
            </p>
          </div>

          <div className={cn(inDrawer ? 'my-3 space-y-2' : 'my-5 space-y-3 lg:my-8 lg:space-y-4')}>
            <div className="flex items-center gap-1.5">
              {['bg-amber-500', 'bg-orange-400', 'bg-yellow-300', 'bg-amber-200'].map((color) => (
                <span
                  key={color}
                  className={cn('rounded-full', inDrawer ? 'h-2 w-2' : 'h-2.5 w-2.5', color)}
                />
              ))}
            </div>
            <p className={cn('font-light text-white', inDrawer ? 'text-2xl' : 'text-3xl lg:text-5xl')}>
              <span className="text-white/40">.</span> {impactPct}%
            </p>
            <div
              className={cn(
                'grid grid-cols-2 text-white/55',
                inDrawer ? 'gap-2 text-[10px]' : 'gap-4 text-xs',
              )}
            >
              <div>
                <p className={cn('font-medium text-emerald-300', inDrawer ? 'mb-1' : 'mb-2')}>Safe</p>
                <p>0% – 12%</p>
                <p>12% – 25%</p>
              </div>
              <div>
                <p className={cn('font-medium text-amber-300', inDrawer ? 'mb-1' : 'mb-2')}>Elevated</p>
                <p>25% – 50%</p>
                <p>50% – 90%</p>
              </div>
            </div>
            <div className={cn('overflow-hidden rounded-full bg-white/10', inDrawer ? 'h-1' : 'h-1.5')}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500"
                style={{ width: `${Math.min(riskScore, 100)}%` }}
              />
            </div>
          </div>

          <MiniTrendChart hourly={forecast.hourly.slice(0, 24)} compact={inDrawer} />

          <div
            className={cn(
              inDrawer ? 'mt-3 space-y-2' : 'mt-auto space-y-3 pt-5 lg:space-y-4 lg:pt-8',
            )}
          >
            <h3 className={cn('font-medium text-white', inDrawer ? 'text-sm' : 'text-base lg:text-lg')}>
              {forecast.location.city}
            </h3>
            <p
              className={cn(
                'leading-relaxed text-white/55',
                inDrawer ? 'text-[11px] leading-5' : 'text-sm',
              )}
            >
              {getImpactSummary(riskScore)}
            </p>
            <Button
              variant="ghost"
              className={cn(
                'h-auto p-0 text-amber-300 hover:bg-transparent hover:text-amber-200',
                inDrawer ? 'text-xs' : 'text-sm',
              )}
              onClick={onOpenDetails}
            >
              See financial details
              <ArrowUpRight className={inDrawer ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            </Button>
          </div>
        </>
      ) : null}
    </aside>
  )
}

import { useMemo, useState } from 'react'
import { PanelLeft } from 'lucide-react'
import { CityComparisonChart } from '@/components/Charts/CityComparisonChart'
import { DetailsSection } from '@/components/layout/DetailsSection'
import { HeroSection } from '@/components/layout/HeroSection'
import { LocationSearchBar } from '@/components/layout/LocationSearchBar'
import { SidebarPanel } from '@/components/layout/SidebarPanel'
import { WeatherBackdrop } from '@/components/layout/WeatherBackdrop'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useActivityComparison, useImpactAnalysis } from '@/hooks/useImpactAnalysis'
import { COMPARISON_CITIES, useMultiCityWeather } from '@/hooks/useMultiCityWeather'
import { useWeather } from '@/hooks/useWeather'
import { geocodeLocation } from '@/lib/weather-api'
import { resolveWeatherBackdrop } from '@/lib/weather-backdrop'
import type { ActivityType, SensitivityMode } from '@/types/financial'

const DEFAULT_LOCATION = {
  query: 'Nairobi, Kenya',
  lat: -1.2921,
  lon: 36.8219,
  city: 'Nairobi',
}

const SENSITIVITY_LABELS: SensitivityMode[] = ['conservative', 'balanced', 'aggressive']

const CITY_COLORS = ['#f59e0b', '#ef4444', '#fbbf24', '#fb923c', '#fcd34d', '#f97316', '#fde68a']

const DETAILS_SECTION_ID = 'analysis-details'

export function DashboardPage() {
  const [locationQuery, setLocationQuery] = useState(DEFAULT_LOCATION.query)
  const [coords, setCoords] = useState({
    lat: DEFAULT_LOCATION.lat,
    lon: DEFAULT_LOCATION.lon,
    city: DEFAULT_LOCATION.city,
  })
  const [activity, setActivity] = useState<ActivityType>('farming')
  const [days, setDays] = useState(7)
  const [sensitivityIndex, setSensitivityIndex] = useState(1)
  const [shouldFetch, setShouldFetch] = useState(true)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [lastGeocodedQuery, setLastGeocodedQuery] = useState(DEFAULT_LOCATION.query)

  const sensitivity = SENSITIVITY_LABELS[sensitivityIndex] ?? 'balanced'

  const { data: forecast, isLoading, isFetching, error } = useWeather(
    coords.lat,
    coords.lon,
    days,
    coords.city,
    shouldFetch,
  )

  const cityQueries = useMultiCityWeather(COMPARISON_CITIES, shouldFetch)

  const impactConfig = useMemo(
    () => ({
      activity,
      sensitivity,
      days,
    }),
    [activity, sensitivity, days],
  )

  const analysis = useImpactAnalysis(forecast?.days, impactConfig)
  const comparison = useActivityComparison(forecast?.days, {
    sensitivity,
    days,
  })

  const comparisonCities = COMPARISON_CITIES.map((city, index) => ({
    name: city.name,
    forecast: cityQueries[index]?.data,
    color: CITY_COLORS[index % CITY_COLORS.length],
  }))

  const backdrop = resolveWeatherBackdrop(forecast)

  const scrollToDetails = () => {
    setSidebarOpen(false)
    document.getElementById(DETAILS_SECTION_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleAnalyze = async () => {
    setGeoError(null)
    const trimmedQuery = locationQuery.trim()

    if (!trimmedQuery) {
      setGeoError('Enter a location to search')
      return
    }

    if (trimmedQuery === lastGeocodedQuery) {
      setShouldFetch(true)
      return
    }

    setIsGeocoding(true)

    try {
      const geo = await geocodeLocation(trimmedQuery)
      setCoords({
        lat: geo.lat,
        lon: geo.lon,
        city: geo.city ?? geo.displayName,
      })
      setLastGeocodedQuery(trimmedQuery)
      setShouldFetch(true)
    } catch (err) {
      setGeoError(err instanceof Error ? err.message : 'Failed to resolve location')
    } finally {
      setIsGeocoding(false)
    }
  }

  const sidebarProps = {
    forecast,
    analysis,
    locationQuery,
    onLocationChange: setLocationQuery,
    onAnalyze: () => void handleAnalyze(),
    isLoading,
    isSearching: isGeocoding || isFetching,
    onOpenDetails: scrollToDetails,
  }

  return (
    <div className="relative min-h-screen text-white">
      <WeatherBackdrop forecast={forecast} />

      <div className="relative z-10 mx-auto flex max-w-[1500px] flex-col gap-4 p-3 sm:p-4 lg:flex-row lg:items-start lg:gap-6 lg:p-6">
        <div className="hidden lg:block lg:w-full lg:max-w-[340px] lg:shrink-0 lg:self-stretch">
          <SidebarPanel {...sidebarProps} />
        </div>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="rounded-none border-r border-white/10 p-0">
            <SidebarPanel {...sidebarProps} inDrawer />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-4 lg:items-stretch lg:gap-6">
          <header className="glass-panel sticky top-2 z-30 flex w-full max-w-xl flex-col gap-2 rounded-xl px-2.5 py-2 lg:top-4 lg:max-w-none lg:flex-row lg:flex-wrap lg:items-center lg:justify-between lg:gap-4 lg:rounded-[28px] lg:px-5 lg:py-4 lg:text-left">
            <div className="flex w-full items-center gap-1.5 lg:w-auto lg:gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 shrink-0 p-0 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open weather sidebar"
              >
                <PanelLeft className="h-3.5 w-3.5" />
              </Button>
              <LocationSearchBar
                locationQuery={locationQuery}
                onLocationChange={setLocationQuery}
                onAnalyze={() => void handleAnalyze()}
                isSearching={isGeocoding || isFetching}
                compact
                className="min-w-0 flex-1 lg:hidden"
              />
              <p className="hidden text-[9px] uppercase tracking-[0.15em] text-white/40 sm:text-[10px] sm:tracking-[0.2em] lg:inline lg:text-xs lg:tracking-[0.25em]">
                <span className="hidden sm:inline">Activity & sensitivity · </span>
                {backdrop.label} backdrop
              </p>
            </div>
            <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-1.5 lg:max-w-none lg:justify-start lg:gap-3">
              <Select value={activity} onValueChange={(value) => setActivity(value as ActivityType)}>
                <SelectTrigger className="h-8 w-[108px] rounded-lg border-white/10 bg-black/20 px-2 text-[11px] lg:h-10 lg:w-[140px] lg:rounded-xl lg:px-3 lg:text-sm [&_svg]:h-3.5 [&_svg]:w-3.5 lg:[&_svg]:h-4 lg:[&_svg]:w-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farming">Farming</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                </SelectContent>
              </Select>

              <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
                <SelectTrigger className="h-8 w-[88px] rounded-lg border-white/10 bg-black/20 px-2 text-[11px] lg:h-10 lg:w-[110px] lg:rounded-xl lg:px-3 lg:text-sm [&_svg]:h-3.5 [&_svg]:w-3.5 lg:[&_svg]:h-4 lg:[&_svg]:w-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                </SelectContent>
              </Select>

              <div className="w-28 lg:w-40">
                <Slider
                  value={[sensitivityIndex]}
                  onValueChange={(value) => setSensitivityIndex(value[0] ?? 1)}
                  min={0}
                  max={2}
                  step={1}
                  className="h-5 lg:h-auto [&>span:first-child]:h-1.5 lg:[&>span:first-child]:h-2 [&>span:last-child]:h-3.5 [&>span:last-child]:w-3.5 lg:[&>span:last-child]:h-5 lg:[&>span:last-child]:w-5"
                />
              </div>

              <Button
                size="sm"
                onClick={() => void handleAnalyze()}
                className="h-8 rounded-full bg-amber-500/90 px-3 text-[11px] text-black hover:bg-amber-400 lg:h-9 lg:px-4 lg:text-sm"
              >
                Analyze
              </Button>
            </div>
          </header>

          {(geoError || error) && (
            <Card className="w-full max-w-xl border-red-500/30 bg-red-500/10 text-center lg:max-w-none lg:text-left">
              <CardContent className="pt-5 text-sm text-red-200">
                {geoError ?? (error instanceof Error ? error.message : 'Failed to load weather data')}
              </CardContent>
            </Card>
          )}

          <div className="w-full max-w-xl lg:max-w-none">
            <HeroSection
              forecast={forecast}
              activity={activity}
              onOpenDetails={scrollToDetails}
            />
          </div>

          <div className="w-full max-w-xl lg:max-w-none">
            <CityComparisonChart cities={comparisonCities} />
          </div>

          <DetailsSection
            id={DETAILS_SECTION_ID}
            forecast={forecast}
            analysis={analysis}
            comparison={comparison}
            days={days}
          />
        </div>
      </div>
    </div>
  )
}

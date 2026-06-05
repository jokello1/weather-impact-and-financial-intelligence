import { useEffect, useState } from 'react'
import {
  resolveWeatherBackdrop,
  showRainOverlay,
  showStormTreatment,
} from '@/lib/weather-backdrop'
import type { WeatherForecast } from '@/types/weather'

interface WeatherBackdropProps {
  forecast?: WeatherForecast
}

export function WeatherBackdrop({ forecast }: WeatherBackdropProps) {
  const backdrop = resolveWeatherBackdrop(forecast)
  const [displayed, setDisplayed] = useState(backdrop)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (backdrop.variant === displayed.variant && backdrop.image === displayed.image) return

    setVisible(false)
    const timer = window.setTimeout(() => {
      setDisplayed(backdrop)
      setVisible(true)
    }, 200)

    return () => window.clearTimeout(timer)
  }, [backdrop, displayed.variant, displayed.image])

  const rainOverlay = showRainOverlay(displayed.variant)
  const stormTreatment = showStormTreatment(displayed.variant)

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        key={displayed.image}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out"
        style={{
          backgroundImage: `url('${displayed.image}')`,
          opacity: visible ? 1 : 0,
          transform: 'scale(1.05)',
          filter: stormTreatment
            ? 'grayscale(0.2) contrast(1.05)'
            : displayed.variant === 'sunny-clear'
              ? 'brightness(1.02) saturate(1.1)'
              : displayed.variant === 'rain-heavy'
                ? 'contrast(1.05)'
                : 'none',
        }}
      />

      {rainOverlay && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            stormTreatment ? 'storm-rain-glass' : 'rain-overlay-light'
          }`}
          style={{ opacity: visible ? (stormTreatment ? 0.45 : 0.28) : 0 }}
        />
      )}

      <div
        className={`absolute inset-0 bg-gradient-to-br ${displayed.overlay} transition-opacity duration-700 ease-in-out`}
        style={{ opacity: visible ? 1 : 0.7 }}
      />
    </div>
  )
}

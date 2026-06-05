import { Loader2, Search, Thermometer } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface LocationSearchBarProps {
  locationQuery: string
  onLocationChange: (value: string) => void
  onAnalyze: () => void
  isSearching?: boolean
  compact?: boolean
  className?: string
}

export function LocationSearchBar({
  locationQuery,
  onLocationChange,
  onAnalyze,
  isSearching,
  compact,
  className,
}: LocationSearchBarProps) {
  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2',
        compact && 'gap-1.5 rounded-lg px-2.5 py-1.5',
        className,
      )}
    >
      <Thermometer className={cn('shrink-0 text-amber-300', compact ? 'h-3.5 w-3.5' : 'h-4 w-4 lg:h-5 lg:w-5')} />
      <Input
        value={locationQuery}
        onChange={(event) => onLocationChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onAnalyze()
        }}
        className={cn(
          'min-w-0 flex-1 border-0 bg-transparent px-0 text-white shadow-none focus-visible:ring-0',
          compact ? 'h-7 text-xs' : 'h-8 text-sm',
        )}
        placeholder="Search location"
      />
      <button
        type="button"
        onClick={onAnalyze}
        className="shrink-0 text-white/70 transition hover:text-amber-300"
        aria-label="Search location"
      >
        {isSearching ? (
          <Loader2 className={cn('animate-spin', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
        ) : (
          <Search className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        )}
      </button>
    </div>
  )
}

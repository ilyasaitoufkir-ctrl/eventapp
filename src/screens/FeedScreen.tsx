import { useState, useMemo, useRef } from 'react'
import { Search, ChevronDown, RefreshCw } from 'lucide-react'
import { events } from '../data/events'
import type { Category, City, Event } from '../types'
import EventCard from '../components/EventCard'
import SkeletonCard from '../components/SkeletonCard'

const filters: { label: string; emoji: string; value: Category }[] = [
  { label: 'Diese Woche', emoji: '🔥', value: 'Diese Woche' },
  { label: 'Heute', emoji: '📅', value: 'Heute' },
  { label: 'Konzerte', emoji: '🎵', value: 'Konzert' },
  { label: 'Partys', emoji: '🎉', value: 'Party' },
  { label: 'Sport', emoji: '⚽', value: 'Sport' },
  { label: 'Kultur', emoji: '🎭', value: 'Kultur' },
  { label: 'Food & Drinks', emoji: '🍕', value: 'Food & Drinks' },
  { label: 'Kunst', emoji: '🎨', value: 'Kunst' },
]

const TODAY = '2026-07-21'
const WEEK_END = '2026-07-27'

interface Props {
  city: City
  onCityChange: () => void
  onEventClick: (event: Event) => void
  onSearchClick: () => void
}

export default function FeedScreen({ city, onCityChange, onEventClick, onSearchClick }: Props) {
  const [activeFilter, setActiveFilter] = useState<Category>('Diese Woche')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const cityEmoji: Record<City, string> = {
    Hamburg: '🏙️',
    Berlin: '🏛️',
    Köln: '🎪',
    Düsseldorf: '🌆',
    München: '🍺',
  }

  const filtered = useMemo(() => {
    let base = events.filter(e => e.city === city)
    if (activeFilter === 'Heute') return base.filter(e => e.date === TODAY)
    if (activeFilter === 'Diese Woche') return base.filter(e => e.date >= TODAY && e.date <= WEEK_END)
    if (activeFilter === 'Konzert' || activeFilter === 'Party' || activeFilter === 'Sport' ||
        activeFilter === 'Kultur' || activeFilter === 'Food & Drinks' || activeFilter === 'Kunst') {
      return base.filter(e => e.category === activeFilter)
    }
    return base
  }, [city, activeFilter])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1200)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="glass sticky top-0 z-30 border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-xl font-black gradient-text tracking-tight">Eventful</span>

          <button
            onClick={onCityChange}
            className="flex items-center gap-1.5 bg-white/8 hover:bg-white/12 transition-colors rounded-full px-3 py-1.5"
          >
            <span className="text-base">{cityEmoji[city]}</span>
            <span className="text-white font-semibold text-sm">{city}</span>
            <ChevronDown size={14} className="text-[var(--text-secondary)]" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-white/12 transition-colors"
            >
              <RefreshCw size={16} className={`text-white/70 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onSearchClick}
              className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-white/12 transition-colors"
            >
              <Search size={16} className="text-white/70" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div ref={scrollRef} className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {filters.map(f => (
            <button
              key={f.value}
              className={`filter-pill ${activeFilter === f.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.value)}
            >
              <span>{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 page-enter">
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🎭</div>
            <div className="text-white font-bold text-lg mb-2">Keine Events gefunden</div>
            <div className="text-[var(--text-secondary)] text-sm">
              Versuche einen anderen Filter
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onEventClick(event)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

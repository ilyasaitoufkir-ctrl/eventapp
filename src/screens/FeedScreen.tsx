import { useMemo, useRef, useState } from 'react'
import { Search, ChevronDown, RefreshCw, MapPin, Wifi, WifiOff } from 'lucide-react'
import type { Category, City, Event } from '../types'
import { useEvents } from '../hooks/useEvents'
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

const TODAY = new Date().toISOString().split('T')[0]
const WEEK_END = (() => {
  const d = new Date()
  d.setDate(d.getDate() + (7 - d.getDay() || 7))
  return d.toISOString().split('T')[0]
})()

const cityEmoji: Record<City, string> = {
  Hamburg: '🏙️',
  Berlin: '🏛️',
  Köln: '🎪',
  Düsseldorf: '🌆',
  München: '🍺',
}

interface Props {
  city: City
  onCityChange: () => void
  onEventClick: (event: Event) => void
  onSearchClick: () => void
}

export default function FeedScreen({ city, onCityChange, onEventClick, onSearchClick }: Props) {
  const [activeFilter, setActiveFilter] = useState<Category>('Diese Woche')
  const scrollRef = useRef<HTMLDivElement>(null)
  const { events, loading, apiSource, refresh } = useEvents(city)

  const filtered = useMemo(() => {
    if (activeFilter === 'Heute') return events.filter(e => e.date === TODAY)
    if (activeFilter === 'Diese Woche') return events.filter(e => e.date >= TODAY && e.date <= WEEK_END)
    if (
      activeFilter === 'Konzert' || activeFilter === 'Party' || activeFilter === 'Sport' ||
      activeFilter === 'Kultur' || activeFilter === 'Food & Drinks' || activeFilter === 'Kunst' ||
      activeFilter === 'Sonstiges'
    ) {
      return events.filter(e => e.category === activeFilter)
    }
    return events
  }, [events, activeFilter])

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="glass sticky top-0 z-30 border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <span className="text-xl font-black gradient-text tracking-tight">Eventilo</span>

          {/* City selector */}
          <button
            onClick={onCityChange}
            className="flex items-center gap-2 rounded-2xl px-3.5 py-2 border border-[var(--primary)]/30 bg-[var(--primary)]/8 hover:bg-[var(--primary)]/15 transition-all"
          >
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-[var(--primary)]" />
              <span className="text-white font-bold text-sm">{city}</span>
            </div>
            <span className="text-lg leading-none">{cityEmoji[city]}</span>
            <ChevronDown size={13} className="text-[var(--primary)]" />
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-white/12 transition-colors"
              title="Neu laden"
            >
              <RefreshCw size={15} className={`text-white/70 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onSearchClick}
              className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center hover:bg-white/12 transition-colors"
            >
              <Search size={15} className="text-white/70" />
            </button>
          </div>
        </div>

        {/* API source indicator */}
        {!loading && (
          <div className="flex items-center gap-1.5 px-4 pb-1.5">
            {apiSource ? (
              <Wifi size={10} className="text-green-400" />
            ) : (
              <WifiOff size={10} className="text-[var(--text-secondary)]" />
            )}
            <span className="text-[10px] text-[var(--text-secondary)]">
              {apiSource ? 'Live via Eventim' : 'Lokale Events (Offline-Fallback)'}
            </span>
          </div>
        )}

        {/* Filter bar */}
        <div
          ref={scrollRef}
          className="flex gap-2 px-4 pb-3 overflow-x-auto"
          style={{ maskImage: 'linear-gradient(to right, transparent 0, black 16px, black calc(100% - 16px), transparent 100%)' }}
        >
          {filters.map(f => (
            <button
              key={f.value}
              className={`filter-pill shrink-0 ${activeFilter === f.value ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.value)}
            >
              <span>{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 page-enter">
        {loading ? (
          <div className="flex flex-col gap-5">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
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
          <div className="flex flex-col gap-5">
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

import { useState } from 'react'
import { ArrowLeft, Search, X } from 'lucide-react'
import type { Event } from '../types'
import { getAllCachedEvents } from '../hooks/useEvents'
import EventCard from '../components/EventCard'

interface Props {
  onBack: () => void
  onEventClick: (event: Event) => void
}

export default function SearchScreen({ onBack, onEventClick }: Props) {
  const [query, setQuery] = useState('')

  const allEvents = getAllCachedEvents()

  const results = query.trim().length < 2
    ? []
    : allEvents.filter(e => {
        const q = query.toLowerCase()
        return (
          e.name.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q)
        )
      })

  return (
    <div className="min-h-screen bg-[var(--bg)] page-enter">
      {/* Search header */}
      <div className="glass sticky top-0 z-30 border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              autoFocus
              type="text"
              placeholder="Event, Ort, Stadt oder Kategorie..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-white/8 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-white text-sm placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--primary)]/50 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X size={14} className="text-[var(--text-secondary)]" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="py-4">
        {query.trim().length < 2 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-white font-bold text-lg mb-2">Events suchen</div>
            <div className="text-[var(--text-secondary)] text-sm max-w-xs">
              Suche in allen Städten – Eventim Live-Daten werden berücksichtigt
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="text-5xl mb-4">😕</div>
            <div className="text-white font-bold text-lg mb-2">Nichts gefunden</div>
            <div className="text-[var(--text-secondary)] text-sm">
              Versuche einen anderen Suchbegriff
            </div>
          </div>
        ) : (
          <>
            <p className="text-[var(--text-secondary)] text-sm mb-2 px-4">
              {results.length} {results.length === 1 ? 'Event' : 'Events'} gefunden
            </p>
            <div className="flex flex-col">
              {results.map(event => (
                <EventCard key={event.id} event={event} onClick={() => onEventClick(event)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

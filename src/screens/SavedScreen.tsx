import { ArrowLeft } from 'lucide-react'
import type { Event } from '../types'
import { getAllCachedEvents } from '../hooks/useEvents'
import EventCard from '../components/EventCard'

interface Props {
  savedIds: (number | string)[]
  onBack: () => void
  onEventClick: (event: Event) => void
}

export default function SavedScreen({ savedIds, onBack, onEventClick }: Props) {
  const saved = getAllCachedEvents().filter(e => savedIds.includes(e.id))

  return (
    <div className="min-h-screen bg-[var(--bg)] page-enter">
      <div className="glass sticky top-0 z-30 border-b border-white/5 flex items-center gap-3 px-4 py-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg">Gespeicherte Events</h1>
          <p className="text-[var(--text-secondary)] text-xs">{saved.length} Events</p>
        </div>
      </div>

      <div className="px-4 py-4">
        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">❤️</div>
            <div className="text-white font-bold text-lg mb-2">Noch nichts gespeichert</div>
            <div className="text-[var(--text-secondary)] text-sm">
              Tippe auf das Herz-Icon bei einem Event
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {saved.map(event => (
              <EventCard key={event.id} event={event} onClick={() => onEventClick(event)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

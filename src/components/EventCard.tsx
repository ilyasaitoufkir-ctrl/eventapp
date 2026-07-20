import { MapPin, Clock, Ticket } from 'lucide-react'
import type { Event } from '../types'
import CategoryBadge from './CategoryBadge'

interface Props {
  event: Event
  onClick: () => void
  saved?: boolean
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function EventCard({ event, onClick }: Props) {
  return (
    <div className="event-card" onClick={onClick}>
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <CategoryBadge category={event.category} />
        </div>
        {event.available === 'Ausverkauft' && (
          <div className="absolute top-3 right-3 bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
            Ausverkauft
          </div>
        )}
        {event.available === 'Wenige Plätze' && (
          <div className="absolute top-3 right-3 bg-orange-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
            Fast weg!
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="text-white/80 text-xs font-medium mb-1">
            {formatDate(event.date)} · {event.time} Uhr
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-bold text-base leading-tight mb-2 line-clamp-2">
          {event.name}
        </h3>

        <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm mb-3">
          <MapPin size={13} className="shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm">
            <Clock size={13} />
            <span>{event.time} Uhr</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--primary)] text-sm font-semibold">
            <Ticket size={13} />
            <span>{event.price}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

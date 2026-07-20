import { MapPin, Clock, Ticket, ImageOff } from 'lucide-react'
import { useState } from 'react'
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
  const [imgError, setImgError] = useState(false)

  return (
    <div
      className="event-card"
      onClick={onClick}
    >
      <div className="relative overflow-hidden" style={{ height: '200px', borderRadius: '24px 24px 0 0' }}>
        {imgError || !event.image ? (
          <div className="w-full h-full bg-[var(--bg-card-hover)] flex flex-col items-center justify-center gap-2">
            <ImageOff size={32} className="text-white/20" />
            <span className="text-white/30 text-xs">Kein Bild verfügbar</span>
          </div>
        ) : (
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <CategoryBadge category={event.category} />
        </div>
        {event.available === 'Ausverkauft' && (
          <div className="absolute top-3 right-3 bg-red-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            Ausverkauft
          </div>
        )}
        {event.available === 'Wenige Plätze' && (
          <div className="absolute top-3 right-3 bg-orange-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            Fast weg!
          </div>
        )}
        <div className="absolute bottom-3 left-4 right-4">
          <div className="text-white/70 text-xs font-medium">
            {formatDate(event.date)} · {event.time} Uhr
          </div>
        </div>
      </div>

      <div className="px-4 pt-3.5 pb-4">
        <h3 className="text-white font-bold leading-snug mb-2.5 line-clamp-2" style={{ fontSize: '18px' }}>
          {event.name}
        </h3>

        <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm mb-3.5">
          <MapPin size={13} className="shrink-0 text-[var(--primary)]" />
          <span className="truncate">{event.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-sm">
            <Clock size={13} className="text-[var(--text-secondary)]" />
            <span>{event.time} Uhr</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-bold px-3 py-1 rounded-full border border-[var(--primary)]/20">
            <Ticket size={12} />
            <span>{event.price}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

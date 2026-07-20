import {
  ArrowLeft, Share2, Heart, MapPin, Clock, Calendar,
  Ticket, Globe, Navigation, User
} from 'lucide-react'
import type { Event } from '../types'
import CategoryBadge from '../components/CategoryBadge'

interface Props {
  event: Event
  saved: boolean
  onBack: () => void
  onSave: () => void
}

function formatDateLong(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
    </svg>
  )
}

export default function DetailScreen({ event, saved, onBack, onSave }: Props) {
  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: event.name, text: `${event.name} – ${event.location}`, url: event.ticketUrl })
    } else {
      navigator.clipboard.writeText(event.ticketUrl)
    }
  }

  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(event.location)}`

  return (
    <div className="min-h-screen bg-[var(--bg)] page-enter">
      {/* Hero image */}
      <div className="relative h-72 sm:h-96">
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-black/30 to-transparent" />

        {/* Top buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full glass flex items-center justify-center border border-white/10"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={share}
              className="w-10 h-10 rounded-full glass flex items-center justify-center border border-white/10"
            >
              <Share2 size={16} className="text-white" />
            </button>
            <button
              onClick={onSave}
              className={`w-10 h-10 rounded-full glass flex items-center justify-center border transition-colors ${saved ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-white/10 text-white'}`}
            >
              <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 left-4">
          <CategoryBadge category={event.category} />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-5 space-y-6 pb-10">
        {/* Title */}
        <div>
          <h1 className="text-white text-2xl font-black leading-tight mb-3">{event.name}</h1>
          <div className="flex flex-wrap gap-3">
            {event.available && event.available !== 'Verfügbar' && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                event.available === 'Ausverkauft'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : event.available === 'Wenige Plätze' || event.available === 'Fast weg!'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {event.available}
              </span>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="bg-[var(--bg-card)] rounded-2xl p-4 space-y-3.5 border border-white/5">
          <div className="flex items-start gap-3">
            <Calendar size={17} className="text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <div className="text-[var(--text-secondary)] text-xs mb-0.5">Datum</div>
              <div className="text-white text-sm font-medium">{formatDateLong(event.date)}</div>
            </div>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex items-start gap-3">
            <Clock size={17} className="text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <div className="text-[var(--text-secondary)] text-xs mb-0.5">Uhrzeit</div>
              <div className="text-white text-sm font-medium">{event.time} Uhr</div>
            </div>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex items-start gap-3">
            <MapPin size={17} className="text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <div className="text-[var(--text-secondary)] text-xs mb-0.5">Location</div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-sm font-medium hover:text-[var(--primary)] transition-colors"
              >
                {event.location}
              </a>
            </div>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex items-start gap-3">
            <Ticket size={17} className="text-[var(--primary)] shrink-0 mt-0.5" />
            <div>
              <div className="text-[var(--text-secondary)] text-xs mb-0.5">Preis</div>
              <div className="text-white text-sm font-medium">{event.price}</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-white font-bold text-base mb-2">Über das Event</h3>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{event.description}</p>
        </div>

        {/* Organizer */}
        {event.organizer && (
          <div className="bg-[var(--bg-card)] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary-glow)] border border-[var(--primary)]/30 flex items-center justify-center">
                <User size={18} className="text-[var(--primary)]" />
              </div>
              <div>
                <div className="text-[var(--text-secondary)] text-xs">Veranstalter</div>
                <div className="text-white font-semibold text-sm">{event.organizer}</div>
              </div>
            </div>
            {(event.instagram || event.website || event.tiktok) && (
              <div className="flex gap-2">
                {event.instagram && (
                  <a
                    href={event.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-xl text-xs font-semibold hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                  >
                    <InstagramIcon size={13} />
                    Instagram
                  </a>
                )}
                {event.tiktok && (
                  <a
                    href={event.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-black/40 border border-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-black/60 transition-all"
                  >
                    <TikTokIcon size={13} />
                    TikTok
                  </a>
                )}
                {event.website && (
                  <a
                    href={event.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-white/8 border border-white/10 text-white/80 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-white/12 transition-all"
                  >
                    <Globe size={13} />
                    Website
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <Ticket size={18} />
            Tickets kaufen
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <Navigation size={18} />
            Route planen
          </a>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={share} className="btn-secondary">
              <Share2 size={16} />
              Teilen
            </button>
            <button
              onClick={onSave}
              className={`btn-secondary ${saved ? '!border-[var(--accent)] !text-[var(--accent)]' : ''}`}
            >
              <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
              {saved ? 'Gespeichert' : 'Merken'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

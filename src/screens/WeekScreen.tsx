import { ArrowLeft, MapPin, Clock } from 'lucide-react'
import { events } from '../data/events'
import type { City, Event } from '../types'
import CategoryBadge from '../components/CategoryBadge'

const WEEK_DAYS = [
  { date: '2026-07-21', label: 'Mo', full: 'Montag, 21. Juli' },
  { date: '2026-07-22', label: 'Di', full: 'Dienstag, 22. Juli' },
  { date: '2026-07-23', label: 'Mi', full: 'Mittwoch, 23. Juli' },
  { date: '2026-07-24', label: 'Do', full: 'Donnerstag, 24. Juli' },
  { date: '2026-07-25', label: 'Fr', full: 'Freitag, 25. Juli' },
  { date: '2026-07-26', label: 'Sa', full: 'Samstag, 26. Juli' },
  { date: '2026-07-27', label: 'So', full: 'Sonntag, 27. Juli' },
]

interface Props {
  city: City
  onBack: () => void
  onEventClick: (event: Event) => void
}

export default function WeekScreen({ city, onBack, onEventClick }: Props) {
  const cityEvents = events.filter(e => e.city === city)

  return (
    <div className="min-h-screen bg-[var(--bg)] page-enter">
      {/* Header */}
      <div className="glass sticky top-0 z-30 border-b border-white/5 flex items-center gap-3 px-4 py-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg">Diese Woche</h1>
          <p className="text-[var(--text-secondary)] text-xs">21. – 27. Juli 2026 · {city}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {WEEK_DAYS.map(day => {
          const dayEvents = cityEvents.filter(e => e.date === day.date)
          return (
            <div key={day.date}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-full flex flex-col items-center justify-center text-xs font-bold ${
                  day.date === '2026-07-21'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-white/8 text-[var(--text-secondary)]'
                }`}>
                  <span>{day.label}</span>
                </div>
                <div>
                  <span className={`font-semibold text-sm ${day.date === '2026-07-21' ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                    {day.full}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="ml-2 text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 rounded-full font-medium">
                      {dayEvents.length} Events
                    </span>
                  )}
                </div>
              </div>

              {dayEvents.length === 0 ? (
                <div className="ml-12 py-3 text-[var(--text-secondary)] text-sm italic">
                  Keine Events an diesem Tag
                </div>
              ) : (
                <div className="ml-12 space-y-2">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="bg-[var(--bg-card)] border border-white/5 rounded-2xl p-3 flex gap-3 cursor-pointer hover:border-[var(--primary)]/30 hover:bg-[var(--bg-card-hover)] transition-all"
                    >
                      <img
                        src={event.image}
                        alt={event.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="mb-1">
                          <CategoryBadge category={event.category} small />
                        </div>
                        <div className="text-white font-semibold text-sm leading-tight truncate">
                          {event.name}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[var(--text-secondary)] text-xs">
                          <Clock size={11} />
                          <span>{event.time} Uhr</span>
                          <span className="mx-1">·</span>
                          <MapPin size={11} />
                          <span className="truncate">{event.location.split(',')[0]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Timeline line */}
              <div className="ml-4 border-l border-white/5 h-2 mt-2" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { ArrowLeft, MapPin, Clock } from 'lucide-react'
import type { City, Event } from '../types'
import { useEvents } from '../hooks/useEvents'
import CategoryBadge from '../components/CategoryBadge'
import SkeletonCard from '../components/SkeletonCard'

function buildWeekDays() {
  const days = []
  const base = new Date('2026-07-21') // week start
  const labels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
  const fullLabels = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
  for (let i = 0; i < 7; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    const date = d.toISOString().split('T')[0]
    const day = d.getDate()
    const month = d.toLocaleDateString('de-DE', { month: 'long' })
    days.push({ date, label: labels[i], full: `${fullLabels[i]}, ${day}. ${month}` })
  }
  return days
}

const WEEK_DAYS = buildWeekDays()
const TODAY = new Date().toISOString().split('T')[0]

interface Props {
  city: City
  onBack: () => void
  onEventClick: (event: Event) => void
}

export default function WeekScreen({ city, onBack, onEventClick }: Props) {
  const { events, loading } = useEvents(city)

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
          <p className="text-[var(--text-secondary)] text-xs">
            {WEEK_DAYS[0].full.split(',')[1]?.trim()} – {WEEK_DAYS[6].full.split(',')[1]?.trim()} · {city}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="px-4 py-4 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="px-4 py-4 space-y-6">
          {WEEK_DAYS.map(day => {
            const dayEvents = events.filter(e => e.date === day.date)
            const isToday = day.date === TODAY
            return (
              <div key={day.date}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-full flex flex-col items-center justify-center text-xs font-bold shrink-0 ${
                    isToday ? 'bg-[var(--primary)] text-white' : 'bg-white/8 text-[var(--text-secondary)]'
                  }`}>
                    {day.label}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm ${isToday ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                      {day.full}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-0.5 rounded-full font-medium">
                        {dayEvents.length} {dayEvents.length === 1 ? 'Event' : 'Events'}
                      </span>
                    )}
                  </div>
                </div>

                {dayEvents.length === 0 ? (
                  <div className="ml-12 py-2 text-[var(--text-secondary)] text-sm italic">
                    Keine Events
                  </div>
                ) : (
                  <div className="ml-12 space-y-2">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="bg-[var(--bg-card)] border border-white/5 rounded-2xl p-3 flex gap-3 cursor-pointer hover:border-[var(--primary)]/30 hover:bg-[var(--bg-card-hover)] transition-all"
                      >
                        {event.image ? (
                          <img
                            src={event.image}
                            alt={event.name}
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-white/5 shrink-0 flex items-center justify-center text-2xl">
                            🎟️
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="mb-1">
                            <CategoryBadge category={event.category} small />
                          </div>
                          <div className="text-white font-semibold text-sm leading-tight line-clamp-2">
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

                <div className="ml-4 border-l border-white/5 h-2 mt-2" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

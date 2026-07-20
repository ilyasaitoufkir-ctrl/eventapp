import { Home, CalendarDays, Heart, Search } from 'lucide-react'

type Tab = 'feed' | 'week' | 'saved' | 'search'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
  savedCount: number
}

const tabs = [
  { id: 'feed' as Tab, label: 'Events', Icon: Home },
  { id: 'week' as Tab, label: 'Woche', Icon: CalendarDays },
  { id: 'search' as Tab, label: 'Suche', Icon: Search },
  { id: 'saved' as Tab, label: 'Gemerkt', Icon: Heart },
]

export default function TabBar({ active, onChange, savedCount }: Props) {
  return (
    <div
      className="glass fixed bottom-0 left-0 right-0 z-40 border-t border-white/5"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-1 relative"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-colors ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}
                  fill={isActive && id === 'feed' ? 'currentColor' : 'none'}
                />
                {id === 'saved' && savedCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[var(--accent)] rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                    {savedCount > 9 ? '9+' : savedCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}
              >
                {label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[var(--primary)] rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

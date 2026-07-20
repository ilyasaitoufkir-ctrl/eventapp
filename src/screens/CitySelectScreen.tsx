import { cities } from '../data/cities'
import type { City } from '../types'

interface Props {
  onSelect: (city: City) => void
}

export default function CitySelectScreen({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col page-enter">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[var(--primary)] opacity-5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[var(--accent)] opacity-5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-5 pt-16 pb-10 max-w-lg mx-auto w-full">
        {/* Logo */}
        <div className="mb-2 text-5xl font-black tracking-tight gradient-text">
          Eventilo
        </div>
        <p className="text-[var(--text-secondary)] text-sm mb-10">
          Die Premium Event App für Deutschland
        </p>

        <h2 className="text-white text-2xl font-bold mb-2 text-center">
          Wähle deine Stadt
        </h2>
        <p className="text-[var(--text-secondary)] text-sm mb-8 text-center">
          Entdecke die besten Events in deiner Nähe
        </p>

        {/* City grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {cities.map(city => (
            <div
              key={city.name}
              className="city-card h-40"
              onClick={() => onSelect(city.name)}
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-2xl mb-1">{city.emoji}</div>
                <div className="text-white font-bold text-base leading-tight">
                  {city.name}
                </div>
                <div className="text-white/60 text-xs mt-0.5">
                  {city.tagline}
                </div>
              </div>
            </div>
          ))}

          {/* Coming soon */}
          <div className="city-card h-40 opacity-40 cursor-not-allowed">
            <div className="w-full h-full bg-[var(--bg-card)] flex flex-col items-center justify-center">
              <div className="text-3xl mb-2">➕</div>
              <div className="text-white font-bold text-sm">Weitere Städte</div>
              <div className="text-[var(--text-secondary)] text-xs mt-1">Coming soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

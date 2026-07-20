import type { Event } from '../types'

const categoryColors: Record<string, string> = {
  Konzert: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  Party: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  Sport: 'bg-green-500/20 text-green-300 border border-green-500/30',
  Kultur: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  'Food & Drinks': 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  Kunst: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  Sonstiges: 'bg-white/10 text-white/60 border border-white/10',
}

const categoryEmoji: Record<string, string> = {
  Konzert: '🎵',
  Party: '🎉',
  Sport: '⚽',
  Kultur: '🎭',
  'Food & Drinks': '🍕',
  Kunst: '🎨',
  Sonstiges: '🎟️',
}

interface Props {
  category: Event['category']
  small?: boolean
}

export default function CategoryBadge({ category, small }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${small ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1'} ${categoryColors[category] ?? 'bg-white/10 text-white/60 border border-white/10'}`}
    >
      <span>{categoryEmoji[category] ?? '🎟️'}</span>
      {category}
    </span>
  )
}

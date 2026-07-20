import type { City } from '../types'

export interface CityInfo {
  name: City
  emoji: string
  image: string
  tagline: string
}

export const cities: CityInfo[] = [
  {
    name: 'Hamburg',
    emoji: '🏙️',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    tagline: 'Die Perle des Nordens',
  },
  {
    name: 'Berlin',
    emoji: '🏛️',
    image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600&q=80',
    tagline: 'Arm aber sexy',
  },
  {
    name: 'Köln',
    emoji: '🎪',
    image: 'https://images.unsplash.com/photo-1618944913736-4cedd2ee86a7?w=600&q=80',
    tagline: 'Mer losse d\'r Dom in Kölle',
  },
  {
    name: 'Düsseldorf',
    emoji: '🌆',
    image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=600&q=80',
    tagline: 'Die schönste Tochter Kölns',
  },
  {
    name: 'München',
    emoji: '🍺',
    image: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=600&q=80',
    tagline: 'Weltstadt mit Herz',
  },
]

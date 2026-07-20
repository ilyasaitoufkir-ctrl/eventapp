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
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80',
    tagline: 'Die Perle des Nordens',
  },
  {
    name: 'Berlin',
    emoji: '🏛️',
    image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80',
    tagline: 'Arm aber sexy',
  },
  {
    name: 'Köln',
    emoji: '🎪',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
    tagline: 'Mer losse d\'r Dom in Kölle',
  },
  {
    name: 'Düsseldorf',
    emoji: '🌆',
    image: 'https://images.unsplash.com/photo-1587330979470-3595ac045ab0?w=800&q=80',
    tagline: 'Die schönste Tochter Kölns',
  },
  {
    name: 'München',
    emoji: '🍺',
    image: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&q=80',
    tagline: 'Weltstadt mit Herz',
  },
]

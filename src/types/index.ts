export type City = 'Hamburg' | 'Berlin' | 'Köln' | 'Düsseldorf' | 'München'

export type Category =
  | 'Alle'
  | 'Heute'
  | 'Diese Woche'
  | 'Konzert'
  | 'Party'
  | 'Sport'
  | 'Kultur'
  | 'Food & Drinks'
  | 'Kunst'
  | 'Sonstiges'

export interface Event {
  id: number | string
  name: string
  category: Exclude<Category, 'Alle' | 'Heute' | 'Diese Woche'>
  date: string
  time: string
  location: string
  city: City
  price: string
  image?: string
  description?: string
  ticketUrl: string
  instagram?: string
  website?: string
  tiktok?: string
  organizer?: string
  organizerLogo?: string
  available?: string
  source?: string
}

export type Screen = 'city-select' | 'feed' | 'detail' | 'week' | 'search' | 'saved'

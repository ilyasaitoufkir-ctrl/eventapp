import { useState, useEffect } from 'react'
import type { City, Event } from '../types'
import { events as hardcoded } from '../data/events'

type EventCategory = Event['category']

const TICKETMASTER_KEY = 'YOUR_API_KEY'

const cache = new Map<City, { data: Event[]; ts: number }>()
const TTL = 3_600_000

function isFresh(city: City) {
  const c = cache.get(city)
  return c !== undefined && Date.now() - c.ts < TTL
}

function fallback(city: City): Event[] {
  return hardcoded.filter(e => e.city === city)
}

const getCategoryImage = (category: string): string => (({
  'Konzert':       'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=90',
  'Party':         'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=90',
  'Sport':         'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=90',
  'Kunst':         'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200&q=90',
  'Kultur':        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=90',
  'Food & Drinks': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=90',
  'Sonstiges':     'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=90',
} as Record<string, string>)[category] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=90')

const detectCategory = (text = ''): EventCategory => {
  const t = text.toLowerCase()
  if (t.includes('music') || t.includes('konzert') || t.includes('musik') || t.includes('rock') || t.includes('pop') || t.includes('jazz') || t.includes('festival')) return 'Konzert'
  if (t.includes('party') || t.includes('club') || t.includes('dj') || t.includes('nacht')) return 'Party'
  if (t.includes('sport') || t.includes('fußball') || t.includes('basketball') || t.includes('tennis')) return 'Sport'
  if (t.includes('kunst') || t.includes('ausstellung') || t.includes('museum')) return 'Kunst'
  if (t.includes('arts') || t.includes('theater') || t.includes('oper') || t.includes('ballet') || t.includes('comedy')) return 'Kultur'
  if (t.includes('food') || t.includes('essen') || t.includes('markt') || t.includes('wein')) return 'Food & Drinks'
  return 'Sonstiges'
}

export function getAllCachedEvents(): Event[] {
  const cities: City[] = ['Hamburg', 'Berlin', 'Köln', 'Düsseldorf', 'München']
  return cities.flatMap(c => {
    const cached = cache.get(c)
    return cached ? cached.data : fallback(c)
  })
}

export function useEvents(city: City) {
  const [events, setEvents] = useState<Event[]>(() =>
    isFresh(city) ? cache.get(city)!.data : fallback(city)
  )
  const [loading, setLoading] = useState(!isFresh(city))
  const [apiSource, setApiSource] = useState(isFresh(city))
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (isFresh(city)) {
      setEvents(cache.get(city)!.data)
      setApiSource(true)
      setLoading(false)
      return
    }

    setLoading(true)

    const loadEvents = async () => {
      try {
        const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TICKETMASTER_KEY}&city=${encodeURIComponent(city)}&countryCode=DE&size=100&sort=date,asc&locale=de-de`

        const response = await fetch(url, {
          signal: AbortSignal.timeout(15_000),
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        const today = new Date().toISOString().split('T')[0]

        type TmEvent = {
          id: string
          name: string
          url: string
          dates?: { start?: { localDate?: string; localTime?: string } }
          priceRanges?: { min: number }[]
          images?: { ratio: string; width: number; url: string }[]
          classifications?: { segment?: { name: string } }[]
          _embedded?: { venues?: { name: string }[] }
        }

        const mapped: Event[] = (data._embedded?.events || [])
          .map((e: TmEvent) => {
            const category = detectCategory(
              (e.classifications?.[0]?.segment?.name || '') + ' ' + e.name
            )
            const image = e.images?.find(img => img.ratio === '16_9' && img.width > 500)?.url
              || e.images?.[0]?.url
              || getCategoryImage(category)
            return {
              id: e.id,
              name: e.name,
              date: e.dates?.start?.localDate || '',
              time: e.dates?.start?.localTime?.slice(0, 5) || '20:00',
              location: e._embedded?.venues?.[0]?.name || city,
              city,
              price: e.priceRanges?.[0] ? `ab ${Math.round(e.priceRanges[0].min)}€` : 'Preis auf Anfrage',
              image,
              ticketUrl: e.url || 'https://www.ticketmaster.de',
              category,
              source: 'Ticketmaster',
            }
          })
          .filter((e: Event) => e.date && e.date >= today)

        if (mapped.length > 0) {
          cache.set(city, { data: mapped, ts: Date.now() })
          setEvents(mapped)
          setApiSource(true)
          console.log('Ticketmaster events:', mapped.length)
        } else {
          throw new Error('No events')
        }
      } catch (error) {
        console.error('API Error:', (error as Error).message)
        setEvents(fallback(city))
        setApiSource(false)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [city, refreshKey])

  const refresh = () => {
    cache.delete(city)
    setRefreshKey(k => k + 1)
  }

  return { events, loading, apiSource, refresh }
}

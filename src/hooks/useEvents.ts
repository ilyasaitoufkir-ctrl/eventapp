import { useState, useEffect } from 'react'
import type { City, Event } from '../types'

type EventCategory = Event['category']
import { events as hardcoded } from '../data/events'

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
  'Musical':       'https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=90',
  'Comedy':        'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=1200&q=90',
} as Record<string, string>)[category] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=90')

const detectCategory = (text = ''): EventCategory => {
  const t = text.toLowerCase()
  if (t.includes('konzert') || t.includes('musik') || t.includes('rock') || t.includes('pop') || t.includes('jazz') || t.includes('festival')) return 'Konzert'
  if (t.includes('party') || t.includes('club') || t.includes('dj') || t.includes('nacht')) return 'Party'
  if (t.includes('sport') || t.includes('fußball') || t.includes('basketball')) return 'Sport'
  if (t.includes('kunst') || t.includes('ausstellung') || t.includes('museum')) return 'Kunst'
  if (t.includes('theater') || t.includes('oper') || t.includes('ballet') || t.includes('comedy')) return 'Kultur'
  if (t.includes('musical') || t.includes('show') || t.includes('food') || t.includes('essen') || t.includes('markt')) return 'Sonstiges'
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
      const eventimUrl = `https://public-api.eventim.com/websearch/search/api/exploration/v1/products?webId=web__eventim-de&language=de&page=1&retail_partner=EVE&city_names=${encodeURIComponent(city)}&sort=DateAsc&top=100`

      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(eventimUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(eventimUrl)}`,
        `https://thingproxy.freeboard.io/fetch/${eventimUrl}`,
      ]

      let data: { products?: unknown[] } | null = null

      for (const proxyUrl of proxies) {
        try {
          console.log('Trying proxy:', proxyUrl.slice(0, 60))
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 8_000)

          const response = await fetch(proxyUrl, { signal: controller.signal })
          clearTimeout(timeout)

          console.log('Response status:', response.status)
          const json = await response.json()

          if (json.products?.length > 0) {
            data = json
            console.log('Success! Products:', json.products.length)
            break
          }
        } catch (e) {
          console.log('Proxy failed:', (e as Error).message)
        }
      }

      if (data?.products && data.products.length > 0) {
        const today = new Date().toISOString().split('T')[0]

        const mapped = data.products
          .map((p) => {
            const prod = p as Record<string, unknown>
            const le = (prod.typeAttributes as Record<string, unknown>)?.liveEntertainment as Record<string, unknown> | undefined
            const startDate = (le?.startDate as string) || ''
            const date = startDate ? startDate.split('T')[0] : ''
            const time = startDate ? (startDate.split('T')[1]?.slice(0, 5) || '20:00') : '20:00'
            const category = detectCategory(prod.name as string)

            return {
              id: `eventim-${prod.productId}`,
              name: prod.name as string,
              date,
              time,
              location: (le?.location as Record<string, string> | undefined)?.name || city,
              city,
              price: prod.price ? `ab ${prod.price}€` : 'Kostenlos',
              image: (prod.imageUrl as string) || getCategoryImage(category),
              ticketUrl: (prod.link as string) || 'https://www.eventim.de',
              category,
              source: 'Eventim',
            }
          })
          .filter((e: Event) => e.date && e.date >= today)
          .sort((a: Event, b: Event) => a.date.localeCompare(b.date))

        console.log('Final events:', mapped.length)
        cache.set(city, { data: mapped, ts: Date.now() })
        setEvents(mapped)
        setApiSource(true)
      } else {
        console.log('All proxies failed - using fallback')
        setEvents(fallback(city))
        setApiSource(false)
      }

      setLoading(false)
    }

    loadEvents()
  }, [city, refreshKey])

  const refresh = () => {
    cache.delete(city)
    setRefreshKey(k => k + 1)
  }

  return { events, loading, apiSource, refresh }
}

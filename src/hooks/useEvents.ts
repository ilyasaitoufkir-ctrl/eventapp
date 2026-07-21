import { useState, useEffect } from 'react'
import type { City, Event } from '../types'
import { events as hardcoded } from '../data/events'

type EventCategory = Event['category']

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
  if (t.includes('konzert') || t.includes('musik') || t.includes('rock') || t.includes('pop') || t.includes('jazz') || t.includes('festival')) return 'Konzert'
  if (t.includes('party') || t.includes('club') || t.includes('dj') || t.includes('nacht')) return 'Party'
  if (t.includes('sport') || t.includes('fußball') || t.includes('basketball')) return 'Sport'
  if (t.includes('kunst') || t.includes('ausstellung') || t.includes('museum')) return 'Kunst'
  if (t.includes('theater') || t.includes('oper') || t.includes('ballet') || t.includes('comedy')) return 'Kultur'
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
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15_000)

    fetch(`/api/events?city=${encodeURIComponent(city)}`, { signal: controller.signal })
      .then(r => {
        console.log('API Response Status:', r.status)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: (Event & { image?: string })[]) => {
        console.log('Events received:', data?.length, '| First:', data?.[0]?.name)
        if (!Array.isArray(data) || data.length === 0) throw new Error('empty response')

        const mapped = data.map(e => ({
          ...e,
          image: e.image || getCategoryImage(detectCategory(e.name)),
          category: detectCategory(e.name),
        }))

        cache.set(city, { data: mapped, ts: Date.now() })
        setEvents(mapped)
        setApiSource(true)
      })
      .catch(err => {
        console.error('API Error:', err.message)
        if (err.name === 'AbortError') return
        setEvents(fallback(city))
        setApiSource(false)
      })
      .finally(() => {
        clearTimeout(timeout)
        setLoading(false)
      })

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [city, refreshKey])

  const refresh = () => {
    cache.delete(city)
    setRefreshKey(k => k + 1)
  }

  return { events, loading, apiSource, refresh }
}

import { useState, useEffect } from 'react'
import type { City, Event } from '../types'
import { events as hardcoded } from '../data/events'

// Module-level cache – survives re-renders, cleared on page refresh
const cache = new Map<City, { data: Event[]; ts: number }>()
const TTL = 3_600_000 // 1 hour

function isFresh(city: City) {
  const c = cache.get(city)
  return c !== undefined && Date.now() - c.ts < TTL
}

function fallback(city: City): Event[] {
  return hardcoded.filter(e => e.city === city)
}

/** Returns all events across all cities – from cache if loaded, hardcoded otherwise */
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
    const timeout = setTimeout(() => controller.abort(), 8_000)

    fetch(`/api/events?city=${encodeURIComponent(city)}`, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json() })
      .then((data: Event[]) => {
        if (!Array.isArray(data) || data.length === 0) throw new Error('empty response')
        cache.set(city, { data, ts: Date.now() })
        setEvents(data)
        setApiSource(true)
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        console.warn(`Eventim API failed (${city}), using fallback:`, err.message)
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

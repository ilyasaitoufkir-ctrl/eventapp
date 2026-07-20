import { useState, useEffect } from 'react'

export function useSavedEvents() {
  const [saved, setSaved] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('eventilo_saved') ?? '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('eventilo_saved', JSON.stringify(saved))
  }, [saved])

  const toggle = (id: number) =>
    setSaved(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))

  const isSaved = (id: number) => saved.includes(id)

  return { saved, toggle, isSaved }
}

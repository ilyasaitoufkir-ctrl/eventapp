import { useState, useEffect } from 'react'

type Id = number | string

export function useSavedEvents() {
  const [saved, setSaved] = useState<Id[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('eventilo_saved') ?? '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('eventilo_saved', JSON.stringify(saved))
  }, [saved])

  const toggle = (id: Id) =>
    setSaved(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

  const isSaved = (id: Id) => saved.includes(id)

  return { saved, toggle, isSaved }
}

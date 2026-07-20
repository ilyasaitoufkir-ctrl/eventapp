export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')

  const { city = 'Hamburg' } = req.query

  try {
    const response = await fetch(
      `https://public-api.eventim.com/websearch/search/api/exploration/v1/products?webId=web__eventim-de&language=de&page=1&retail_partner=EVE&city_names=${encodeURIComponent(city)}&sort=DateAsc&top=50`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
          'Accept': 'application/json',
          'Accept-Language': 'de-DE,de;q=0.9',
          'Referer': 'https://www.eventim.de/',
        },
        signal: AbortSignal.timeout(10_000),
      }
    )

    if (!response.ok) {
      return res.status(response.status).json({ error: `Eventim ${response.status}` })
    }

    const data = await response.json()

    const events = (data.products ?? []).map(product => {
      // Handle date: might be "2026-07-25" or "2026-07-25T20:00:00+02:00"
      const rawDate = product.startDate ?? ''
      const date = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate

      // Handle time: might be separate field or embedded in ISO date
      let time = product.startTime ?? ''
      if (!time && rawDate.includes('T')) {
        time = rawDate.split('T')[1]?.slice(0, 5) ?? ''
      }
      if (!time) time = '20:00'
      // Normalize "20:00:00" → "20:00"
      if (time.length === 8) time = time.slice(0, 5)

      const name = product.name ?? 'Unbekanntes Event'
      const categoryText = `${name} ${product.categoryName ?? ''}`

      return {
        id: String(product.id),
        name,
        date,
        time,
        location: product.location?.name ?? city,
        city,
        price: product.minPrice != null ? `ab ${product.minPrice}€` : 'Preis auf Anfrage',
        image: product.imageUrl ?? '',
        description: '',
        ticketUrl: `https://www.eventim.de/event/${product.id}`,
        category: detectCategory(categoryText),
        organizer: product.promoterName ?? undefined,
        source: 'Eventim',
      }
    })

    res.status(200).json(events)
  } catch (error) {
    console.error('Eventim API error:', error?.message)
    res.status(500).json({ error: 'Events konnten nicht geladen werden' })
  }
}

function detectCategory(text) {
  const t = text.toLowerCase()
  if (/konzert|musik|band|live|tour|festival|rock|pop|jazz|classical|symphony|philharmonie/.test(t)) return 'Konzert'
  if (/party|club|dj|nacht|rave|techno|house|electronic|disco/.test(t)) return 'Party'
  if (/sport|fußball|football|soccer|tennis|basketball|handball|eishockey|marathon|lauf/.test(t)) return 'Sport'
  if (/kunst|ausstellung|museum|galerie|art|exhibition|vernissage/.test(t)) return 'Kunst'
  if (/theater|oper|ballet|musical|comedy|kabarett|show|bühne|revue/.test(t)) return 'Kultur'
  if (/food|essen|markt|wein|bier|kulinar|restaurant|gastro/.test(t)) return 'Food & Drinks'
  return 'Sonstiges'
}

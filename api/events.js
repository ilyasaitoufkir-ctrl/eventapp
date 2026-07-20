// Fallback images per category (used when Eventim provides no imageUrl)
const CATEGORY_IMAGES = {
  'Konzert':       'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=70',
  'Party':         'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=70',
  'Sport':         'https://images.unsplash.com/photo-1540747913346-19212a4e0954?w=600&q=70',
  'Kunst':         'https://images.unsplash.com/photo-1578926078693-4b6344ea7e23?w=600&q=70',
  'Kultur':        'https://images.unsplash.com/photo-1507901747481-84a4f64fda6d?w=600&q=70',
  'Food & Drinks': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=70',
  'Sonstiges':     'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=70',
}

function detectCategory(categoryNames, productName) {
  const text = [...categoryNames, productName].join(' ').toLowerCase()

  if (/musik|konzert|rock|pop|jazz|klassik|philharmonie|band|live.tour|open.air/.test(text)) return 'Konzert'
  if (/party|clubbing|dj.set|disco|techno|house|rave|nachtleben/.test(text)) return 'Party'
  if (/\bsport\b|fußball|football|tennis|basketball|handball|eishockey|marathon|laufen|radrennen/.test(text)) return 'Sport'
  if (/ausstellung|museum|galerie|kunsthalle|vernissage|\.art\b/.test(text)) return 'Kunst'
  if (/theater|oper|ballet|musical|comedy|kabarett|bühnenshow|revue|lesung|impro/.test(text)) return 'Kultur'
  if (/food|food.festival|kulinarisch|wein|bier|streetfood|markt|gastro/.test(text)) return 'Food & Drinks'

  // Eventim top-level category names
  if (categoryNames.some(n => /^musik$/i.test(n))) return 'Konzert'
  if (categoryNames.some(n => /^sport$/i.test(n))) return 'Sport'
  if (categoryNames.some(n => /^theater$|^oper$|^musical$/i.test(n))) return 'Kultur'
  if (categoryNames.some(n => /ausstellung|museum/i.test(n))) return 'Kunst'
  if (categoryNames.some(n => /party|club/i.test(n))) return 'Party'

  return 'Sonstiges'
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')

  const { city = 'Hamburg' } = req.query
  const today = new Date().toISOString().split('T')[0]

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
      console.error(`Eventim HTTP ${response.status} for city=${city}`)
      return res.status(response.status).json({ error: `Eventim ${response.status}` })
    }

    const data = await response.json()
    const products = data.products ?? []
    console.log(`Eventim: ${products.length} total products for ${city}`)

    const events = products
      // Filter to current + upcoming events only
      .filter(product => {
        const le = product.typeAttributes?.liveEntertainment
        if (!le) return false
        const startDate = (le.startDate ?? '').split('T')[0]
        const endDate = (le.endDate ?? '').split('T')[0]
        if (!startDate) return false
        // Keep if starts today/future, OR is an ongoing event (endDate >= today)
        return startDate >= today || (endDate && endDate >= today)
      })
      .map(product => {
        const le = product.typeAttributes?.liveEntertainment ?? {}

        // ── Date & Time ──────────────────────────────────────────────────
        const rawStart = le.startDate ?? ''
        const date = rawStart.split('T')[0] || today
        const timePart = rawStart.split('T')[1] ?? ''
        const time = timePart.slice(0, 5) || '20:00'

        // ── Category ─────────────────────────────────────────────────────
        const categoryNames = (product.categories ?? []).map(c => c.name ?? '')
        const category = detectCategory(categoryNames, product.name ?? '')

        // ── Image: use Eventim's imageUrl or category fallback ────────────
        const image = product.imageUrl || CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Sonstiges']

        // ── Price ─────────────────────────────────────────────────────────
        const price = product.price != null
          ? `ab ${String(product.price).replace('.', ',')} ${product.currency ?? 'EUR'}`
          : 'Preis auf Anfrage'

        // ── Availability ──────────────────────────────────────────────────
        const available = !product.inStock || product.status === 'SoldOut'
          ? 'Ausverkauft'
          : 'Verfügbar'

        return {
          id: String(product.productId),
          name: product.name ?? 'Unbekanntes Event',
          date,
          time,
          location: le.location?.name ?? city,
          city,
          price,
          image,
          description: product.description ?? '',
          ticketUrl: product.link ?? 'https://www.eventim.de',
          category,
          available,
          source: 'Eventim',
        }
      })

    console.log(`Eventim: returning ${events.length} mapped events for ${city}`)
    res.status(200).json(events)
  } catch (error) {
    console.error('Eventim API error:', error?.message)
    res.status(500).json({ error: 'Events konnten nicht geladen werden' })
  }
}

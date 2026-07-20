// ─── Category fallback images ─────────────────────────────────────────────────
const getCategoryImage = (category) => {
  const images = {
    'Konzert':       'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    'Party':         'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
    'Sport':         'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    'Kunst':         'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80',
    'Kultur':        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    'Food & Drinks': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    'Sonstiges':     'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  }
  return images[category] || images['Sonstiges']
}

// ─── Category detection ───────────────────────────────────────────────────────
const detectCategory = (text) => {
  const lower = (text || '').toLowerCase()
  if (lower.includes('konzert') || lower.includes('musik') || lower.includes('band') || lower.includes('live') || lower.includes('tour') || lower.includes('festival') || lower.includes('rock') || lower.includes('pop') || lower.includes('jazz')) return 'Konzert'
  if (lower.includes('party') || lower.includes('club') || lower.includes('dj') || lower.includes('nacht') || lower.includes('rave') || lower.includes('techno') || lower.includes('house')) return 'Party'
  if (lower.includes('sport') || lower.includes('fußball') || lower.includes('tennis') || lower.includes('basketball') || lower.includes('handball') || lower.includes('marathon')) return 'Sport'
  if (lower.includes('kunst') || lower.includes('ausstellung') || lower.includes('museum') || lower.includes('galerie')) return 'Kunst'
  if (lower.includes('theater') || lower.includes('oper') || lower.includes('ballet') || lower.includes('comedy') || lower.includes('kabarett') || lower.includes('musical')) return 'Kultur'
  if (lower.includes('food') || lower.includes('essen') || lower.includes('markt') || lower.includes('wein') || lower.includes('bier')) return 'Food & Drinks'
  return 'Sonstiges'
}

// ─── RSS Parser ───────────────────────────────────────────────────────────────
const parseRSS = (xml, source, city) => {
  const events = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  const titleRegex = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i
  const dateRegex = /<pubDate>(.*?)<\/pubDate>/i
  const linkRegex = /<link>(.*?)<\/link>/i
  const imageRegex = /<enclosure[^>]*url="([^"]*)"[^>]*>/i

  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1]
    const title = (titleRegex.exec(item)?.[1] || '').trim()
    const dateRaw = dateRegex.exec(item)?.[1] || ''
    const link = linkRegex.exec(item)?.[1] || ''
    const image = imageRegex.exec(item)?.[1] || ''

    if (title && title.length > 3) {
      const category = detectCategory(title)
      events.push({
        id: `${source}-${Math.random().toString(36).substr(2, 9)}`,
        name: title,
        date: dateRaw ? new Date(dateRaw).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        time: '20:00',
        location: city,
        city,
        price: 'Preis auf Anfrage',
        image: image || getCategoryImage(category),
        ticketUrl: link || '',
        category,
        source,
      })
    }
  }
  return events
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=3600')

  const { city = 'Hamburg' } = req.query
  const today = new Date().toISOString().split('T')[0]
  const allEvents = []

  // ── EVENTIM ────────────────────────────────────────────────────────────────
  try {
    const url = `https://public-api.eventim.com/websearch/search/api/exploration/v1/products?webId=web__eventim-de&language=de&page=1&retail_partner=EVE&city_names=${encodeURIComponent(city)}&sort=DateAsc&top=50`

    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'de-DE,de;q=0.9',
        'Origin': 'https://www.eventim.de',
        'Referer': 'https://www.eventim.de/',
      },
      signal: AbortSignal.timeout(10_000),
    })

    const text = await r.text()
    console.log('Eventim status:', r.status, '| response start:', text.slice(0, 200))

    const data = JSON.parse(text)
    console.log('Eventim totalResults:', data.totalResults, '| products:', data.products?.length)

    if (data.products?.length > 0) {
      const first = data.products[0]
      console.log('First product keys:', Object.keys(first))
      console.log('First product:', JSON.stringify(first).slice(0, 600))

      data.products.forEach((p, i) => {
        // ── Correct Eventim field mapping (confirmed via API inspection) ──
        const le = p.typeAttributes?.liveEntertainment ?? {}

        // Date: lives in typeAttributes.liveEntertainment.startDate as ISO string
        const rawDate = le.startDate || p.startDate || p.date || ''
        const date = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate
        const timePart = rawDate.includes('T') ? rawDate.split('T')[1]?.slice(0, 5) : ''
        const time = timePart || le.startTime || p.startTime || '20:00'

        // Skip past events
        if (date && date < today) return

        const name = p.name || p.title || `Event ${i}`
        const location = le.location?.name || p.location?.name || p.venue?.name || city
        const price = p.price || p.minPrice || null
        const image = p.imageUrl || p.image || p.images?.[0]?.url || getCategoryImage(detectCategory(name))
        const ticketUrl = p.link || p.url?.domain + p.url?.path || `https://www.eventim.de`
        const category = detectCategory(`${name} ${(p.categories ?? []).map(c => c.name ?? c).join(' ')}`)

        allEvents.push({
          id: `eventim-${p.productId || p.id || i}`,
          name,
          date,
          time,
          location,
          city,
          price: price != null ? `ab ${String(price).replace('.', ',')}€` : 'Preis auf Anfrage',
          image,
          description: p.description || '',
          ticketUrl,
          category,
          available: p.inStock === false || p.status === 'SoldOut' ? 'Ausverkauft' : 'Verfügbar',
          source: 'Eventim',
        })
      })
    }
    console.log('Eventim events added:', allEvents.length)
  } catch (e) {
    console.error('Eventim error:', e.message)
  }

  // ── RAUSGEGANGEN RSS (Hamburg Party Events) ────────────────────────────────
  if (city === 'Hamburg') {
    try {
      const r = await fetch('https://rausgegangen.de/hamburg/kategorie/party/feed/', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5_000),
      })
      const xml = await r.text()
      const parsed = parseRSS(xml, 'rausgegangen.de', 'Hamburg')
      parsed.forEach(e => {
        e.category = 'Party'
        e.image = e.image || getCategoryImage('Party')
      })
      console.log('Rausgegangen events:', parsed.length)
      allEvents.push(...parsed)
    } catch (e) {
      console.error('Rausgegangen error:', e.message)
    }
  }

  // ── HAMBURG TOURISM (HTML scrape) ─────────────────────────────────────────
  if (city === 'Hamburg') {
    try {
      const r = await fetch('https://www.hamburg-tourism.de/sehen-erleben/veranstaltungen/', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5_000),
      })
      const html = await r.text()
      const titles = html.match(/class="[^"]*title[^"]*"[^>]*>([^<]{5,100})</gi) || []

      titles.slice(0, 10).forEach((match, i) => {
        const title = match.replace(/<[^>]*>/g, '').replace(/class="[^"]*"/g, '').trim()
        if (title.length > 5 && !title.includes('{') && !title.includes('=')) {
          const category = detectCategory(title)
          allEvents.push({
            id: `tourism-${i}`,
            name: title,
            date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
            time: '20:00',
            location: 'Hamburg',
            city: 'Hamburg',
            price: 'Preis auf Anfrage',
            image: getCategoryImage(category),
            ticketUrl: 'https://www.hamburg-tourism.de/sehen-erleben/veranstaltungen/',
            category,
            source: 'hamburg-tourism.de',
          })
        }
      })
      console.log('Tourism events added')
    } catch (e) {
      console.error('Tourism error:', e.message)
    }
  }

  console.log('Total events returned:', allEvents.length)
  res.status(200).json(allEvents)
}

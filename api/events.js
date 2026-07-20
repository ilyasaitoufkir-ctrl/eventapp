const getCategoryImage = (cat) => ({
  'Konzert':       'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
  'Party':         'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
  'Sport':         'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
  'Kunst':         'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80',
  'Kultur':        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  'Food & Drinks': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
})[cat] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'

const detectCategory = (text = '') => {
  const t = text.toLowerCase()
  if (t.includes('konzert') || t.includes('musik') || t.includes('band') || t.includes('live') || t.includes('tour') || t.includes('festival') || t.includes('rock') || t.includes('pop') || t.includes('jazz')) return 'Konzert'
  if (t.includes('party') || t.includes('club') || t.includes('dj') || t.includes('nacht') || t.includes('rave') || t.includes('techno')) return 'Party'
  if (t.includes('sport') || t.includes('fußball') || t.includes('tennis') || t.includes('basketball') || t.includes('handball')) return 'Sport'
  if (t.includes('kunst') || t.includes('ausstellung') || t.includes('museum') || t.includes('galerie')) return 'Kunst'
  if (t.includes('theater') || t.includes('oper') || t.includes('ballet') || t.includes('comedy') || t.includes('musical')) return 'Kultur'
  if (t.includes('food') || t.includes('essen') || t.includes('markt') || t.includes('wein') || t.includes('bier')) return 'Food & Drinks'
  return 'Sonstiges'
}

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
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': 'https://www.eventim.de/',
      },
      signal: AbortSignal.timeout(10_000),
    })

    const data = await r.json()
    console.log('Eventim status:', r.status, '| total:', data.totalResults, '| products:', data.products?.length)

    if (data.products?.length > 0) {
      console.log('Sample product:', JSON.stringify(data.products[0]).slice(0, 600))

      const events = data.products
        .map(p => {
          const startDate = p.typeAttributes?.liveEntertainment?.startDate || ''
          const date = startDate ? startDate.split('T')[0] : ''
          const time = startDate ? (startDate.split('T')[1]?.slice(0, 5) || '20:00') : '20:00'
          const category = detectCategory(
            `${p.name} ${(p.categories ?? []).map(c => c.name ?? c).join(' ')}`
          )

          return {
            id: `eventim-${p.productId}`,
            name: p.name,
            date,
            time,
            location: p.typeAttributes?.liveEntertainment?.location?.name || city,
            city,
            price: p.price != null ? `ab ${p.price}€` : 'Preis auf Anfrage',
            image: p.imageUrl || getCategoryImage(category),
            description: p.description || '',
            ticketUrl: p.link || 'https://www.eventim.de',
            category,
            available: p.inStock === false ? 'Ausverkauft' : 'Verfügbar',
            source: 'Eventim',
          }
        })
        .filter(e => e.date && e.date >= today)

      console.log('Eventim events after filter:', events.length)
      allEvents.push(...events)
    }
  } catch (e) {
    console.error('Eventim error:', e.message)
  }

  // ── RAUSGEGANGEN RSS (Hamburg only – Party events) ─────────────────────────
  if (city === 'Hamburg' && allEvents.length < 10) {
    try {
      const r = await fetch('https://rausgegangen.de/hamburg/kategorie/party/feed/', {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5_000),
      })
      const xml = await r.text()

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
          allEvents.push({
            id: `rg-${Math.random().toString(36).slice(2, 9)}`,
            name: title,
            date: dateRaw ? new Date(dateRaw).toISOString().split('T')[0] : today,
            time: '20:00',
            location: 'Hamburg',
            city: 'Hamburg',
            price: 'Preis auf Anfrage',
            image: image || getCategoryImage('Party'),
            description: '',
            ticketUrl: link || 'https://rausgegangen.de',
            category: 'Party',
            source: 'rausgegangen.de',
          })
        }
      }
      console.log('Rausgegangen events added:', allEvents.filter(e => e.source === 'rausgegangen.de').length)
    } catch (e) {
      console.error('Rausgegangen error:', e.message)
    }
  }

  console.log('Total events returned:', allEvents.length)
  res.status(200).json(allEvents)
}

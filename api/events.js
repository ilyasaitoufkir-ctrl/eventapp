export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city') || 'Hamburg'

  try {
    const url = `https://public-api.eventim.com/websearch/search/api/exploration/v1/products?webId=web__eventim-de&language=de&page=1&retail_partner=EVE&city_names=${encodeURIComponent(city)}&sort=DateAsc&top=100`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.eventim.de/',
        'Origin': 'https://www.eventim.de',
      },
    })

    const data = await response.json()
    const today = new Date().toISOString().split('T')[0]

    const events = (data.products || [])
      .map(p => {
        const startDate = p.typeAttributes?.liveEntertainment?.startDate || ''
        const date = startDate ? startDate.split('T')[0] : ''
        const time = startDate ? (startDate.split('T')[1]?.slice(0, 5) || '20:00') : '20:00'

        return {
          id: `eventim-${p.productId}`,
          name: p.name,
          date,
          time,
          location: p.typeAttributes?.liveEntertainment?.location?.name || city,
          city,
          price: p.price ? `ab ${p.price}€` : 'Kostenlos',
          image: p.imageUrl || '',
          ticketUrl: p.link || 'https://www.eventim.de',
          category: detectCategory(p.name + ' ' + (p.categories?.[1]?.name || '')),
          source: 'Eventim',
        }
      })
      .filter(e => e.date && e.date >= today)

    return new Response(JSON.stringify(events), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=3600',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}

function detectCategory(text) {
  const t = (text || '').toLowerCase()
  if (t.includes('konzert') || t.includes('musik') || t.includes('rock') || t.includes('pop') || t.includes('jazz') || t.includes('festival')) return 'Konzert'
  if (t.includes('party') || t.includes('club') || t.includes('dj') || t.includes('nacht')) return 'Party'
  if (t.includes('sport') || t.includes('fußball') || t.includes('basketball')) return 'Sport'
  if (t.includes('kunst') || t.includes('ausstellung') || t.includes('museum')) return 'Kunst'
  if (t.includes('theater') || t.includes('oper') || t.includes('ballet') || t.includes('comedy')) return 'Kultur'
  if (t.includes('musical') || t.includes('show')) return 'Musical'
  if (t.includes('food') || t.includes('essen') || t.includes('markt')) return 'Food & Drinks'
  return 'Freizeit'
}

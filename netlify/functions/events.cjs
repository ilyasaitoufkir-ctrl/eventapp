const fetch = require('node-fetch')

function detectCategory(text = '') {
  const t = text.toLowerCase()
  if (t.includes('konzert') || t.includes('musik') || t.includes('festival') || t.includes('rock') || t.includes('pop') || t.includes('jazz')) return 'Konzert'
  if (t.includes('party') || t.includes('club') || t.includes('dj') || t.includes('nacht')) return 'Party'
  if (t.includes('sport') || t.includes('fußball') || t.includes('basketball') || t.includes('tennis')) return 'Sport'
  if (t.includes('kunst') || t.includes('museum') || t.includes('ausstellung') || t.includes('galerie')) return 'Kunst'
  if (t.includes('theater') || t.includes('oper') || t.includes('ballet') || t.includes('comedy')) return 'Kultur'
  if (t.includes('musical') || t.includes('show')) return 'Sonstiges'
  return 'Sonstiges'
}

exports.handler = async (event) => {
  const city = event.queryStringParameters?.city || 'Hamburg'

  try {
    const url = `https://public-api.eventim.com/websearch/search/api/exploration/v1/products?webId=web__eventim-de&language=de&page=1&retail_partner=EVE&city_names=${encodeURIComponent(city)}&sort=DateAsc&top=100`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.eventim.de/',
      },
    })

    const data = await response.json()
    const today = new Date().toISOString().split('T')[0]

    const events = (data.products || [])
      .map(p => ({
        id: `eventim-${p.productId}`,
        name: p.name,
        date: p.typeAttributes?.liveEntertainment?.startDate?.split('T')[0] || '',
        time: p.typeAttributes?.liveEntertainment?.startDate?.split('T')[1]?.slice(0, 5) || '20:00',
        location: p.typeAttributes?.liveEntertainment?.location?.name || city,
        city,
        price: p.price ? `ab ${p.price}€` : 'Kostenlos',
        image: p.imageUrl || '',
        ticketUrl: p.link || 'https://www.eventim.de',
        category: detectCategory(p.name),
        source: 'Eventim',
      }))
      .filter(e => e.date && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))

    console.log(`Eventim: ${events.length} events for ${city}`)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=3600',
      },
      body: JSON.stringify(events),
    }
  } catch (error) {
    console.error('Error:', error.message)
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    }
  }
}

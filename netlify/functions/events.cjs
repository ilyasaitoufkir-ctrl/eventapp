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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://www.eventim.de/',
        'Origin': 'https://www.eventim.de',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
      },
    })

    const text = await response.text()
    console.log('Response status:', response.status)
    console.log('Response preview:', text.slice(0, 200))

    if (text.startsWith('<')) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Eventim returned HTML - blocked' }),
      }
    }

    const data = JSON.parse(text)
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

    console.log(`Returning ${events.length} events for ${city}`)

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

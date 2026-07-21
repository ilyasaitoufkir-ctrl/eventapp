const getCategoryImage = (category) => ({
  'Konzert':       'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
  'Party':         'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
  'Sport':         'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
  'Kunst':         'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80',
  'Kultur':        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  'Food & Drinks': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  'Musical':       'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80',
  'Comedy':        'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&q=80',
})[category] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'

const detectCategory = (text = '') => {
  const t = text.toLowerCase()
  if (t.includes('konzert') || t.includes('musik') || t.includes('rock') || t.includes('pop') || t.includes('jazz') || t.includes('festival')) return 'Konzert'
  if (t.includes('party') || t.includes('club') || t.includes('dj') || t.includes('nacht') || t.includes('electronic')) return 'Party'
  if (t.includes('sport') || t.includes('fußball') || t.includes('basketball') || t.includes('tennis')) return 'Sport'
  if (t.includes('kunst') || t.includes('ausstellung') || t.includes('museum') || t.includes('galerie')) return 'Kunst'
  if (t.includes('theater') || t.includes('oper') || t.includes('ballet') || t.includes('tanz') || t.includes('kultur')) return 'Kultur'
  if (t.includes('musical') || t.includes('show')) return 'Musical'
  if (t.includes('comedy') || t.includes('humor') || t.includes('kabarett')) return 'Comedy'
  if (t.includes('food') || t.includes('essen') || t.includes('markt')) return 'Food & Drinks'
  return 'Freizeit'
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=3600')

  const { city = 'Hamburg' } = req.query

  try {
    const url = `https://public-api.eventim.com/websearch/search/api/exploration/v1/products?webId=web__eventim-de&language=de&page=1&retail_partner=EVE&city_names=${encodeURIComponent(city)}&sort=DateAsc&top=50`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': 'https://www.eventim.de/',
      },
      signal: AbortSignal.timeout(10_000),
    })

    const data = await response.json()
    const today = new Date().toISOString().split('T')[0]

    const events = (data.products || [])
      .map(p => {
        const startDate = p.typeAttributes?.liveEntertainment?.startDate || ''
        const date = startDate ? startDate.split('T')[0] : ''
        const time = startDate ? (startDate.split('T')[1]?.slice(0, 5) || '20:00') : '20:00'
        const location = p.typeAttributes?.liveEntertainment?.location?.name || city
        const category = detectCategory(
          p.name + ' ' +
          (p.categories?.[0]?.name || '') + ' ' +
          (p.categories?.[1]?.name || '')
        )

        return {
          id: `eventim-${p.productId}`,
          name: p.name,
          date,
          time,
          location,
          city,
          price: p.price ? `ab ${p.price}€` : 'Kostenlos',
          image: p.imageUrl || getCategoryImage(category),
          ticketUrl: p.link || 'https://www.eventim.de',
          category,
          source: 'Eventim',
          description: p.description || '',
        }
      })
      .filter(e => e.date && e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))

    console.log(`Eventim: ${events.length} Events für ${city}`)
    res.status(200).json(events)
  } catch (error) {
    console.error('Error:', error.message)
    res.status(500).json({ error: error.message })
  }
}

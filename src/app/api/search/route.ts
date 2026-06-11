import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    // Reverse geocoding: if lat/lng provided without query, find place name
    if (!query && lat && lng) {
      const latitude = parseFloat(lat)
      const longitude = parseFloat(lng)
      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
          {
            headers: { 'User-Agent': 'MapLibreExplorer/1.0' },
          }
        )

        if (response.ok) {
          const data = await response.json()
          const name = data.address?.city || data.address?.town || data.address?.village || data.address?.county || data.display_name?.split(',')[0] || `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`
          return NextResponse.json({ name, fullName: data.display_name })
        }
      } catch {
        // Fall through to coordinate display
      }

      return NextResponse.json({ name: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°` })
    }

    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    // Use Nominatim (OpenStreetMap) for geocoding - free and no API key needed
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&dedupe=1`,
      {
        headers: {
          'User-Agent': 'MapLibreExplorer/1.0',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Geocoding service unavailable' },
        { status: 503 }
      )
    }

    const data = await response.json()

    // Deduplicate by display_name (some Nominatim results have exact duplicates)
    const seen = new Set<string>()
    const deduped = data.filter((item: Record<string, unknown>) => {
      const name = String(item.display_name)
      // Use first 50 chars as dedup key to catch near-duplicates
      const key = name.substring(0, 50).toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 5) // Limit to 5 results after dedup

    const results = deduped.map((item: Record<string, unknown>) => ({
      name: item.display_name,
      latitude: parseFloat(String(item.lat)),
      longitude: parseFloat(String(item.lon)),
      type: item.type,
      category: item.category,
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

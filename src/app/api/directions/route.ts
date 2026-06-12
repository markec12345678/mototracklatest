import { NextRequest, NextResponse } from 'next/server'

export type RouteProfile = 'driving' | 'cycling' | 'walking'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const coordinates = searchParams.get('coordinates')
  const profile = (searchParams.get('profile') || 'driving') as RouteProfile

  if (!coordinates) {
    return NextResponse.json({ error: 'Missing coordinates parameter' }, { status: 400 })
  }

  // Validate profile
  const validProfiles: RouteProfile[] = ['driving', 'cycling', 'walking']
  if (!validProfiles.includes(profile)) {
    return NextResponse.json({ error: 'Invalid profile. Use: driving, cycling, or walking' }, { status: 400 })
  }

  try {
    // coordinates format: lng,lat;lng,lat;lng,lat
    const url = `https://router.project-osrm.org/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson&steps=true`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MapLibreExplorer/1.0' },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      throw new Error(`OSRM API error: ${res.status}`)
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Directions API error:', error)
    return NextResponse.json({ error: 'Failed to fetch directions' }, { status: 500 })
  }
}

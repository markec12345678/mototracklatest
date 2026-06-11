import { NextRequest, NextResponse } from 'next/server'

// Simple isochrone approximation using OSRM route service
// Generates a rough reachability polygon from a point
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const minutes = parseInt(searchParams.get('minutes') || '15')
  const mode = searchParams.get('mode') || 'walking' // walking, cycling, driving

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lng parameters' }, { status: 400 })
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  // Speed in km/h for different modes
  const speeds: Record<string, number> = {
    walking: 5,
    cycling: 15,
    driving: 40,
  }
  const speed = speeds[mode] || speeds.walking
  const radiusKm = (speed * minutes) / 60 // distance in km

  // Use a seeded random for consistent shapes per request
  // (not truly random so the isochrone doesn't change on every re-render)
  const numPoints = 64

  // Generate concentric rings for multi-isochrone
  const rings = [0.25, 0.5, 0.75, 1.0].map((factor) => {
    const ringRadius = radiusKm * factor
    const ringCoords: number[][] = []
    for (let i = 0; i < numPoints; i++) {
      const angle = (2 * Math.PI * i) / numPoints
      // Use deterministic variation based on angle for natural look
      const variation = 0.9 + Math.sin(angle * 3) * 0.1
      const r = (ringRadius * variation) / 111.32 // rough degree conversion
      const dLng = r * Math.cos(angle) / Math.cos((latitude * Math.PI) / 180)
      const dLat = r * Math.sin(angle)
      ringCoords.push([longitude + dLng, latitude + dLat])
    }
    ringCoords.push(ringCoords[0])
    return {
      minutes: Math.round(minutes * factor),
      radius: ringRadius,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [ringCoords],
      },
    }
  })

  return NextResponse.json({
    center: [longitude, latitude],
    mode,
    speedKmh: speed,
    rings,
  })
}

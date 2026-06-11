import { NextRequest, NextResponse } from 'next/server'

interface ElevationRequestPoint {
  lng: number
  lat: number
}

interface ElevationRequestBody {
  coordinates: ElevationRequestPoint[]
}

/** Haversine distance in meters between two lat/lng points */
function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/** Interpolate points along a line at regular intervals */
function interpolateRoutePoints(
  coordinates: ElevationRequestPoint[],
  intervalMeters: number = 100
): ElevationRequestPoint[] {
  if (coordinates.length < 2) return coordinates

  const result: ElevationRequestPoint[] = [coordinates[0]]

  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1]
    const curr = coordinates[i]
    const segDist = haversineDistanceMeters(prev.lat, prev.lng, curr.lat, curr.lng)

    if (segDist <= intervalMeters) {
      result.push(curr)
    } else {
      const numSteps = Math.ceil(segDist / intervalMeters)
      for (let s = 1; s <= numSteps; s++) {
        const t = s / numSteps
        result.push({
          lng: prev.lng + (curr.lng - prev.lng) * t,
          lat: prev.lat + (curr.lat - prev.lat) * t,
        })
      }
    }
  }

  return result
}

export async function POST(request: NextRequest) {
  let body: ElevationRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { coordinates } = body

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    return NextResponse.json(
      { error: 'Missing or empty coordinates array. Format: [{lng, lat}, ...]' },
      { status: 400 }
    )
  }

  // Validate each coordinate
  for (let i = 0; i < coordinates.length; i++) {
    const p = coordinates[i]
    if (typeof p.lng !== 'number' || typeof p.lat !== 'number' || isNaN(p.lng) || isNaN(p.lat)) {
      return NextResponse.json(
        { error: `Invalid coordinate at index ${i}: ${JSON.stringify(p)}` },
        { status: 400 }
      )
    }
  }

  // Interpolate points for better resolution along the route
  const interpolated = interpolateRoutePoints(coordinates as ElevationRequestPoint[], 100)

  const longitudes = interpolated.map((p) => p.lng)
  const latitudes = interpolated.map((p) => p.lat)

  try {
    // Open-Meteo API can handle up to ~1000 points per request
    // Batch if needed
    const BATCH_SIZE = 500
    const allElevations: number[] = []

    for (let batch = 0; batch < interpolated.length; batch += BATCH_SIZE) {
      const batchLng = longitudes.slice(batch, batch + BATCH_SIZE)
      const batchLat = latitudes.slice(batch, batch + BATCH_SIZE)

      const url = `https://api.open-meteo.com/v1/elevation?longitude=${batchLng.join(',')}&latitude=${batchLat.join(',')}`

      const response = await fetch(url, {
        next: { revalidate: 3600 },
      })

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch elevation data from Open-Meteo' },
          { status: response.status }
        )
      }

      const data = await response.json()
      const elevations: number[] = data.elevation || []
      allElevations.push(...elevations)
    }

    // Compute cumulative distance for each interpolated point (in km)
    let cumulativeDistance = 0
    const result: { distance: number; elevation: number }[] = []

    for (let i = 0; i < allElevations.length; i++) {
      if (i > 0) {
        const prev = interpolated[i - 1]
        const curr = interpolated[i]
        cumulativeDistance += haversineDistanceMeters(prev.lat, prev.lng, curr.lat, curr.lng) / 1000 // km
      }
      result.push({
        distance: Math.round(cumulativeDistance * 100) / 100, // km with 2 decimal places
        elevation: allElevations[i],
      })
    }

    return NextResponse.json({ points: result })
  } catch (error) {
    console.error('Elevation API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch elevation data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pointsParam = searchParams.get('points')

  if (!pointsParam) {
    return NextResponse.json(
      { error: 'Missing points query parameter. Format: lng1,lat1;lng2,lat2;...' },
      { status: 400 }
    )
  }

  // Parse points: semicolon-separated lng,lat pairs
  const pairs = pointsParam.split(';')
  const longitudes: number[] = []
  const latitudes: number[] = []

  for (const pair of pairs) {
    const parts = pair.split(',')
    if (parts.length !== 2) {
      return NextResponse.json(
        { error: `Invalid point format: "${pair}". Expected lng,lat` },
        { status: 400 }
      )
    }
    const lng = parseFloat(parts[0])
    const lat = parseFloat(parts[1])
    if (isNaN(lng) || isNaN(lat)) {
      return NextResponse.json(
        { error: `Invalid coordinates in point: "${pair}"` },
        { status: 400 }
      )
    }
    longitudes.push(lng)
    latitudes.push(lat)
  }

  if (longitudes.length === 0) {
    return NextResponse.json(
      { error: 'No valid points provided' },
      { status: 400 }
    )
  }

  try {
    const url = `https://api.open-meteo.com/v1/elevation?longitude=${longitudes.join(',')}&latitude=${latitudes.join(',')}`

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch elevation data from Open-Meteo' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Open-Meteo returns { elevation: [val1, val2, ...] }
    const elevations: number[] = data.elevation || []

    return NextResponse.json({ elevations })
  } catch (error) {
    console.error('Elevation API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch elevation data' },
      { status: 500 }
    )
  }
}

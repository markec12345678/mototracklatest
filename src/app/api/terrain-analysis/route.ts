import { NextRequest, NextResponse } from 'next/server'

interface TerrainPoint {
  lng: number
  lat: number
}

/** Haversine distance in meters */
function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
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

/** Interpolate points along a line at regular intervals for better elevation resolution */
function interpolatePoints(points: TerrainPoint[], intervalMeters: number = 200): TerrainPoint[] {
  if (points.length < 2) return points

  const result: TerrainPoint[] = [points[0]]

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
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
  let body: { points: TerrainPoint[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { points } = body

  if (!points || !Array.isArray(points) || points.length < 2) {
    return NextResponse.json(
      { error: 'At least 2 points are required. Format: [{lng, lat}, ...]' },
      { status: 400 }
    )
  }

  // Validate each point
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    if (typeof p.lng !== 'number' || typeof p.lat !== 'number' || isNaN(p.lng) || isNaN(p.lat)) {
      return NextResponse.json(
        { error: `Invalid coordinate at index ${i}: ${JSON.stringify(p)}` },
        { status: 400 }
      )
    }
  }

  // Interpolate for better elevation resolution
  const interpolated = interpolatePoints(points as TerrainPoint[], 200)

  const longitudes = interpolated.map((p) => p.lng)
  const latitudes = interpolated.map((p) => p.lat)

  try {
    // Fetch elevation data from Open-Meteo
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

    // Compute terrain analysis metrics
    let totalAscent = 0
    let totalDescent = 0
    let maxElevation = -Infinity
    let minElevation = Infinity

    for (const elev of allElevations) {
      if (elev > maxElevation) maxElevation = elev
      if (elev < minElevation) minElevation = elev
    }

    // Compute ascent and descent
    for (let i = 1; i < allElevations.length; i++) {
      const diff = allElevations[i] - allElevations[i - 1]
      if (diff > 0) totalAscent += diff
      else totalDescent += Math.abs(diff)
    }

    // Compute slope profile
    const slopeProfile: { distance: number; slope: number; elevation: number }[] = []
    let cumulativeDistance = 0

    for (let i = 0; i < allElevations.length; i++) {
      if (i > 0) {
        const dist = haversineDistanceMeters(
          interpolated[i - 1].lat,
          interpolated[i - 1].lng,
          interpolated[i].lat,
          interpolated[i].lng
        )
        cumulativeDistance += dist

        const elevDiff = allElevations[i] - allElevations[i - 1]
        const slopePercent = dist > 0 ? (elevDiff / dist) * 100 : 0

        // Only add every few points to keep the profile manageable
        if (i % Math.max(1, Math.floor(allElevations.length / 100)) === 0 || i === allElevations.length - 1) {
          slopeProfile.push({
            distance: Math.round(cumulativeDistance),
            slope: Math.round(slopePercent * 10) / 10,
            elevation: allElevations[i],
          })
        }
      } else {
        slopeProfile.push({
          distance: 0,
          slope: 0,
          elevation: allElevations[0],
        })
      }
    }

    // Compute average and max slope
    const slopes = slopeProfile.map((p) => Math.abs(p.slope))
    const averageSlope = slopes.length > 0 ? slopes.reduce((a, b) => a + b, 0) / slopes.length : 0
    const maxSlope = slopes.length > 0 ? Math.max(...slopes) : 0

    // Determine terrain type
    let terrainType: 'flat' | 'rolling' | 'hilly' | 'mountainous'
    if (maxElevation - minElevation < 50) {
      terrainType = 'flat'
    } else if (maxElevation - minElevation < 200) {
      terrainType = 'rolling'
    } else if (maxElevation - minElevation < 1000) {
      terrainType = 'hilly'
    } else {
      terrainType = 'mountainous'
    }

    // Determine difficulty
    let difficulty: 'easy' | 'moderate' | 'hard' | 'extreme'
    const difficultyScore =
      (totalAscent / 1000) * 3 + // elevation gain per km
      (maxSlope / 10) * 2 + // steep slopes
      (terrainType === 'mountainous' ? 3 : terrainType === 'hilly' ? 2 : terrainType === 'rolling' ? 1 : 0)

    if (difficultyScore < 2) {
      difficulty = 'easy'
    } else if (difficultyScore < 5) {
      difficulty = 'moderate'
    } else if (difficultyScore < 8) {
      difficulty = 'hard'
    } else {
      difficulty = 'extreme'
    }

    return NextResponse.json({
      totalAscent: Math.round(totalAscent),
      totalDescent: Math.round(totalDescent),
      maxElevation: Math.round(maxElevation),
      minElevation: Math.round(minElevation),
      averageSlope: Math.round(averageSlope * 10) / 10,
      maxSlope: Math.round(maxSlope * 10) / 10,
      slopeProfile,
      terrainType,
      difficulty,
      elevationRange: Math.round(maxElevation - minElevation),
    })
  } catch (error) {
    console.error('Terrain analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze terrain' },
      { status: 500 }
    )
  }
}

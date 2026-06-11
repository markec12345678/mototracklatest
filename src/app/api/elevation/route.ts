import { NextRequest, NextResponse } from 'next/server'

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

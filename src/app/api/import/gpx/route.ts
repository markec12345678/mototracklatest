import { NextRequest, NextResponse } from 'next/server'

interface GPXWaypoint {
  name: string
  latitude: number
  longitude: number
  description?: string
  type?: string
  sym?: string
}

interface GPXTrack {
  name: string
  points: { latitude: number; longitude: number }[]
}

interface GPXImportResult {
  waypoints: GPXWaypoint[]
  tracks: GPXTrack[]
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.gpx') && file.type !== 'application/gpx+xml') {
      return NextResponse.json({ error: 'Invalid file type. Please upload a GPX file.' }, { status: 400 })
    }

    const text = await file.text()
    const result = parseGPX(text)

    return NextResponse.json(result)
  } catch (error) {
    console.error('GPX import error:', error)
    return NextResponse.json({ error: 'Failed to parse GPX file' }, { status: 500 })
  }
}

function parseGPX(gpxText: string): GPXImportResult {
  const result: GPXImportResult = { waypoints: [], tracks: [] }

  // Basic XML parsing without external dependencies
  // Parse waypoints
  const wptRegex = /<wpt[^>]*\slat="([^"]*)"[^>]*\slon="([^"]*)"[^>]*>([\s\S]*?)<\/wpt>/g
  let match
  while ((match = wptRegex.exec(gpxText)) !== null) {
    const lat = parseFloat(match[1])
    const lon = parseFloat(match[2])
    const content = match[3]
    if (!isNaN(lat) && !isNaN(lon)) {
      const nameMatch = content.match(/<name>([\s\S]*?)<\/name>/)
      const descMatch = content.match(/<desc>([\s\S]*?)<\/desc>/)
      const typeMatch = content.match(/<type>([\s\S]*?)<\/type>/)
      const symMatch = content.match(/<sym>([\s\S]*?)<\/sym>/)
      result.waypoints.push({
        name: nameMatch ? nameMatch[1].trim() : 'Waypoint',
        latitude: lat,
        longitude: lon,
        description: descMatch ? descMatch[1].trim() : undefined,
        type: typeMatch ? typeMatch[1].trim() : undefined,
        sym: symMatch ? symMatch[1].trim() : undefined,
      })
    }
  }

  // Parse tracks
  const trkRegex = /<trk>([\s\S]*?)<\/trk>/g
  while ((match = trkRegex.exec(gpxText)) !== null) {
    const content = match[1]
    const nameMatch = content.match(/<name>([\s\S]*?)<\/name>/)
    const trkpts: { latitude: number; longitude: number }[] = []

    const trkptRegex = /<trkpt[^>]*\slat="([^"]*)"[^>]*\slon="([^"]*)"[^>]*\/?>/g
    let ptMatch
    while ((ptMatch = trkptRegex.exec(content)) !== null) {
      const lat = parseFloat(ptMatch[1])
      const lon = parseFloat(ptMatch[2])
      if (!isNaN(lat) && !isNaN(lon)) {
        trkpts.push({ latitude: lat, longitude: lon })
      }
    }

    if (trkpts.length > 0) {
      result.tracks.push({
        name: nameMatch ? nameMatch[1].trim() : `Track ${result.tracks.length + 1}`,
        points: trkpts,
      })
    }
  }

  // Also parse routes (rte) as tracks
  const rteRegex = /<rte>([\s\S]*?)<\/rte>/g
  while ((match = rteRegex.exec(gpxText)) !== null) {
    const content = match[1]
    const nameMatch = content.match(/<name>([\s\S]*?)<\/name>/)
    const rtepts: { latitude: number; longitude: number }[] = []

    const rteptRegex = /<rtept[^>]*\slat="([^"]*)"[^>]*\slon="([^"]*)"[^>]*\/?>/g
    let ptMatch
    while ((ptMatch = rteptRegex.exec(content)) !== null) {
      const lat = parseFloat(ptMatch[1])
      const lon = parseFloat(ptMatch[2])
      if (!isNaN(lat) && !isNaN(lon)) {
        rtepts.push({ latitude: lat, longitude: lon })
      }
    }

    if (rtepts.length > 0) {
      result.tracks.push({
        name: nameMatch ? nameMatch[1].trim() : `Route ${result.tracks.length + 1}`,
        points: rtepts,
      })
    }
  }

  return result
}

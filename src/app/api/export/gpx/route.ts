import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    let gpxContent = ''

    if (type === 'route') {
      gpxContent = generateRouteGPX(data)
    } else if (type === 'markers') {
      gpxContent = generateMarkersGPX(data)
    } else if (type === 'all') {
      gpxContent = generateFullGPX(data)
    } else {
      return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
    }

    return new NextResponse(gpxContent, {
      headers: {
        'Content-Type': 'application/gpx+xml',
        'Content-Disposition': `attachment; filename="maplibre-export-${Date.now()}.gpx"`,
      },
    })
  } catch (error) {
    console.error('GPX export error:', error)
    return NextResponse.json({ error: 'Failed to generate GPX' }, { status: 500 })
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateRouteGPX(route: Record<string, unknown>): string {
  const points = (route.points || []) as Record<string, unknown>[]
  const wpts = points.map((p, i) =>
    `    <wpt lat="${p.latitude}" lon="${p.longitude}">
      <name>${escapeXml(String(p.name || `Point ${i + 1}`))}</name>
      <type>Waypoint</type>
    </wpt>`
  ).join('\n')

  const trkpts = points.map((p) =>
    `      <trkpt lat="${p.latitude}" lon="${p.longitude}"></trkpt>`
  ).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="MapLibre Explorer"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(String(route.name || 'Route'))}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
${wpts}
  <trk>
    <name>${escapeXml(String(route.name || 'Route'))}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`
}

function generateMarkersGPX(markers: Record<string, unknown>[]): string {
  const wpts = markers.map((m) =>
    `  <wpt lat="${m.latitude}" lon="${m.longitude}">
    <name>${escapeXml(String(m.name || 'Waypoint'))}</name>
    ${m.description ? `<desc>${escapeXml(String(m.description))}</desc>` : ''}
    <sym>${m.category === 'favorite' ? 'Star' : m.category === 'restaurant' ? 'Restaurant' : m.category === 'hotel' ? 'Lodging' : m.category === 'park' ? 'Park' : 'Waypoint'}</sym>
    <type>${escapeXml(String(m.category || 'general'))}</type>
  </wpt>`
  ).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="MapLibre Explorer"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>MapLibre Explorer Markers</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
${wpts}
</gpx>`
}

function generateFullGPX(data: Record<string, unknown>): string {
  const markers = (data.markers || []) as Record<string, unknown>[]
  const routes = (data.routes || []) as Record<string, unknown>[]

  const wpts = markers.map((m) =>
    `  <wpt lat="${m.latitude}" lon="${m.longitude}">
    <name>${escapeXml(String(m.name || 'Waypoint'))}</name>
    ${m.description ? `<desc>${escapeXml(String(m.description))}</desc>` : ''}
    <type>${escapeXml(String(m.category || 'general'))}</type>
  </wpt>`
  ).join('\n')

  const trks = routes.map((route) => {
    const routePoints = (route.points || []) as Record<string, unknown>[]
    const trkpts = routePoints.map((p) =>
      `      <trkpt lat="${p.latitude}" lon="${p.longitude}"></trkpt>`
    ).join('\n')

    return `  <trk>
    <name>${escapeXml(String(route.name || 'Route'))}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="MapLibre Explorer"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>MapLibre Explorer Export</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
${wpts}
${trks}
</gpx>`
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const routes = await db.route.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(routes)
  } catch (error) {
    console.error('Failed to fetch routes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch routes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, distance, duration, waypoints } = body

    if (!name || !waypoints) {
      return NextResponse.json(
        { error: 'Name and waypoints are required' },
        { status: 400 }
      )
    }

    const route = await db.route.create({
      data: {
        name,
        description: description || null,
        color: color || '#3b82f6',
        distance: distance || null,
        duration: duration || null,
        waypoints: typeof waypoints === 'string' ? waypoints : JSON.stringify(waypoints),
      },
    })

    return NextResponse.json(route, { status: 201 })
  } catch (error) {
    console.error('Failed to create route:', error)
    return NextResponse.json(
      { error: 'Failed to create route' },
      { status: 500 }
    )
  }
}

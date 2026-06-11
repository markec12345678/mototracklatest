import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const styles = await db.mapStyle.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(styles)
  } catch (error) {
    console.error('Failed to fetch styles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch styles' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, url, thumbnail, category } = body

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      )
    }

    const style = await db.mapStyle.create({
      data: {
        name,
        url,
        thumbnail: thumbnail || null,
        category: category || 'custom',
      },
    })

    return NextResponse.json(style, { status: 201 })
  } catch (error) {
    console.error('Failed to create style:', error)
    return NextResponse.json(
      { error: 'Failed to create style' },
      { status: 500 }
    )
  }
}

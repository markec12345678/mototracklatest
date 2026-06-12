import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.route.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete route:', error)
    return NextResponse.json(
      { error: 'Failed to delete route' },
      { status: 500 }
    )
  }
}

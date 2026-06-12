import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing lat/lng parameters' },
      { status: 400 }
    )
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: 'Invalid lat/lng parameters' },
      { status: 400 }
    )
  }

  try {
    // Fetch current air quality data
    const currentUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm2_5,pm10,us_aqi,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`
    const currentRes = await fetch(currentUrl)

    if (!currentRes.ok) {
      throw new Error(`Air quality API returned ${currentRes.status}`)
    }

    const currentData = await currentRes.json()

    // Fetch hourly forecast for next 24 hours
    const hourlyUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=pm2_5,pm10,us_aqi,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&forecast_days=1`
    const hourlyRes = await fetch(hourlyUrl)

    let hourlyData = null
    if (hourlyRes.ok) {
      hourlyData = await hourlyRes.json()
    }

    return NextResponse.json({
      current: currentData.current || null,
      hourly: hourlyData?.hourly || null,
      latitude,
      longitude,
    })
  } catch (error) {
    console.error('Air quality API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch air quality data' },
      { status: 500 }
    )
  }
}

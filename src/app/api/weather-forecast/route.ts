import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing lat or lng query parameters' },
      { status: 400 }
    )
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: 'Invalid lat or lng values' },
      { status: 400 }
    )
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,weathercode,uv_index_max&current=uv_index&timezone=auto&forecast_days=7`

    const response = await fetch(url, {
      next: { revalidate: 600 },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch weather forecast' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Transform into a clean forecast array
    const daily = data.daily
    const forecast = daily.time.map((date: string, i: number) => ({
      date,
      tempMax: daily.temperature_2m_max[i],
      tempMin: daily.temperature_2m_min[i],
      precipitation: daily.precipitation_sum[i],
      precipitationProbability: daily.precipitation_probability_max?.[i] ?? null,
      windSpeedMax: daily.windspeed_10m_max[i],
      weatherCode: daily.weathercode[i],
      uvIndexMax: daily.uv_index_max?.[i] ?? null,
    }))

    // Also try to get air quality from Open-Meteo
    let aqi: { index: number; description: string } | null = null
    try {
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,us_aqi&timezone=auto`
      const aqiRes = await fetch(aqiUrl, {
        next: { revalidate: 600 },
      })
      if (aqiRes.ok) {
        const aqiData = await aqiRes.json()
        const europeanAqi = aqiData.current?.european_aqi
        const usAqi = aqiData.current?.us_aqi
        const aqiValue = europeanAqi ?? usAqi ?? null
        if (aqiValue !== null) {
          let description = 'Good'
          if (aqiValue > 100) description = 'Unhealthy for sensitive groups'
          else if (aqiValue > 50) description = 'Moderate'
          else if (aqiValue > 25) description = 'Fair'
          aqi = { index: Math.round(aqiValue), description }
        }
      }
    } catch {
      // AQI is optional, ignore errors
    }

    return NextResponse.json({
      forecast,
      currentUv: data.current?.uv_index ?? null,
      aqi,
    })
  } catch (error) {
    console.error('Weather forecast API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather forecast data' },
      { status: 500 }
    )
  }
}

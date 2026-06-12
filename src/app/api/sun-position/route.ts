import { NextRequest, NextResponse } from 'next/server'

/**
 * Solar position calculation using simplified astronomical formulas
 * Based on the NOAA Solar Position Algorithm and SunCalc
 */

const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

function toJulian(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5
}

function fromJulian(j: number): Date {
  return new Date((j - 2440587.5) * 86400000)
}

function toDays(date: Date): number {
  return toJulian(date) - 2451545
}

function solarMeanAnomaly(days: number): number {
  return DEG_TO_RAD * (357.5291 + 0.98560028 * days)
}

function eclipticLongitude(M: number): number {
  const C = DEG_TO_RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M))
  const P = DEG_TO_RAD * 102.9372
  return M + C + P + Math.PI
}

function sunCoords(days: number): { dec: number; ra: number } {
  const M = solarMeanAnomaly(days)
  const L = eclipticLongitude(M)
  const dec = Math.asin(Math.sin(L) * Math.sin(DEG_TO_RAD * 23.4397))
  const ra = Math.atan2(Math.sin(L) * Math.cos(DEG_TO_RAD * 23.4397), Math.cos(L))
  return { dec, ra }
}

function siderealTime(days: number, lng: number): number {
  return DEG_TO_RAD * (280.16 + 360.9856235 * days) + lng
}

function getSunPosition(date: Date, lat: number, lng: number): { altitude: number; azimuth: number } {
  const latRad = lat * DEG_TO_RAD
  const lngRad = lng * DEG_TO_RAD
  const days = toDays(date)
  const { dec, ra } = sunCoords(days)
  const theta = siderealTime(days, lngRad)
  const H = theta - ra
  const altitude = Math.asin(
    Math.sin(latRad) * Math.sin(dec) + Math.cos(latRad) * Math.cos(dec) * Math.cos(H)
  )
  const azimuth = Math.atan2(
    Math.sin(H),
    Math.cos(H) * Math.sin(latRad) - Math.tan(dec) * Math.cos(latRad)
  )
  return {
    altitude: altitude * RAD_TO_DEG,
    azimuth: ((azimuth * RAD_TO_DEG + 180) % 360 + 360) % 360,
  }
}

function getSubsolarPoint(date: Date): { lat: number; lng: number } {
  const days = toDays(date)
  const { dec } = sunCoords(days)
  const fractionalHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
  const lng = (12 - fractionalHours) * 15
  return {
    lat: dec * RAD_TO_DEG,
    lng: ((lng + 180) % 360) - 180,
  }
}

/**
 * Calculate sunrise/sunset times using the NOAA algorithm
 * Based on https://www.esrl.noaa.gov/gmd/grad/solcalc/
 */
function calcSunriseSet(date: Date, lat: number, lng: number, rising: boolean): Date | null {
  const latRad = lat * DEG_TO_RAD

  // Julian day number
  const JD = toJulian(date)
  // Julian century
  const T = (JD - 2451545) / 36525

  // Mean longitude (degrees)
  const L0 = (280.46646 + T * (36000.76983 + 0.0003032 * T)) % 360

  // Mean anomaly (degrees)
  const M = (357.52911 + T * (35999.05029 - 0.0001537 * T)) * DEG_TO_RAD

  // Eccentricity of Earth's orbit
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T)

  // Sun's equation of center
  const C = (1.914602 - T * (0.004817 + 0.000014 * T)) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M)

  // Sun's true longitude
  const sunTrueLong = L0 + C

  // Sun's apparent longitude
  const omega = (125.04 - 1934.136 * T) * DEG_TO_RAD
  const lambda = (sunTrueLong - 0.00569 - 0.00478 * Math.sin(omega)) * DEG_TO_RAD

  // Mean obliquity of the ecliptic
  const obliq0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60
  const obliq = (obliq0 + 0.00256 * Math.cos(omega)) * DEG_TO_RAD

  // Solar declination
  const dec = Math.asin(Math.sin(obliq) * Math.sin(lambda))

  // Equation of time (minutes)
  const y = Math.tan(obliq / 2) ** 2
  const L0rad = L0 * DEG_TO_RAD
  const eqTime = 4 * RAD_TO_DEG * (
    y * Math.sin(2 * L0rad) -
    2 * e * Math.sin(M) +
    4 * e * y * Math.sin(M) * Math.cos(2 * L0rad) -
    0.5 * y * y * Math.sin(4 * L0rad) -
    1.25 * e * e * Math.sin(2 * M)
  )

  // Hour angle at sunrise/sunset (for sun altitude = -0.833° accounting for refraction)
  const zenith = 90.833 * DEG_TO_RAD
  const cosHA = (Math.cos(zenith) - Math.sin(latRad) * Math.sin(dec)) /
    (Math.cos(latRad) * Math.cos(dec))

  if (cosHA > 1) return null // Never rises
  if (cosHA < -1) return null // Never sets

  const HA = Math.acos(cosHA) * RAD_TO_DEG / 15 // Convert to hours

  // Solar noon (UTC hours)
  const solarNoon = 12 - lng / 15 - eqTime / 60

  // Sunrise or sunset (UTC hours)
  const timeUTC = rising ? solarNoon - HA : solarNoon + HA

  // Convert UTC hours to date
  const resultDate = new Date(date)
  resultDate.setUTCHours(0, 0, 0, 0)
  resultDate.setUTCMinutes(Math.round(timeUTC * 60))

  return resultDate
}

function calcTimeForAltitude(date: Date, lat: number, lng: number, altitude: number, rising: boolean): Date | null {
  const latRad = lat * DEG_TO_RAD

  const JD = toJulian(date)
  const T = (JD - 2451545) / 36525

  const L0 = (280.46646 + T * (36000.76983 + 0.0003032 * T)) % 360
  const M = (357.52911 + T * (35999.05029 - 0.0001537 * T)) * DEG_TO_RAD
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T)
  const C = (1.914602 - T * (0.004817 + 0.000014 * T)) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M)
  const sunTrueLong = L0 + C
  const omega = (125.04 - 1934.136 * T) * DEG_TO_RAD
  const lambda = (sunTrueLong - 0.00569 - 0.00478 * Math.sin(omega)) * DEG_TO_RAD
  const obliq0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60
  const obliq = (obliq0 + 0.00256 * Math.cos(omega)) * DEG_TO_RAD
  const dec = Math.asin(Math.sin(obliq) * Math.sin(lambda))

  const y = Math.tan(obliq / 2) ** 2
  const L0rad = L0 * DEG_TO_RAD
  const eqTime = 4 * RAD_TO_DEG * (
    y * Math.sin(2 * L0rad) -
    2 * e * Math.sin(M) +
    4 * e * y * Math.sin(M) * Math.cos(2 * L0rad) -
    0.5 * y * y * Math.sin(4 * L0rad) -
    1.25 * e * e * Math.sin(2 * M)
  )

  const zenith = (90 - altitude) * DEG_TO_RAD
  const cosHA = (Math.cos(zenith) - Math.sin(latRad) * Math.sin(dec)) /
    (Math.cos(latRad) * Math.cos(dec))

  if (cosHA > 1 || cosHA < -1) return null

  const HA = Math.acos(cosHA) * RAD_TO_DEG / 15
  const solarNoon = 12 - lng / 15 - eqTime / 60
  const timeUTC = rising ? solarNoon - HA : solarNoon + HA

  const resultDate = new Date(date)
  resultDate.setUTCHours(0, 0, 0, 0)
  resultDate.setUTCMinutes(Math.round(timeUTC * 60))

  return resultDate
}

function formatTime(date: Date | null): string {
  if (!date) return 'N/A'
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  })
}

function formatTimeLocal(date: Date | null, tzOffset: number): string {
  if (!date) return 'N/A'
  const localDate = new Date(date.getTime() + tzOffset * 3600000)
  return localDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  })
}

function calculateDayLength(sunrise: Date | null, sunset: Date | null): string {
  if (!sunrise || !sunset) return 'N/A'
  const diff = sunset.getTime() - sunrise.getTime()
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  return `${hours}h ${minutes}m`
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const tzOffset = parseFloat(searchParams.get('tz') || String(Math.round(lng / 15)))

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json(
      { error: 'Invalid coordinates. lat must be [-90,90] and lng must be [-180,180]' },
      { status: 400 }
    )
  }

  const now = new Date()

  // Get today's date at midnight UTC for sunrise/sunset calculations
  const today = new Date(now)
  today.setUTCHours(0, 0, 0, 0)

  // Calculate sun position at current time
  const { altitude, azimuth } = getSunPosition(now, lat, lng)

  // Calculate subsolar point
  const subsolar = getSubsolarPoint(now)

  // Calculate sunrise/sunset for today
  const sunrise = calcSunriseSet(today, lat, lng, true)
  const sunset = calcSunriseSet(today, lat, lng, false)

  // Solar noon (when sun is at highest point) - halfway between sunrise and sunset
  let solarNoon: Date | null = null
  if (sunrise && sunset) {
    solarNoon = new Date((sunrise.getTime() + sunset.getTime()) / 2)
  }

  // Determine if it's daytime
  const isDaytime = altitude > -0.833

  // Day length
  const dayLength = calculateDayLength(sunrise, sunset)

  // Golden hour: sun at 6° (rising) and sun at -4° (setting)
  const goldenStart = calcTimeForAltitude(today, lat, lng, 6, true)
  const goldenEnd = calcTimeForAltitude(today, lat, lng, -4, false)

  // Blue hour: sun at -4° (rising) and sun at -6° (setting)
  const blueStart = calcTimeForAltitude(today, lat, lng, -4, true)
  const blueEnd = calcTimeForAltitude(today, lat, lng, -6, false)

  return NextResponse.json({
    altitude: Math.round(altitude * 100) / 100,
    azimuth: Math.round(azimuth * 100) / 100,
    subsolarPoint: {
      lat: Math.round(subsolar.lat * 100) / 100,
      lng: Math.round(subsolar.lng * 100) / 100,
    },
    sunrise: sunrise ? sunrise.toISOString() : null,
    sunset: sunset ? sunset.toISOString() : null,
    sunriseFormatted: formatTimeLocal(sunrise, tzOffset),
    sunsetFormatted: formatTimeLocal(sunset, tzOffset),
    solarNoon: solarNoon ? solarNoon.toISOString() : null,
    isDaytime,
    dayLength,
    goldenHour: {
      start: goldenStart ? goldenStart.toISOString() : null,
      end: goldenEnd ? goldenEnd.toISOString() : null,
      startFormatted: formatTimeLocal(goldenStart, tzOffset),
      endFormatted: formatTimeLocal(goldenEnd, tzOffset),
    },
    blueHour: {
      start: blueStart ? blueStart.toISOString() : null,
      end: blueEnd ? blueEnd.toISOString() : null,
      startFormatted: formatTimeLocal(blueStart, tzOffset),
      endFormatted: formatTimeLocal(blueEnd, tzOffset),
    },
    timestamp: now.toISOString(),
  })
}

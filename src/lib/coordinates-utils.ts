/**
 * Coordinate format utility functions
 * Pure functions with no side effects
 */

/** Convert decimal degrees to DMS (degrees, minutes, seconds) string */
export function toDMS(decimal: number, isLat: boolean): string {
  const abs = Math.abs(decimal)
  const deg = Math.floor(abs)
  const minFloat = (abs - deg) * 60
  const min = Math.floor(minFloat)
  const sec = ((minFloat - min) * 60).toFixed(1)
  const dir = isLat
    ? decimal >= 0 ? 'N' : 'S'
    : decimal >= 0 ? 'E' : 'W'
  return `${deg}°${min}'${sec}"${dir}`
}

/** Format decimal degrees with degree symbol and direction */
export function toDecimalDegrees(decimal: number, isLat: boolean): string {
  const dir = isLat
    ? decimal >= 0 ? 'N' : 'S'
    : decimal >= 0 ? 'E' : 'W'
  return `${Math.abs(decimal).toFixed(4)}°${dir}`
}

/** Convert latitude/longitude to UTM coordinates */
export function toUTM(lat: number, lng: number): string {
  // Calculate UTM zone
  const zone = Math.floor((lng + 180) / 6) + 1

  // Determine latitude band
  const latBands = 'CDEFGHJKLMNPQRSTUVWX'
  let bandIndex = Math.floor((lat + 80) / 8)
  if (bandIndex < 0) bandIndex = 0
  if (bandIndex >= latBands.length) bandIndex = latBands.length - 1
  const band = latBands[bandIndex]

  // Central meridian of the zone
  const centralMeridian = (zone - 1) * 6 - 180 + 3

  // Convert to UTM using WGS84 parameters
  const a = 6378137.0 // WGS84 semi-major axis
  const f = 1 / 298.257223563 // WGS84 flattening
  const e2 = 2 * f - f * f // first eccentricity squared
  const ePrime2 = e2 / (1 - e2) // second eccentricity squared
  const k0 = 0.9996 // scale factor

  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  const lngOriginRad = (centralMeridian * Math.PI) / 180

  const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) * Math.sin(latRad))
  const T = Math.tan(latRad) * Math.tan(latRad)
  const C = ePrime2 * Math.cos(latRad) * Math.cos(latRad)
  const A = Math.cos(latRad) * (lngRad - lngOriginRad)

  const M = a * (
    (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * latRad
    - (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2 * e2 / 1024) * Math.sin(2 * latRad)
    + (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * latRad)
    - (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * latRad)
  )

  let easting = k0 * N * (
    A
    + (1 - T + C) * A * A * A / 6
    + (5 - 18 * T + T * T + 72 * C - 58 * ePrime2) * A * A * A * A * A / 120
  ) + 500000.0

  let northing = k0 * (
    M + N * Math.tan(latRad) * (
      A * A / 2
      + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24
      + (61 - 58 * T + T * T + 600 * C - 330 * ePrime2) * A * A * A * A * A * A / 720
    )
  )

  if (lat < 0) {
    northing += 10000000.0 // Southern hemisphere offset
  }

  easting = Math.round(easting)
  northing = Math.round(northing)

  return `${zone}${band} ${easting} ${northing}`
}

/** Convert latitude/longitude to MGRS (simplified) */
export function toMGRS(lat: number, lng: number): string {
  // Calculate UTM zone
  const zone = Math.floor((lng + 180) / 6) + 1

  // Determine latitude band
  const latBands = 'CDEFGHJKLMNPQRSTUVWX'
  let bandIndex = Math.floor((lat + 80) / 8)
  if (bandIndex < 0) bandIndex = 0
  if (bandIndex >= latBands.length) bandIndex = latBands.length - 1
  const band = latBands[bandIndex]

  // 100km grid square identification (simplified)
  // Column letters cycle through a set for each UTM zone
  const colLetters = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // I and O omitted
  const rowLetters = 'ABCDEFGHJKLMNPQRSTUV' // I and O omitted

  // Calculate 100km square
  const centralMeridian = (zone - 1) * 6 - 180 + 3

  // Simplified MGRS calculation
  const a = 6378137.0
  const f = 1 / 298.257223563
  const e2 = 2 * f - f * f
  const ePrime2 = e2 / (1 - e2)
  const k0 = 0.9996

  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  const lngOriginRad = (centralMeridian * Math.PI) / 180

  const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) * Math.sin(latRad))
  const T = Math.tan(latRad) * Math.tan(latRad)
  const C = ePrime2 * Math.cos(latRad) * Math.cos(latRad)
  const A = Math.cos(latRad) * (lngRad - lngOriginRad)

  const M = a * (
    (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * latRad
    - (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2 * e2 / 1024) * Math.sin(2 * latRad)
    + (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * latRad)
    - (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * latRad)
  )

  let easting = k0 * N * (
    A
    + (1 - T + C) * A * A * A / 6
    + (5 - 18 * T + T * T + 72 * C - 58 * ePrime2) * A * A * A * A * A / 120
  ) + 500000.0

  let northing = k0 * (
    M + N * Math.tan(latRad) * (
      A * A / 2
      + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24
      + (61 - 58 * T + T * T + 600 * C - 330 * ePrime2) * A * A * A * A * A * A / 720
    )
  )

  if (lat < 0) {
    northing += 10000000.0
  }

  // Get 100km square letters (simplified)
  const colIdx = Math.floor(easting / 100000) - 1
  const rowIdx = Math.floor(northing / 100000) % rowLetters.length
  const colLetter = colLetters[(zone - 1) * 3 % colLetters.length + colIdx] || colLetters[Math.abs(colIdx) % colLetters.length]
  const rowLetter = rowLetters[Math.abs(rowIdx) % rowLetters.length]

  // Get 5-digit easting and northing within 100km square
  const e5 = String(Math.floor(easting % 100000)).padStart(5, '0')
  const n5 = String(Math.floor(northing % 100000)).padStart(5, '0')

  return `${zone}${band}${colLetter}${rowLetter}${e5}${n5}`
}

/** Format type for coordinate display cycling */
export type CoordinateFormat = 'dd' | 'dms' | 'utm' | 'mgrs'

/** All format options for cycling */
export const COORDINATE_FORMATS: CoordinateFormat[] = ['dd', 'dms', 'utm', 'mgrs']

/** Format label for display */
export function getFormatLabel(format: CoordinateFormat): string {
  switch (format) {
    case 'dd': return 'Decimal Degrees'
    case 'dms': return 'DMS'
    case 'utm': return 'UTM'
    case 'mgrs': return 'MGRS'
  }
}

/** Format coordinates as string for the given format */
export function formatCoordinates(lat: number, lng: number, format: CoordinateFormat): string {
  switch (format) {
    case 'dd':
      return `${toDecimalDegrees(lat, true)}, ${toDecimalDegrees(lng, false)}`
    case 'dms':
      return `${toDMS(lat, true)} ${toDMS(lng, false)}`
    case 'utm':
      return toUTM(lat, lng)
    case 'mgrs':
      return toMGRS(lat, lng)
  }
}

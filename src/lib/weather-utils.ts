// WMO Weather Code to emoji, description, gradient, and accent mapping
// Shared between WeatherPanel and MobileWeatherBar

export const WMO_CODES: Record<number, { emoji: string; description: string; gradient: string; accent: 'warm' | 'cold' | 'neutral' }> = {
  0: { emoji: '☀️', description: 'Clear sky', gradient: 'from-amber-400/20 to-orange-300/10', accent: 'warm' },
  1: { emoji: '🌤️', description: 'Mainly clear', gradient: 'from-amber-300/20 to-yellow-200/10', accent: 'warm' },
  2: { emoji: '⛅', description: 'Partly cloudy', gradient: 'from-sky-300/20 to-gray-200/10', accent: 'neutral' },
  3: { emoji: '🌥️', description: 'Overcast', gradient: 'from-gray-400/20 to-gray-300/10', accent: 'neutral' },
  45: { emoji: '🌫️', description: 'Fog', gradient: 'from-gray-300/20 to-gray-200/10', accent: 'neutral' },
  48: { emoji: '🌫️', description: 'Depositing rime fog', gradient: 'from-gray-300/20 to-blue-100/10', accent: 'cold' },
  51: { emoji: '🌦️', description: 'Light drizzle', gradient: 'from-sky-400/20 to-sky-300/10', accent: 'cold' },
  53: { emoji: '🌦️', description: 'Moderate drizzle', gradient: 'from-sky-500/20 to-sky-300/10', accent: 'cold' },
  55: { emoji: '🌧️', description: 'Dense drizzle', gradient: 'from-sky-600/20 to-sky-400/10', accent: 'cold' },
  56: { emoji: '🌧️', description: 'Freezing drizzle', gradient: 'from-blue-500/20 to-sky-300/10', accent: 'cold' },
  57: { emoji: '🌧️', description: 'Dense freezing drizzle', gradient: 'from-blue-600/20 to-sky-400/10', accent: 'cold' },
  61: { emoji: '🌧️', description: 'Slight rain', gradient: 'from-sky-500/20 to-sky-300/10', accent: 'cold' },
  63: { emoji: '🌧️', description: 'Moderate rain', gradient: 'from-sky-600/20 to-sky-400/10', accent: 'cold' },
  65: { emoji: '🌧️', description: 'Heavy rain', gradient: 'from-sky-700/20 to-sky-500/10', accent: 'cold' },
  66: { emoji: '🌧️', description: 'Freezing rain', gradient: 'from-blue-600/20 to-sky-400/10', accent: 'cold' },
  67: { emoji: '🌧️', description: 'Heavy freezing rain', gradient: 'from-blue-700/20 to-sky-500/10', accent: 'cold' },
  71: { emoji: '❄️', description: 'Slight snow', gradient: 'from-blue-200/20 to-white/10', accent: 'cold' },
  73: { emoji: '❄️', description: 'Moderate snow', gradient: 'from-blue-300/20 to-blue-100/10', accent: 'cold' },
  75: { emoji: '🌨️', description: 'Heavy snow', gradient: 'from-blue-400/20 to-blue-200/10', accent: 'cold' },
  77: { emoji: '🌨️', description: 'Snow grains', gradient: 'from-blue-300/20 to-white/10', accent: 'cold' },
  80: { emoji: '🌦️', description: 'Slight rain showers', gradient: 'from-sky-500/20 to-sky-300/10', accent: 'cold' },
  81: { emoji: '🌧️', description: 'Moderate rain showers', gradient: 'from-sky-600/20 to-sky-400/10', accent: 'cold' },
  82: { emoji: '🌧️', description: 'Violent rain showers', gradient: 'from-sky-700/20 to-sky-500/10', accent: 'cold' },
  85: { emoji: '🌨️', description: 'Slight snow showers', gradient: 'from-blue-300/20 to-blue-100/10', accent: 'cold' },
  86: { emoji: '🌨️', description: 'Heavy snow showers', gradient: 'from-blue-400/20 to-blue-200/10', accent: 'cold' },
  95: { emoji: '⛈️', description: 'Thunderstorm', gradient: 'from-purple-600/20 to-sky-500/10', accent: 'neutral' },
  96: { emoji: '⛈️', description: 'Thunderstorm with hail', gradient: 'from-purple-700/20 to-sky-500/10', accent: 'neutral' },
  99: { emoji: '⛈️', description: 'Thunderstorm with heavy hail', gradient: 'from-purple-800/20 to-sky-600/10', accent: 'neutral' },
}

export function getWeatherInfo(code: number) {
  return WMO_CODES[code] || { emoji: '🌡️', description: 'Unknown', gradient: 'from-gray-400/20 to-gray-200/10', accent: 'neutral' as const }
}

export function getWindDirection(degrees: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return dirs[index]
}

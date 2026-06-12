import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `You are a helpful map assistant for MapLibre Explorer, an interactive mapping application. You can help users with:

- **Navigation**: "Navigate to [location]" - search and fly to a location
- **POI Search**: "Find restaurants near me" or "What's nearby?" - search for points of interest
- **Measurement**: "Measure distance from A to B" - start distance measurement
- **Weather**: "Show weather" - open the weather panel
- **Markers**: "Add pin at current location" - drop a marker
- **Map Style**: "Switch to satellite view" or "Show dark map" - change map style
- **Routing**: "Route from A to B" - create a route between two points
- **Zoom**: "Zoom in" or "Zoom out" - adjust zoom level
- **Elevation**: "Show elevation profile" - open elevation panel

When you detect a map command in the user's message, respond with a helpful description AND include action buttons. Format actions as JSON in your response using this pattern:

ACTIONS:[{"label":"Button Label","command":"command_type:value"}]

Available command types:
- navigate:location_name
- search-poi:category (e.g., restaurants, cafes, gas stations, hotels)
- measure:start|end
- weather:show
- add-pin:current
- style:style_name (streets, satellite, dark, terrain, outdoor, hybrid, topo, osm)
- route:start|end
- zoom:in or zoom:out
- elevation:show
- nearby:show

Example: If user says "Find pizza near me", respond:
I'll search for pizza places near your current location! 🍕
ACTIONS:[{"label":"Search Pizza","command":"search-poi:restaurant"},{"label":"Navigate to Center","command":"navigate:city center"}]

If the message is not map-related, just respond helpfully as a friendly assistant. Keep responses concise and map-focused when possible.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context } = body as {
      message: string
      context?: {
        center: [number, number]
        zoom: number
        style: string
        locationCount: number
      }
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const contextInfo = context
      ? `\n\nCurrent map context: Center at [${context.center[0].toFixed(4)}, ${context.center[1].toFixed(4)}], zoom level ${context.zoom.toFixed(1)}, style: ${context.style}, ${context.locationCount} saved locations.`
      : ''

    const chatResponse = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + contextInfo },
        { role: 'user', content: message },
      ],
      stream: false,
    })

    let responseText = ''
    if (typeof chatResponse === 'object' && chatResponse !== null) {
      if (chatResponse.choices && Array.isArray(chatResponse.choices) && chatResponse.choices.length > 0) {
        const choice = chatResponse.choices[0]
        responseText = choice.message?.content || choice.text || ''
      } else if (chatResponse.content) {
        responseText = chatResponse.content
      } else if (typeof chatResponse === 'string') {
        responseText = chatResponse
      } else {
        responseText = JSON.stringify(chatResponse)
      }
    } else if (typeof chatResponse === 'string') {
      responseText = chatResponse
    }

    // Parse actions from response
    const actions: { label: string; command: string }[] = []
    const actionsMatch = responseText.match(/ACTIONS:\s*(\[[\s\S]*?\])/)
    if (actionsMatch) {
      try {
        const parsedActions = JSON.parse(actionsMatch[1])
        if (Array.isArray(parsedActions)) {
          for (const action of parsedActions) {
            if (action.label && action.command) {
              actions.push({ label: action.label, command: action.command })
            }
          }
        }
      } catch {
        // Invalid JSON, skip actions
      }
      // Remove the ACTIONS block from the response text
      responseText = responseText.replace(/ACTIONS:\s*\[[\s\S]*?\]/, '').trim()
    }

    return NextResponse.json({
      response: responseText,
      actions: actions.length > 0 ? actions : undefined,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}

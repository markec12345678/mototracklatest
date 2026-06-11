import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface SuggestionRequest {
  latitude: number
  longitude: number
  preferences?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SuggestionRequest
    const { latitude, longitude, preferences } = body

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const preferencesText = preferences
      ? `The user has these preferences: ${preferences}.`
      : ''

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'You are a travel assistant. Based on the user\'s location, suggest 5 interesting nearby places to visit. Include name, category, brief description, and approximate distance. Respond in JSON format as an array of objects with keys: name, category, description, distance, latitude, longitude. Make sure the latitude and longitude are near the user\'s location. Categories should be one of: food, hotel, transport, entertainment, shopping, nature, culture, history. Keep descriptions to 1-2 sentences.'
        },
        {
          role: 'user',
          content: `I am at latitude ${latitude}, longitude ${longitude}. ${preferencesText} Suggest 5 interesting nearby places to visit. Respond with a JSON array only, no other text.`
        }
      ],
      thinking: { type: 'disabled' }
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    // Try to parse JSON from the response
    let suggestions
    try {
      // Extract JSON array from response (handle markdown code blocks)
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(response)
    } catch {
      // If parsing fails, return the raw response as a single suggestion
      suggestions = [
        {
          name: 'Nearby Attraction',
          category: 'culture',
          description: response.slice(0, 200),
          distance: 'Unknown',
          latitude,
          longitude,
        },
      ]
    }

    // Validate and normalize the suggestions
    const validated = Array.isArray(suggestions)
      ? suggestions.slice(0, 5).map((s: Record<string, unknown>) => ({
          name: typeof s.name === 'string' ? s.name : 'Unknown Place',
          category: typeof s.category === 'string' ? s.category : 'general',
          description: typeof s.description === 'string' ? s.description : '',
          distance: typeof s.distance === 'string' ? s.distance : String(s.distance ?? 'Nearby'),
          latitude: typeof s.latitude === 'number' ? s.latitude : latitude,
          longitude: typeof s.longitude === 'number' ? s.longitude : longitude,
        }))
      : []

    return NextResponse.json({ suggestions: validated })
  } catch (error) {
    console.error('AI Suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}

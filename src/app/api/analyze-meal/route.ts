import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    // If no API key, return mock data for development
    if (!apiKey) {
      return NextResponse.json({
        items: [
          {
            name: "Rice",
            estimated_grams: 150,
            calories: 195,
            protein_g: 4,
            carbs_g: 42,
            fat_g: 0.5,
            confidence: "high"
          },
          {
            name: "Dal (Lentils)",
            estimated_grams: 100,
            calories: 116,
            protein_g: 9,
            carbs_g: 20,
            fat_g: 0.4,
            confidence: "medium"
          },
          {
            name: "Roti",
            estimated_grams: 60,
            calories: 158,
            protein_g: 5,
            carbs_g: 31,
            fat_g: 0.9,
            confidence: "high"
          }
        ]
      })
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const base64Image = Buffer.from(bytes).toString("base64")

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this food photo. List each food item you can see, estimate the portion size and nutritional content. Return JSON: {"items": [{"name", "estimated_grams", "calories", "protein_g", "carbs_g", "fat_g", "confidence": "high|medium|low"}]}`
              },
              {
                inline_data: {
                  mime_type: image.type,
                  data: base64Image
                }
              }
            ]
          }]
        })
      }
    )

    const data = await response.json()
    
    // Parse the response - Gemini returns text that we need to parse
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    // Extract JSON from the text response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return NextResponse.json(parsed)
    }

    return NextResponse.json({ items: [] })

  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    )
  }
}

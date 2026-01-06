/**
 * OpenRouter AI client for market matching
 * Uses AI to determine if two market titles refer to the same event
 */

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1/chat/completions"

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

/**
 * Use AI to determine if two market titles refer to the same event
 * Returns a score between 0 and 1, and a boolean indicating if they match
 */
export async function matchMarketsWithAI(
  polymarketTitle: string,
  kalshiTitle: string,
): Promise<{ match: boolean; confidence: number; reasoning?: string }> {
  // Check for API key (prefer server-side env var, fallback to public)
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

  if (!apiKey) {
    console.warn("OpenRouter API key not found, falling back to basic matching")
    return { match: false, confidence: 0 }
  }

  try {
    const prompt = `You are an expert at matching prediction market questions. Determine if these two market questions refer to the same event:

Polymarket: "${polymarketTitle}"
Kalshi: "${kalshiTitle}"

Respond with a JSON object in this exact format:
{
  "match": true or false,
  "confidence": 0.0 to 1.0,
  "reasoning": "brief explanation"
}

Only respond with the JSON object, nothing else.`

    const response = await fetch(OPENROUTER_API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Arbitrage Terminal",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // Fast and cost-effective model
        messages: [
          {
            role: "system",
            content:
              "You are an expert at analyzing prediction market questions. You determine if two questions refer to the same event, even if worded differently.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent matching
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenRouter API error: ${response.status} - ${errorText}`)
      return { match: false, confidence: 0 }
    }

    const data: OpenRouterResponse = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return { match: false, confidence: 0 }
    }

    // Try to parse JSON from the response
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : content
      const result = JSON.parse(jsonStr)

      return {
        match: result.match === true,
        confidence: Math.max(0, Math.min(1, result.confidence || 0)),
        reasoning: result.reasoning,
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content)
      return { match: false, confidence: 0 }
    }
  } catch (error) {
    console.error("Error calling OpenRouter AI:", error)
    return { match: false, confidence: 0 }
  }
}

/**
 * Batch match markets using AI
 * Processes multiple pairs efficiently
 */
export async function batchMatchMarketsWithAI(
  pairs: Array<{ polymarketTitle: string; kalshiTitle: string }>,
): Promise<Array<{ match: boolean; confidence: number; reasoning?: string }>> {
  // Check for API key (prefer server-side env var, fallback to public)
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

  if (!apiKey) {
    return pairs.map(() => ({ match: false, confidence: 0 }))
  }

  // For now, process in batches to avoid rate limits
  // OpenRouter can handle multiple requests, but we'll batch to be safe
  const batchSize = 10
  const results: Array<{ match: boolean; confidence: number; reasoning?: string }> = []

  for (let i = 0; i < pairs.length; i += batchSize) {
    const batch = pairs.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((pair) => matchMarketsWithAI(pair.polymarketTitle, pair.kalshiTitle)),
    )
    results.push(...batchResults)

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < pairs.length) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  return results
}


/**
 * Market matching logic
 * Matches equivalent markets across platforms
 * Uses AI (OpenRouter) for intelligent matching when available
 */

import type { NormalizedMarket } from "./normalize"
import type { PolymarketMarket } from "./api/polymarket"
import type { KalshiMarket } from "./api/kalshi"
import { normalizeEventTitle } from "./normalize"
// AI matching removed - using basic similarity only
import { normalizePolymarketMarket, normalizeKalshiMarket } from "./normalize"

export type MatchedMarket = {
  eventTitle: string
  polymarket: NormalizedMarket
  kalshi: NormalizedMarket
}

/**
 * Advanced similarity calculation with multiple techniques
 * Based on best practices from prediction market matching systems
 */
function calculateSimilarity(title1: string, title2: string): number {
  const normalized1 = normalizeEventTitle(title1)
  const normalized2 = normalizeEventTitle(title2)

  // 1. Exact match
  if (normalized1 === normalized2) {
    return 1.0
  }

  // 2. Check if one contains the other (substring match)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    // Weight by length ratio to avoid false positives
    const shorter = Math.min(normalized1.length, normalized2.length)
    const longer = Math.max(normalized1.length, normalized2.length)
    const lengthRatio = shorter / longer
    return 0.7 + (lengthRatio * 0.2) // 0.7-0.9 range
  }

  // 3. Word-based similarity (Jaccard with improvements)
  const words1 = normalized1.split(" ").filter(w => w.length > 2) // Filter out short words
  const words2 = normalized2.split(" ").filter(w => w.length > 2)
  
  if (words1.length === 0 || words2.length === 0) {
    return 0
  }

  const set1 = new Set(words1)
  const set2 = new Set(words2)
  
  // Calculate intersection and union
  const intersection = new Set([...set1].filter((x) => set2.has(x)))
  const union = new Set([...set1, ...set2])
  
  const jaccard = intersection.size / union.size

  // 4. Keyword matching - give extra weight to important keywords
  const importantKeywords = ["trump", "biden", "bitcoin", "ethereum", "election", "president", 
                            "world cup", "super bowl", "nfl", "nba", "nhl", "mlb",
                            "inflation", "fed", "rate", "gdp", "unemployment"]
  
  let keywordBonus = 0
  const lower1 = normalized1.toLowerCase()
  const lower2 = normalized2.toLowerCase()
  
  for (const keyword of importantKeywords) {
    const has1 = lower1.includes(keyword)
    const has2 = lower2.includes(keyword)
    if (has1 && has2) {
      keywordBonus += 0.1 // Add 0.1 for each shared keyword
    } else if (has1 !== has2) {
      keywordBonus -= 0.05 // Penalize if only one has the keyword
    }
  }
  keywordBonus = Math.max(-0.2, Math.min(0.3, keywordBonus)) // Cap bonus/penalty

  // 5. Character-level similarity (Levenshtein-like, simplified)
  const longer = normalized1.length > normalized2.length ? normalized1 : normalized2
  const shorter = normalized1.length > normalized2.length ? normalized2 : normalized1
  const charSimilarity = longer.includes(shorter) ? 0.5 : 0
  
  // 6. Date/number matching - extract and compare dates/numbers
  const numbers1 = normalized1.match(/\d+/g) || []
  const numbers2 = normalized2.match(/\d+/g) || []
  let numberMatch = 0
  if (numbers1.length > 0 && numbers2.length > 0) {
    const commonNumbers = numbers1.filter(n => numbers2.includes(n))
    numberMatch = commonNumbers.length / Math.max(numbers1.length, numbers2.length) * 0.2
  }

  // Combine all scores with weights
  const finalScore = 
    jaccard * 0.5 +           // Base Jaccard similarity (50%)
    charSimilarity * 0.1 +     // Character similarity (10%)
    numberMatch +              // Number/date matching (up to 20%)
    keywordBonus +             // Keyword bonus/penalty (up to 30%)
    0.1                        // Small base score

  return Math.max(0, Math.min(1, finalScore))
}

/**
 * Match raw markets across platforms (market-to-market comparison)
 * Compares Polymarket "question" with Kalshi "event_title" directly
 * Then extracts outcomes from matched markets
 */
export async function matchRawMarkets(
  polymarketMarkets: PolymarketMarket[],
  kalshiMarkets: KalshiMarket[],
): Promise<MatchedMarket[]> {
  const matched: MatchedMarket[] = []
  const usedKalshi = new Set<string>()
  const useAI = !!(process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY)

  console.log(`Using ${useAI ? "AI-enhanced" : "advanced"} matching algorithm`)
  console.log(`Comparing ${polymarketMarkets.length} Polymarket markets with ${kalshiMarkets.length} Kalshi markets`)

  // First, do a quick filter using basic similarity
  const candidatePairs: Array<{
    polyMarket: PolymarketMarket
    kalshiMarket: KalshiMarket
    basicSimilarity: number
  }> = []

  for (const polyMarket of polymarketMarkets) {
    if (!polyMarket.question) {
      continue
    }

    for (const kalshiMarket of kalshiMarkets) {
      const kalshiTitle = kalshiMarket.event_title || ""
      if (!kalshiTitle) {
        continue
      }

      // Check if already used
      const kalshiId = kalshiMarket.ticker || kalshiMarket.event_ticker || ""
      if (usedKalshi.has(kalshiId)) {
        continue
      }

      // Calculate basic similarity: Polymarket "question" vs Kalshi "event_title"
      const basicSimilarity = calculateSimilarity(polyMarket.question, kalshiTitle)

      // Use lower threshold for initial filtering (0.25) to catch more potential matches
      // AI will verify them later
      if (basicSimilarity >= 0.25) {
        candidatePairs.push({
          polyMarket,
          kalshiMarket,
          basicSimilarity,
        })
      }
    }
  }

  console.log(`📊 Found ${candidatePairs.length} candidate market pairs with similarity >= 0.25`)
  
  // Sort by basic similarity (best first) BEFORE displaying stats
  candidatePairs.sort((a, b) => b.basicSimilarity - a.basicSimilarity)
  
  if (candidatePairs.length > 0) {
    const avgSimilarity = candidatePairs.reduce((sum, c) => sum + c.basicSimilarity, 0) / candidatePairs.length
    const maxSimilarity = candidatePairs[0]?.basicSimilarity || 0
    const minSimilarity = candidatePairs[candidatePairs.length - 1]?.basicSimilarity || 0
    console.log(`   Average similarity: ${avgSimilarity.toFixed(3)}`)
    console.log(`   Max similarity: ${maxSimilarity.toFixed(3)}, Min similarity: ${minSimilarity.toFixed(3)}`)
    
    // Show top 10 candidate pairs
    const topCandidates = candidatePairs.slice(0, 10)
    console.log(`\n📋 Top ${topCandidates.length} candidate market pairs (by similarity):`)
    console.log(`   ┌────────────────────────────────────────────────────────────────────────────────────┐`)
    topCandidates.forEach((candidate, idx) => {
      const polyTitle = candidate.polyMarket.question || ""
      const kalshiTitle = candidate.kalshiMarket.event_title || ""
      const maxLen = Math.max(polyTitle.length, kalshiTitle.length, 60)
      
      console.log(`   │ ${idx + 1}. Similarity: ${candidate.basicSimilarity.toFixed(3)}`)
      console.log(`   │ ${"─".repeat(80)}`)
      console.log(`   │ Polymarket (question): ${polyTitle.padEnd(maxLen)} │`)
      console.log(`   │ Kalshi (event_title):   ${kalshiTitle.padEnd(maxLen)} │`)
      console.log(`   │`)
    })
    console.log(`   └────────────────────────────────────────────────────────────────────────────────────┘`)
    if (candidatePairs.length > 10) {
      console.log(`   ... and ${candidatePairs.length - 10} more candidates`)
    }
    console.log(``)
  }

  // Use AI to verify top candidates if available
  const aiVerifiedSet = new Set<string>() // Track verified pairs by key
  const aiCandidates = useAI ? candidatePairs.slice(0, 100) : [] // Limit to top 100 for AI to avoid costs
  
  if (useAI && aiCandidates.length > 0) {
    console.log(`\n🤖 Using AI to verify top ${aiCandidates.length} candidate pairs...`)
    const { matchMarketsWithAI } = await import("./api/openrouter")
    
    for (let i = 0; i < aiCandidates.length; i += 10) {
      const batch = aiCandidates.slice(i, i + 10)
      const aiResults = await Promise.all(
        batch.map((candidate) =>
          matchMarketsWithAI(candidate.polyMarket.question || "", candidate.kalshiMarket.event_title || ""),
        ),
      )

      for (let j = 0; j < batch.length; j++) {
        const candidate = batch[j]
        const aiResult = aiResults[j]
        
        // AI match with confidence >= 0.7
        if (aiResult.match && aiResult.confidence >= 0.7) {
          const key = `${candidate.polyMarket.id}-${candidate.kalshiMarket.ticker || candidate.kalshiMarket.event_ticker}`
          aiVerifiedSet.add(key)
        }
      }

      // Small delay between batches
      if (i + 10 < aiCandidates.length) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }
    
    console.log(`✓ AI verified ${aiVerifiedSet.size} matches out of ${aiCandidates.length} candidates`)
  }
  
  // Use AI-verified pairs if available, otherwise use basic matching with higher threshold
  const remainingCandidates = useAI && aiVerifiedSet.size > 0 
    ? candidatePairs.filter(c => {
        const key = `${c.polyMarket.id}-${c.kalshiMarket.ticker || c.kalshiMarket.event_ticker}`
        return aiVerifiedSet.has(key)
      })
    : candidatePairs.filter(c => c.basicSimilarity >= 0.4) // Higher threshold if no AI
  
  if (remainingCandidates.length > 0) {
    const threshold = useAI && aiVerifiedSet.size > 0 ? 0.0 : 0.4
    console.log(`\n📝 Processing ${remainingCandidates.length} ${useAI && aiVerifiedSet.size > 0 ? 'AI-verified' : 'high-similarity'} candidates...`)
    
    for (const candidate of remainingCandidates) {
      const kalshiId = candidate.kalshiMarket.ticker || candidate.kalshiMarket.event_ticker || ""
      if (usedKalshi.has(kalshiId)) {
        continue
      }

      // If AI verified, accept all. Otherwise use threshold 0.4
      const key = `${candidate.polyMarket.id}-${candidate.kalshiMarket.ticker || candidate.kalshiMarket.event_ticker}`
      const isAIVerified = useAI && aiVerifiedSet.has(key)
      
      if (!isAIVerified && candidate.basicSimilarity < threshold) {
        continue
      }

      console.log(`   ✓ Match (similarity: ${candidate.basicSimilarity.toFixed(3)})`)
      console.log(`      Polymarket: "${candidate.polyMarket.question}"`)
      console.log(`      Kalshi:     "${candidate.kalshiMarket.event_title}"`)
      
      // Extract outcomes from matched markets
      const polyOutcomes = normalizePolymarketMarket(candidate.polyMarket)
      const kalshiOutcomes = normalizeKalshiMarket(candidate.kalshiMarket)
      
      console.log(`      Extracted ${polyOutcomes.length} Polymarket outcomes, ${kalshiOutcomes.length} Kalshi outcomes`)
      
      // Show price info for extracted outcomes
      if (polyOutcomes.length > 0) {
        console.log(`      Polymarket prices: ${polyOutcomes.map(o => `${o.outcome}=${o.price.toFixed(4)}`).join(', ')}`)
      }
      if (kalshiOutcomes.length > 0) {
        console.log(`      Kalshi prices: ${kalshiOutcomes.map(o => `${o.outcome}=${o.price.toFixed(4)}`).join(', ')}`)
      }
      
      // Debug: Show why Polymarket outcomes might be empty
      if (polyOutcomes.length === 0) {
        console.log(`      🔍 Debug Polymarket market ${candidate.polyMarket.id}:`)
        console.log(`         Question: "${candidate.polyMarket.question || 'N/A'}"`)
        const outcomesStr = candidate.polyMarket.outcomes 
          ? JSON.stringify(candidate.polyMarket.outcomes).substring(0, 200) 
          : 'undefined'
        const pricesStr = candidate.polyMarket.outcomePrices 
          ? JSON.stringify(candidate.polyMarket.outcomePrices).substring(0, 200) 
          : 'undefined'
        console.log(`         Outcomes field: ${typeof candidate.polyMarket.outcomes} - ${outcomesStr}`)
        console.log(`         OutcomePrices field: ${typeof candidate.polyMarket.outcomePrices} - ${pricesStr}`)
      }
      
      // Match outcomes from both markets
      let outcomeMatches = 0
      for (const polyOutcome of polyOutcomes) {
        for (const kalshiOutcome of kalshiOutcomes) {
          if (polyOutcome.outcome === kalshiOutcome.outcome) {
            matched.push({
              eventTitle: candidate.polyMarket.question || "",
              polymarket: polyOutcome,
              kalshi: kalshiOutcome,
            })
            outcomeMatches++
          }
        }
      }
      
      if (outcomeMatches === 0) {
        console.log(`      ⚠️  No matching outcomes found (Poly: ${polyOutcomes.map(o => o.outcome).join(', ') || 'none'}, Kalshi: ${kalshiOutcomes.map(o => o.outcome).join(', ')})`)
      } else {
        console.log(`      ✓ Created ${outcomeMatches} matched outcome pairs`)
      }
      
      usedKalshi.add(kalshiId)
    }
  }

  return matched
}

/**
 * Match markets across platforms using normalized outcomes (legacy function)
 * Kept for backward compatibility
 */
export async function matchMarkets(markets: NormalizedMarket[]): Promise<MatchedMarket[]> {
  // This is the old function that works on normalized outcomes
  // We'll redirect to the new raw market matching if possible
  // For now, keep the old logic but it's deprecated
  const polymarketMarkets = markets.filter((m) => m.platform === "polymarket")
  const kalshiMarkets = markets.filter((m) => m.platform === "kalshi")

  const matched: MatchedMarket[] = []
  const usedKalshi = new Set<string>()

  console.log(`Using basic matching algorithm (legacy normalized mode)`)

  const candidatePairs: Array<{
    polyMarket: NormalizedMarket
    kalshiMarket: NormalizedMarket
    basicSimilarity: number
  }> = []

  for (const polyMarket of polymarketMarkets) {
    for (const kalshiMarket of kalshiMarkets) {
      if (polyMarket.outcome !== kalshiMarket.outcome) {
        continue
      }

      if (usedKalshi.has(kalshiMarket.marketId)) {
        continue
      }

      const basicSimilarity = calculateSimilarity(polyMarket.eventTitle, kalshiMarket.eventTitle)

      if (basicSimilarity >= 0.3) {
        candidatePairs.push({
          polyMarket,
          kalshiMarket,
          basicSimilarity,
        })
      }
    }
  }

  console.log(`📊 Found ${candidatePairs.length} candidate pairs with similarity >= 0.3`)
  candidatePairs.sort((a, b) => b.basicSimilarity - a.basicSimilarity)

  // AI matching removed - using basic similarity only
  // Process all candidates with basic matching (threshold: 0.5)
  for (const candidate of candidatePairs) {
    if (candidate.basicSimilarity >= 0.5 && !usedKalshi.has(candidate.kalshiMarket.marketId)) {
      matched.push({
        eventTitle: candidate.polyMarket.eventTitle,
        polymarket: candidate.polyMarket,
        kalshi: candidate.kalshiMarket,
      })
      usedKalshi.add(candidate.kalshiMarket.marketId)
    }
  }

  return matched
}


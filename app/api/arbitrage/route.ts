/**
 * GET /api/arbitrage
 * Returns matched markets with arbitrage calculations
 */

import { NextResponse } from "next/server"
import { fetchAllPolymarketMarkets } from "@/lib/api/polymarket"
import { fetchKalshiMarkets } from "@/lib/api/kalshi"
import { matchRawMarkets } from "@/lib/matching"
import { calculateAllArbitrages, type ArbitrageConfig } from "@/lib/arbitrage"
import { arbitrageCache } from "@/lib/cache"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const minProfitPercent = searchParams.get("minProfitPercent")
      ? parseFloat(searchParams.get("minProfitPercent")!)
      : undefined
    const forceRefresh = searchParams.has("_t") // Cache busting parameter

    // Build cache key including config
    const cacheKey = `arbitrage-${minProfitPercent || "default"}`

    // Check cache first (skip if force refresh)
    if (!forceRefresh) {
      const cached = arbitrageCache.get(cacheKey)
      if (cached) {
        return NextResponse.json(cached)
      }
    }

    console.log(`\n🔍 Searching for arbitrage opportunities...`)
    console.log(`Minimum profit threshold: ${minProfitPercent || 5.0}%`)

    // Fetch data from both platforms in parallel
    console.log(`📊 Loading market data from Polymarket and Kalshi...`)
    const [polymarketMarkets, kalshiMarkets] = await Promise.all([
      fetchAllPolymarketMarkets(),
      fetchKalshiMarkets(),
    ])

    console.log(`✓ Loaded ${polymarketMarkets.length} Polymarket markets`)
    console.log(`✓ Loaded ${kalshiMarkets.length} Kalshi markets`)

    // Match markets directly (market-to-market comparison)
    // This compares Polymarket "question" with Kalshi "event_title" directly
    // Then extracts outcomes from matched markets
    console.log(`🔗 Matching markets across platforms...`)
    const matchedMarkets = await matchRawMarkets(polymarketMarkets, kalshiMarkets)
    console.log(`✓ Found ${matchedMarkets.length} matched market pairs`)

    // Calculate arbitrage opportunities
    console.log(`💰 Calculating arbitrage opportunities...`)
    const config: ArbitrageConfig = {
      minProfitPercent: minProfitPercent || 5.0,
    }
    const opportunities = calculateAllArbitrages(matchedMarkets, config)
    
    // Filter out resolved markets (using isResolved flag or price check)
    // Use same threshold as in calculateArbitrage (0.5%)
    const RESOLVED_THRESHOLD = 0.005 // 0.5% threshold - very strict
    const activeOpportunities = opportunities.filter((o) => {
      // Use isResolved flag if available, otherwise check prices
      if (o.isResolved !== undefined) {
        return !o.isResolved
      }
      // Fallback: check prices only (don't filter by close date - closed markets can still have valid prices)
      const polyResolved = o.polymarketPrice <= RESOLVED_THRESHOLD || o.polymarketPrice >= (1 - RESOLVED_THRESHOLD)
      const kalshiResolved = o.kalshiPrice <= RESOLVED_THRESHOLD || o.kalshiPrice >= (1 - RESOLVED_THRESHOLD)
      return !polyResolved && !kalshiResolved
    })
    
    // Deduplicate: For each Polymarket market, keep only the best match (highest absolute spread)
    // Group by Polymarket market ID and outcome, then keep the one with highest absolute spread
    const deduplicated = new Map<string, typeof activeOpportunities[0]>()
    for (const opp of activeOpportunities) {
      const key = `${opp.polymarketMarketId}-${opp.outcome}`
      const existing = deduplicated.get(key)
      if (!existing || Math.abs(opp.profitPercent) > Math.abs(existing.profitPercent)) {
        deduplicated.set(key, opp)
      }
    }
    const deduplicatedOpportunities = Array.from(deduplicated.values())
    
    const resolvedCount = opportunities.length - activeOpportunities.length
    const deduplicatedCount = activeOpportunities.length - deduplicatedOpportunities.length
    const arbitrageCount = deduplicatedOpportunities.filter((o) => o.arbitrage).length
    
    console.log(`✓ Found ${opportunities.length} total matched markets:`)
    console.log(`  - ${activeOpportunities.length} with valid prices (not resolved)`)
    console.log(`  - ${deduplicatedCount} duplicates removed (kept best match per Polymarket market)`)
    console.log(`  - ${deduplicatedOpportunities.length} unique opportunities`)
    console.log(`  - ${resolvedCount} resolved markets (filtered out)`)
    console.log(`  - ${arbitrageCount} arbitrage opportunities (spread >= ${config.minProfitPercent}%)`)
    console.log(`\n`)

    // Format response - only return deduplicated active (non-resolved) opportunities
    const response = {
      opportunities: deduplicatedOpportunities,
      count: deduplicatedOpportunities.length,
      arbitrageCount: arbitrageCount,
      raw: {
        polymarket: polymarketMarkets, // Return ALL markets (no filtering)
        kalshi: kalshiMarkets,
      },
      rawCounts: {
        polymarket: polymarketMarkets.length, // Count of ALL markets
        kalshi: kalshiMarkets.length,
      },
      config: {
        minProfitPercent: config.minProfitPercent,
      },
      timestamp: new Date().toISOString(),
    }

    // Cache the result
    arbitrageCache.set(cacheKey, response, 600000) // 10 minutes TTL

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in /api/arbitrage:", error)
    return NextResponse.json(
      {
        error: "Failed to calculate arbitrage opportunities",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}


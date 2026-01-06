/**
 * GET /api/markets
 * Returns normalized markets from both Polymarket and Kalshi
 */

import { NextResponse } from "next/server"
import { fetchAllPolymarketMarkets } from "@/lib/api/polymarket"
import { fetchKalshiMarkets } from "@/lib/api/kalshi"
import { normalizeAllMarkets } from "@/lib/normalize"
import { marketsCache } from "@/lib/cache"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    // Parse query parameters for cache busting
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.has("_t") // Cache busting parameter

    // Check cache first (skip if force refresh)
    const cacheKey = "markets"
    if (!forceRefresh) {
      const cached = marketsCache.get(cacheKey)
      if (cached) {
        return NextResponse.json(cached)
      }
    }

    // Fetch data from both platforms in parallel
    const [polymarketMarkets, kalshiMarkets] = await Promise.all([
      fetchAllPolymarketMarkets(),
      fetchKalshiMarkets(),
    ])

    console.log(`✓ Fetched ${polymarketMarkets.length} Polymarket markets`)
    console.log(`✓ Fetched ${kalshiMarkets.length} Kalshi markets`)

    // Normalize all markets
    const normalizedMarkets = normalizeAllMarkets(polymarketMarkets, kalshiMarkets)

    // Display normalized market counts
    const polymarketNormalizedCount = normalizedMarkets.filter((m) => m.platform === "polymarket").length
    const kalshiNormalizedCount = normalizedMarkets.filter((m) => m.platform === "kalshi").length
    console.log(`Polymarket: ${polymarketMarkets.length} markets → ${polymarketNormalizedCount} normalized outcomes`)
    console.log(`Kalshi: ${kalshiMarkets.length} markets → ${kalshiNormalizedCount} normalized outcomes`)
    console.log(`Total: ${normalizedMarkets.length} normalized market outcomes`)

    // Cache the result
    marketsCache.set(cacheKey, normalizedMarkets, 600000) // 10 minutes TTL

    return NextResponse.json({
      markets: normalizedMarkets,
      raw: {
        polymarket: polymarketMarkets, // Return ALL markets (no filtering)
        kalshi: kalshiMarkets,
      },
      count: normalizedMarkets.length,
      polymarketCount: normalizedMarkets.filter((m) => m.platform === "polymarket").length,
      kalshiCount: normalizedMarkets.filter((m) => m.platform === "kalshi").length,
      rawCounts: {
        polymarket: polymarketMarkets.length, // Count of ALL markets
        kalshi: kalshiMarkets.length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in /api/markets:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch markets",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}


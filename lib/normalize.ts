/**
 * Market normalization module
 * Converts platform-specific data into a unified format
 */

import type { PolymarketMarket } from "./api/polymarket"
import type { KalshiMarket } from "./api/kalshi"
import { normalizeOutcome } from "./api/polymarket"

export type NormalizedMarket = {
  platform: "polymarket" | "kalshi"
  marketId: string
  eventTitle: string
  outcome: "YES" | "NO"
  price: number
  liquidity?: number
  closesAt?: string
  // URL construction fields
  slug?: string // Polymarket slug
  conditionId?: string // Polymarket condition ID
  // Kalshi URL fields
  seriesTicker?: string // Kalshi series ticker (e.g., "KXSB")
  seriesTitle?: string // Kalshi series title (e.g., "Super Bowl")
  eventTicker?: string // Kalshi event ticker (e.g., "KXSB-26")
}

/**
 * Normalize event title for matching
 * Advanced normalization to improve matching accuracy
 */
export function normalizeEventTitle(title: string): string {
  return title
    .toLowerCase()
    // Remove common prefixes/suffixes that don't affect meaning
    .replace(/^(will|does|did|is|are|was|were)\s+/i, "")
    .replace(/\s+(happen|occur|take place|be true|be false)\??$/i, "")
    // Normalize common abbreviations
    .replace(/\b(donald|don)\s+trump\b/g, "trump")
    .replace(/\b(joe|joseph)\s+biden\b/g, "biden")
    .replace(/\bworld\s+cup\b/g, "worldcup")
    .replace(/\bsuper\s+bowl\b/g, "superbowl")
    // Remove punctuation but keep numbers and spaces
    .replace(/[^\w\s\d]/g, " ")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    // Remove common stop words that don't affect matching
    .replace(/\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Convert Polymarket market to normalized format
 */
export function normalizePolymarketMarket(market: PolymarketMarket): NormalizedMarket[] {
  const normalized: NormalizedMarket[] = []

  if (!market.question) {
    return normalized
  }

  // Parse outcomes - can be JSON string or array
  let outcomesArray: string[] = []
  if (typeof market.outcomes === "string") {
    try {
      outcomesArray = JSON.parse(market.outcomes)
    } catch (e) {
      // Try to extract outcomes from the string directly if JSON parse fails
      return normalized
    }
  } else if (Array.isArray(market.outcomes)) {
    // If it's already an array, extract outcome names
    outcomesArray = market.outcomes.map((outcome: any) => {
      if (typeof outcome === "string") return outcome
      return outcome.title || outcome.outcome || outcome.name || ""
    })
  } else {
    // No outcomes field or invalid format
    return normalized
  }

  if (outcomesArray.length === 0) {
    return normalized
  }

  // Parse outcome prices - can be JSON string or array
  let pricesArray: number[] = []
  if (typeof market.outcomePrices === "string") {
    try {
      const pricesStr = JSON.parse(market.outcomePrices)
      pricesArray = pricesStr.map((p: string | number) => parseFloat(String(p)))
    } catch (e) {
      console.log(`⚠️  Skipping Polymarket market ${market.id}: Cannot parse outcomePrices JSON string`)
      return normalized
    }
  } else if (Array.isArray(market.outcomePrices)) {
    pricesArray = market.outcomePrices.map((p: string | number) => parseFloat(String(p)))
  }

  // Match outcomes with prices by index
  for (let i = 0; i < outcomesArray.length; i++) {
    const outcomeName = outcomesArray[i]
    const outcome = normalizeOutcome(outcomeName)
    
    if (!outcome) {
      // Skip if outcome can't be normalized to YES/NO
      continue
    }

    // Get price for this outcome (by index)
    let price: number
    if (pricesArray.length > i) {
      price = pricesArray[i]
    } else {
      // If no price array, try to use last_price or other price fields
      if (market.last_price_dollars) {
        price = parseFloat(market.last_price_dollars)
      } else if (market.last_price !== undefined) {
        price = typeof market.last_price === "number" ? market.last_price : parseFloat(String(market.last_price))
      } else {
        // No price available for this outcome
        continue
      }
    }

    // Validate price is a number between 0 and 1 (inclusive)
    if (isNaN(price) || price < 0 || price > 1) {
      continue // Skip invalid prices (outside 0-1 range)
    }
    
    // Include all valid prices (including 0 and 1) - we'll filter resolved markets later during arbitrage calculation
    // This allows us to see all matched markets, not just those with arbitrage potential

    // Handle liquidity - prefer liquidityNum, fallback to liquidity
    const liquidity = market.liquidityNum !== undefined 
      ? market.liquidityNum 
      : (typeof market.liquidity === "number" ? market.liquidity : parseFloat(String(market.liquidity)))

    // Handle endDate - prefer endDateIso (camelCase), fallback to endDateISO, then endDate
    let closesAt: string | undefined
    if (market.endDateIso) {
      closesAt = market.endDateIso
    } else if (market.endDateISO) {
      closesAt = market.endDateISO
    } else if (market.closedTime) {
      closesAt = market.closedTime
    } else if (market.endDate) {
      // Try parsing as ISO string or timestamp
      if (typeof market.endDate === "string" && market.endDate.includes("T")) {
        closesAt = market.endDate
      } else {
        const timestamp = parseInt(String(market.endDate))
        if (!isNaN(timestamp)) {
          const date = timestamp < 946684800 ? new Date(timestamp * 1000) : new Date(timestamp)
          closesAt = date.toISOString()
        }
      }
    }

    normalized.push({
      platform: "polymarket",
      marketId: market.id,
      eventTitle: market.question,
      outcome,
      price,
      liquidity: isNaN(liquidity) ? undefined : liquidity,
      closesAt,
      slug: market.slug || market.eventSlug,
      conditionId: market.conditionId,
    })
  }

  return normalized
}

/**
 * Convert Kalshi market to normalized format
 */
export function normalizeKalshiMarket(market: KalshiMarket): NormalizedMarket[] {
  const normalized: NormalizedMarket[] = []

  // Kalshi has yes_ask_dollars and yes_bid_dollars fields (already in dollars as strings)
  // Use mid price: (bid + ask) / 2
  let yesPrice: number
  let noPrice: number

  if (market.yes_bid_dollars && market.yes_ask_dollars) {
    // Both bid and ask in dollars - use mid price
    const yesBid = parseFloat(market.yes_bid_dollars)
    const yesAsk = parseFloat(market.yes_ask_dollars)
    yesPrice = (yesBid + yesAsk) / 2
  } else if (market.yes_ask_dollars) {
    // Only ask available
    yesPrice = parseFloat(market.yes_ask_dollars)
  } else if (market.yes_bid_dollars) {
    // Only bid available
    yesPrice = parseFloat(market.yes_bid_dollars)
  } else if (market.yes_bid !== undefined && market.yes_ask !== undefined) {
    // Prices in cents, convert to decimal
    yesPrice = (market.yes_bid + market.yes_ask) / 2 / 100
  } else if (market.last_price_dollars) {
    yesPrice = parseFloat(market.last_price_dollars)
  } else if (market.last_price !== undefined) {
    yesPrice = market.last_price / 100
  } else {
    // No price data available
    return normalized
  }

  // Calculate NO price from YES price (they should sum to 1.0)
  noPrice = 1.0 - yesPrice

  // Kalshi markets use event_title field (not title)
  const eventTitle = market.event_title || ""

  if (!eventTitle) {
    console.log(`⚠️  Skipping Kalshi market ${market.ticker}: No event_title`)
    return normalized
  }

  // Use ticker as marketId
  const marketId = market.ticker || market.event_ticker || ""

  // Use close_ts or expected_expiration_ts for closesAt
  const closesAt = market.close_ts || market.expected_expiration_ts

  if (yesPrice > 0 && yesPrice < 1) {
    normalized.push({
      platform: "kalshi",
      marketId: marketId,
      eventTitle: eventTitle,
      outcome: "YES",
      price: yesPrice,
      liquidity: market.volume,
      closesAt: closesAt,
      seriesTicker: market.series_ticker,
      seriesTitle: market.series_title,
      eventTicker: market.event_ticker,
    })
  }

  if (noPrice > 0 && noPrice < 1) {
    normalized.push({
      platform: "kalshi",
      marketId: marketId,
      eventTitle: eventTitle,
      outcome: "NO",
      price: noPrice,
      liquidity: market.volume,
      closesAt: closesAt,
      seriesTicker: market.series_ticker,
      seriesTitle: market.series_title,
      eventTicker: market.event_ticker,
    })
  }

  return normalized
}

/**
 * Normalize all markets from both platforms
 */
export function normalizeAllMarkets(
  polymarketMarkets: PolymarketMarket[],
  kalshiMarkets: KalshiMarket[],
): NormalizedMarket[] {
  const normalized: NormalizedMarket[] = []

  console.log(`\n🔄 Starting normalization...`)
  console.log(`   Polymarket markets to process: ${polymarketMarkets.length}`)
  console.log(`   Kalshi markets to process: ${kalshiMarkets.length}`)

  // Normalize Polymarket markets
  let polymarketNormalized = 0
  for (const market of polymarketMarkets) {
    const result = normalizePolymarketMarket(market)
    normalized.push(...result)
    if (result.length > 0) {
      polymarketNormalized++
    }
  }
  console.log(`   ✓ Normalized ${polymarketNormalized} Polymarket markets into ${normalized.filter(m => m.platform === "polymarket").length} outcomes`)

  // Normalize Kalshi markets
  let kalshiNormalized = 0
  for (const market of kalshiMarkets) {
    const result = normalizeKalshiMarket(market)
    normalized.push(...result)
    if (result.length > 0) {
      kalshiNormalized++
    }
  }
  console.log(`   ✓ Normalized ${kalshiNormalized} Kalshi markets into ${normalized.filter(m => m.platform === "kalshi").length} outcomes`)

  return normalized
}


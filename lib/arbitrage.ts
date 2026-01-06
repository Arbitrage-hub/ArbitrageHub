/**
 * Arbitrage calculation module
 * Calculates spreads and identifies arbitrage opportunities
 * Based on the concept: true arbitrage exists when you can buy both YES and NO
 * positions for less than $1 total, guaranteeing a risk-free profit
 */

import type { MatchedMarket } from "./matching"

export interface ArbitrageOpportunity {
  event: string
  outcome: "YES" | "NO"
  polymarketPrice: number
  kalshiPrice: number
  spread: number
  profitPercent: number
  arbitrage: boolean
  polymarketMarketId: string
  kalshiMarketId: string
  polymarketSlug?: string // For constructing Polymarket URLs
  polymarketConditionId?: string // Alternative URL format
  // Kalshi URL fields
  kalshiSeriesTicker?: string
  kalshiSeriesTitle?: string
  kalshiEventTicker?: string
  liquidity?: {
    polymarket?: number
    kalshi?: number
  }
  closesAt?: string
  isResolved?: boolean // Flag to indicate if market is resolved
  // True arbitrage metrics
  totalCost?: number // Cost to buy both YES and NO positions
  guaranteedProfit?: number // Guaranteed profit if totalCost < 1.0
  arbitrageType?: "spread" | "true" // Type of arbitrage detected
}

/**
 * Configuration for arbitrage detection
 */
export interface ArbitrageConfig {
  minProfitPercent?: number // Minimum profit % to flag as arbitrage
  minTrueArbitrageProfit?: number // Minimum profit for true arbitrage (totalCost < 1.0)
  transactionFee?: number // Estimated transaction fee (default 0.01 = 1%)
}

const DEFAULT_CONFIG: ArbitrageConfig = {
  minProfitPercent: 5.0, // 5% minimum profit for spread arbitrage
  minTrueArbitrageProfit: 0.01, // 1% minimum profit for true arbitrage
  transactionFee: 0.01, // 1% transaction fee estimate
}

/**
 * Calculate arbitrage opportunity for a matched market pair
 */
export function calculateArbitrage(
  matched: MatchedMarket,
  config: ArbitrageConfig = DEFAULT_CONFIG,
): ArbitrageOpportunity {
  const { polymarket, kalshi } = matched

  // Check if market is resolved (price very close to 0 or 1)
  // Use stricter threshold - only filter if price is <= 0.005 or >= 0.995 (0.5% threshold)
  // This allows markets with prices like 0.97/0.03 to pass through
  // NOTE: We don't check closesAt date - a closed market can still have valid prices if not yet resolved
  const RESOLVED_THRESHOLD = 0.005 // 0.5% threshold - very strict
  const polyResolved = polymarket.price <= RESOLVED_THRESHOLD || polymarket.price >= (1 - RESOLVED_THRESHOLD)
  const kalshiResolved = kalshi.price <= RESOLVED_THRESHOLD || kalshi.price >= (1 - RESOLVED_THRESHOLD)
  
  const closesAt = polymarket.closesAt || kalshi.closesAt
  // Only mark as resolved if prices are at extremes, not based on close date
  const isResolved = polyResolved || kalshiResolved
  
  // If market is resolved, mark it but still return the data (will be filtered later)
  if (isResolved) {
    return {
      event: matched.eventTitle,
      outcome: polymarket.outcome,
      polymarketPrice: polymarket.price,
      kalshiPrice: kalshi.price,
      spread: kalshi.price - polymarket.price,
      profitPercent: (kalshi.price - polymarket.price) * 100,
      arbitrage: false, // No arbitrage for resolved markets
      polymarketMarketId: polymarket.marketId,
      kalshiMarketId: kalshi.marketId,
      polymarketSlug: polymarket.slug,
      polymarketConditionId: polymarket.conditionId,
      kalshiSeriesTicker: kalshi.seriesTicker,
      kalshiSeriesTitle: kalshi.seriesTitle,
      kalshiEventTicker: kalshi.eventTicker,
      liquidity: {
        polymarket: polymarket.liquidity,
        kalshi: kalshi.liquidity,
      },
      closesAt,
      isResolved: true,
    }
  }

  // Calculate spread: kalshi.price - polymarket.price
  // Positive spread means Kalshi is more expensive (buy Poly, sell Kalshi)
  // Negative spread means Polymarket is more expensive (buy Kalshi, sell Poly)
  const spread = kalshi.price - polymarket.price

  // Calculate profit percentage: spread * 100
  const profitPercent = spread * 100

  // TRUE ARBITRAGE DETECTION (based on GitHub repo logic):
  // True arbitrage exists when you can buy both YES and NO positions for less than $1
  // Strategy: Buy YES on the cheaper platform, buy NO on the cheaper platform
  // If total cost < 1.0, you're guaranteed to win $1 (profit = 1.0 - totalCost)
  
  // For binary markets, if we have YES price, NO price = 1 - YES price (and vice versa)
  // We need to get both YES and NO prices from the same market pair
  // Since we're processing one outcome at a time, we calculate the opposite outcome price
  
  // Get YES and NO prices for Polymarket (from the same market)
  // If current outcome is YES, use its price; NO price = 1 - YES price
  // If current outcome is NO, use its price; YES price = 1 - NO price
  const polyYESPrice = polymarket.outcome === "YES" ? polymarket.price : 1 - polymarket.price
  const polyNOPrice = polymarket.outcome === "NO" ? polymarket.price : 1 - polymarket.price
  
  // Get YES and NO prices for Kalshi (from the same market)
  const kalshiYESPrice = kalshi.outcome === "YES" ? kalshi.price : 1 - kalshi.price
  const kalshiNOPrice = kalshi.outcome === "NO" ? kalshi.price : 1 - kalshi.price

  // Buy YES from the cheaper platform, NO from the cheaper platform
  // This is the optimal strategy: always buy from the platform with lower price
  const minYESPrice = Math.min(polyYESPrice, kalshiYESPrice)
  const minNOPrice = Math.min(polyNOPrice, kalshiNOPrice)
  const totalCost = minYESPrice + minNOPrice
  
  // Transaction fees (estimate)
  const fee = config.transactionFee || DEFAULT_CONFIG.transactionFee!
  const totalCostWithFees = totalCost * (1 + fee)
  
  // Guaranteed profit if totalCost < 1.0
  const guaranteedProfit = totalCostWithFees < 1.0 ? 1.0 - totalCostWithFees : 0
  const guaranteedProfitPercent = guaranteedProfit * 100

  // Determine arbitrage type
  const minProfit = config.minProfitPercent || DEFAULT_CONFIG.minProfitPercent!
  const minTrueArbitrage = config.minTrueArbitrageProfit || DEFAULT_CONFIG.minTrueArbitrageProfit!
  
  // True arbitrage: total cost < 1.0 (after fees)
  const isTrueArbitrage = totalCostWithFees < 1.0 && guaranteedProfit >= minTrueArbitrage
  
  // Spread arbitrage: significant price difference between platforms
  const isSpreadArbitrage = Math.abs(profitPercent) >= minProfit
  
  // Overall arbitrage flag
  const arbitrage = isTrueArbitrage || isSpreadArbitrage
  const arbitrageType = isTrueArbitrage ? "true" : isSpreadArbitrage ? "spread" : undefined

  return {
    event: matched.eventTitle,
    outcome: polymarket.outcome,
    polymarketPrice: polymarket.price,
    kalshiPrice: kalshi.price,
    spread,
    profitPercent,
    arbitrage,
    polymarketMarketId: polymarket.marketId,
    kalshiMarketId: kalshi.marketId,
    polymarketSlug: polymarket.slug,
    polymarketConditionId: polymarket.conditionId,
    kalshiSeriesTicker: kalshi.seriesTicker,
    kalshiSeriesTitle: kalshi.seriesTitle,
    kalshiEventTicker: kalshi.eventTicker,
    liquidity: {
      polymarket: polymarket.liquidity,
      kalshi: kalshi.liquidity,
    },
    closesAt: polymarket.closesAt || kalshi.closesAt,
    isResolved: false,
    totalCost: totalCostWithFees,
    guaranteedProfit: guaranteedProfit,
    arbitrageType,
  }
}

/**
 * Calculate arbitrage opportunities for all matched markets
 */
export function calculateAllArbitrages(
  matchedMarkets: MatchedMarket[],
  config: ArbitrageConfig = DEFAULT_CONFIG,
): ArbitrageOpportunity[] {
  return matchedMarkets.map((matched) => calculateArbitrage(matched, config))
}


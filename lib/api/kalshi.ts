/**
 * Kalshi API client
 * Fetches market data from Kalshi REST API
 */

const KALSHI_API_ENDPOINT = "https://api.elections.kalshi.com/v1/search/series"

interface KalshiMarket {
  ticker?: string // Market ticker (e.g., "KXSB-26-SEA")
  event_ticker?: string // Event ticker (e.g., "KXSB-26")
  event_title?: string // Event title (e.g., "Pro Football Champion?")
  series_ticker?: string // Series ticker (e.g., "KXSB")
  series_title?: string // Series title (e.g., "Super Bowl")
  title?: string // Usually empty, use event_title instead
  yes_bid?: number // Price in cents (e.g., 20 = 0.20)
  yes_ask?: number // Price in cents
  yes_bid_dollars?: string // Price in dollars as string
  yes_ask_dollars?: string // Price in dollars as string
  no_bid?: number // Price in cents (can be calculated from yes prices)
  no_ask?: number // Price in cents
  no_bid_dollars?: string // Price in dollars as string
  no_ask_dollars?: string // Price in dollars as string
  last_price?: number // Last price in cents
  last_price_dollars?: string // Last price in dollars
  volume?: number
  open_ts?: string // Open timestamp
  close_ts?: string // Close timestamp
  expected_expiration_ts?: string // Expected expiration timestamp
  status?: string
  category?: string
  [key: string]: any // Allow additional fields from API
}

interface KalshiSeries {
  series_ticker?: string
  series_title?: string
  event_ticker?: string
  event_subtitle?: string
  event_title?: string
  category?: string
  markets?: KalshiMarket[]
  [key: string]: any
}

interface KalshiResponse {
  total_results_count?: number
  current_page?: KalshiSeries[]
  series?: KalshiMarket[]
  markets?: KalshiMarket[]
  data?: KalshiMarket[]
  cursor?: string
  [key: string]: any // Allow additional fields from API
}

/**
 * Fetch markets from Kalshi
 * Uses the search/series endpoint without filters
 */
export async function fetchKalshiMarkets(): Promise<KalshiMarket[]> {
  try {
    // Fetch from Kalshi search/series endpoint without any filters
    const response = await fetch(KALSHI_API_ENDPOINT, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // In production: Add Authorization header if API key is required
        // "Authorization": `Bearer ${process.env.KALSHI_API_KEY}`
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Kalshi API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result: KalshiResponse = await response.json()

    let markets: KalshiMarket[] = []
    
    // Handle the actual Kalshi API response structure
    // Response has current_page array with series objects, each containing markets array
    if (result.current_page && Array.isArray(result.current_page)) {
      console.log(`Found ${result.current_page.length} series in current_page`)
      console.log(`Total results count: ${result.total_results_count || 'unknown'}`)
      
      // Extract markets from all series
      for (const series of result.current_page) {
        if (series.markets && Array.isArray(series.markets)) {
          // Add series metadata to each market for context
          const seriesMarkets = series.markets.map((market: any) => ({
            ...market,
            // Include series info in the market object (don't override existing fields)
            series_ticker: series.series_ticker || market.series_ticker,
            series_title: series.series_title || market.series_title,
            event_ticker: series.event_ticker || market.event_ticker,
            event_title: market.event_title || series.event_title, // Prefer market's event_title, fallback to series
            category: series.category || market.category,
          }))
          markets.push(...seriesMarkets)
        }
      }
    } else if (result.series && Array.isArray(result.series)) {
      markets = result.series
    } else if (result.markets && Array.isArray(result.markets)) {
      markets = result.markets
    } else if (result.data && Array.isArray(result.data)) {
      markets = result.data
    } else if (Array.isArray(result)) {
      // Handle case where API returns array directly
      markets = result as KalshiMarket[]
    } else {
      console.warn("Unexpected Kalshi API response structure:", JSON.stringify(result, null, 2).substring(0, 500))
    }

    console.log(`Fetched ${markets.length} markets from Kalshi search/series endpoint`)
    return markets
  } catch (error) {
    console.error("Error fetching Kalshi data:", error)
    // Don't return mock data - let the error propagate so we can see what's wrong
    throw error
  }
}

/**
 * Mock Kalshi data for development/testing
 * Used when real API is unavailable
 */
function getMockKalshiData(): KalshiMarket[] {
  return [
    {
      event_ticker: "BTC-2026",
      market_ticker: "BTC-2026-120K",
      title: "Will Bitcoin reach $120k in 2026?",
      subtitle: "Bitcoin price prediction",
      yes_bid: 0.58,
      yes_ask: 0.60,
      no_bid: 0.40,
      no_ask: 0.42,
      volume: 150000,
      open_time: "2024-01-01T00:00:00Z",
      close_time: "2026-12-31T23:59:59Z",
      status: "open",
    },
    {
      event_ticker: "INFLATION-2026",
      market_ticker: "INFLATION-2026-JUNE",
      title: "US Inflation above 3% by June 2026?",
      subtitle: "Economic indicators",
      yes_bid: 0.49,
      yes_ask: 0.51,
      no_bid: 0.49,
      no_ask: 0.51,
      volume: 120000,
      open_time: "2024-01-01T00:00:00Z",
      close_time: "2026-06-30T23:59:59Z",
      status: "open",
    },
    {
      event_ticker: "AI-BAR-2026",
      market_ticker: "AI-BAR-2026-PASS",
      title: "AI model passes full Bar Exam in 2026?",
      subtitle: "Technology milestones",
      yes_bid: 0.62,
      yes_ask: 0.64,
      no_bid: 0.36,
      no_ask: 0.38,
      volume: 180000,
      open_time: "2024-01-01T00:00:00Z",
      close_time: "2026-12-31T23:59:59Z",
      status: "open",
    },
    {
      event_ticker: "FED-RATE-2026",
      market_ticker: "FED-RATE-2026-Q2",
      title: "Federal Reserve rate cut by Q2 2026?",
      subtitle: "Monetary policy",
      yes_bid: 0.48,
      yes_ask: 0.50,
      no_bid: 0.50,
      no_ask: 0.52,
      volume: 250000,
      open_time: "2024-01-01T00:00:00Z",
      close_time: "2026-06-30T23:59:59Z",
      status: "open",
    },
    {
      event_ticker: "TSLA-2026",
      market_ticker: "TSLA-2026-400",
      title: "Tesla stock above $400 by year end?",
      subtitle: "Stock predictions",
      yes_bid: 0.55,
      yes_ask: 0.57,
      no_bid: 0.43,
      no_ask: 0.45,
      volume: 200000,
      open_time: "2024-01-01T00:00:00Z",
      close_time: "2026-12-31T23:59:59Z",
      status: "open",
    },
  ]
}

export type { KalshiMarket }


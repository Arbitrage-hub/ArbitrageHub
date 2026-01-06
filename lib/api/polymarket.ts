/**
 * Polymarket API client
 * Fetches markets directly from gamma-api.polymarket.com/markets
 */

const POLYMARKET_API_BASE = "https://gamma-api.polymarket.com"
const LIMIT = 200
const FETCH_TIMEOUT = 30_000
const MAX_PAGES = 10

export interface PolymarketMarket {
  id: string
  question: string
  slug?: string
  conditionId?: string
  outcomes?: any
  outcomePrices?: any
  endDate?: string
  endDateISO?: string
  endDateIso?: string
  liquidity?: number | string
  liquidityNum?: number
  volume?: number | string
  volumeNum?: number
  active?: boolean
  closed?: boolean
  resolvedBy?: string | null
  archived?: boolean
  
  // Event metadata (if available)
  eventId?: string
  eventTitle?: string
  eventSlug?: string
  
  [key: string]: any
}

/**
 * Normalize Polymarket outcome to YES/NO
 */
export function normalizeOutcome(outcome: string): "YES" | "NO" | null {
  const upper = outcome.toUpperCase()
  if (upper.includes("YES") || upper === "TRUE" || upper === "1") {
    return "YES"
  }
  if (upper.includes("NO") || upper === "FALSE" || upper === "0") {
    return "NO"
  }
  return null
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

/**
 * Fetch one page of markets
 */
async function fetchMarketsPage(offset: number): Promise<{
  markets: PolymarketMarket[]
  hasMore: boolean
}> {
  const url =
    `${POLYMARKET_API_BASE}/markets` +
    `?limit=${LIMIT}` +
    `&offset=${offset}` +
    `&order=volume24hr` +
    `&ascending=false`

  const res = await fetchWithTimeout(url)

  if (!res.ok) {
    throw new Error(`Polymarket API error ${res.status}`)
  }

  const json = await res.json()

  // API returns array of markets directly
  if (!Array.isArray(json)) {
    return { markets: [], hasMore: false }
  }

  // Transform API markets to our format
  const markets: PolymarketMarket[] = json
    .filter((market: any) => market?.id) // Only markets with ID
    .map((market: any) => ({
      ...market,
      id: String(market.id),
      question: market.question || "",
      // Preserve endDate in all formats
      endDate: market.endDate,
      endDateISO: market.endDateISO || market.endDateIso,
      endDateIso: market.endDateIso || market.endDateISO,
      // Extract event info if available
      eventId: market.events?.[0]?.id,
      eventTitle: market.events?.[0]?.title,
      eventSlug: market.events?.[0]?.slug,
    }))

  // Check if there are more pages (if we got full limit, assume there might be more)
  const hasMore = markets.length === LIMIT

  return {
    markets,
    hasMore,
  }
}

/**
 * Fetch ALL markets (NO FILTERING)
 */
export async function fetchAllPolymarketMarkets(): Promise<PolymarketMarket[]> {
  const allMarkets: PolymarketMarket[] = []

  let offset = 0
  let page = 0

  while (page < MAX_PAGES) {
    const { markets, hasMore } = await fetchMarketsPage(offset)

    if (markets.length === 0) break

    allMarkets.push(...markets)

    if (!hasMore) break

    offset += LIMIT
    page++

    // light rate-limit protection
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log(
    `📥 Polymarket: fetched ${allMarkets.length} markets from ${page + 1} pages`
  )

  return allMarkets
}

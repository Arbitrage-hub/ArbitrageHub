"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, TrendingUp, Activity, AlertCircle, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

// API response types
interface ApiArbitrageOpportunity {
  event: string
  outcome: "YES" | "NO"
  polymarketPrice: number
  kalshiPrice: number
  spread: number
  profitPercent: number
  arbitrage: boolean
  polymarketMarketId: string
  kalshiMarketId: string
  polymarketSlug?: string
  polymarketConditionId?: string
  kalshiSeriesTicker?: string
  kalshiSeriesTitle?: string
  kalshiEventTicker?: string
  liquidity?: {
    polymarket?: number
    kalshi?: number
  }
  closesAt?: string
}

// Frontend display type
interface ArbitrageOpportunity {
  id: string
  eventName: string
  outcome: "Yes" | "No"
  polymarketPrice: number
  kalshiPrice: number
  spread: number
  estimatedProfit: number
  status: "Open" | "Resolved" | "Suspended"
  category: string
  liquidity: number
  polymarketMarketId: string
  kalshiMarketId: string
  polymarketSlug?: string
  polymarketConditionId?: string
  kalshiSeriesTicker?: string
  kalshiSeriesTitle?: string
  kalshiEventTicker?: string
}

export function ArbitrageTerminal() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Simple category extraction from event title
  const extractCategory = useCallback((eventTitle: string): string => {
    const title = eventTitle.toLowerCase()
    if (title.includes("bitcoin") || title.includes("crypto") || title.includes("btc") || title.includes("ethereum")) {
      return "Crypto"
    }
    if (title.includes("inflation") || title.includes("fed") || title.includes("rate") || title.includes("economic")) {
      return "Economics"
    }
    if (title.includes("ai") || title.includes("tech") || title.includes("model") || title.includes("software")) {
      return "Technology"
    }
    if (title.includes("stock") || title.includes("tesla") || title.includes("apple") || title.includes("market")) {
      return "Finance"
    }
    return "Other"
  }, [])

  // Fetch arbitrage opportunities from API
  const fetchArbitrageData = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setError(null)
      setIsLoading(true)
      const urlParams = new URLSearchParams()
      if (forceRefresh) {
        urlParams.set("_t", Date.now().toString()) // Cache busting
      }
      const url = `/api/arbitrage${urlParams.toString() ? `?${urlParams.toString()}` : ""}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Log raw markets data from arbitrage endpoint
      console.log("\n=== RAW MARKETS DATA FROM ARBITRAGE API ===")
      console.log("Polymarket Markets:", data.raw?.polymarket || [])
      console.log("Kalshi Markets:", data.raw?.kalshi || [])
      console.log("Raw Counts:", data.rawCounts)
      console.log("Total Polymarket:", data.rawCounts?.polymarket || 0)
      console.log("Total Kalshi:", data.rawCounts?.kalshi || 0)
      console.log("=== END RAW MARKETS DATA ===\n")
      
      const apiOpportunities: ApiArbitrageOpportunity[] = data.opportunities || []

      // Transform API data to frontend format
      const transformed: ArbitrageOpportunity[] = apiOpportunities.map((opp, index) => {
        // Extract category from event title (simple heuristic)
        const category = extractCategory(opp.event)

        // Calculate total liquidity
        const totalLiquidity =
          (opp.liquidity?.polymarket || 0) + (opp.liquidity?.kalshi || 0) || 100000

        return {
          id: `${opp.polymarketMarketId}-${opp.kalshiMarketId}-${index}`,
          eventName: opp.event,
          outcome: opp.outcome === "YES" ? "Yes" : "No",
          polymarketPrice: opp.polymarketPrice,
          kalshiPrice: opp.kalshiPrice,
          spread: opp.profitPercent, // profitPercent is already in percentage
          estimatedProfit: opp.profitPercent * 0.75, // After fees estimation
          status: "Open", // All resolved markets are filtered out in API, so all are Open
          category,
          liquidity: totalLiquidity,
          polymarketMarketId: opp.polymarketMarketId,
          kalshiMarketId: opp.kalshiMarketId,
          polymarketSlug: opp.polymarketSlug,
          polymarketConditionId: opp.polymarketConditionId,
          kalshiSeriesTicker: opp.kalshiSeriesTicker,
          kalshiSeriesTitle: opp.kalshiSeriesTitle,
          kalshiEventTicker: opp.kalshiEventTicker,
        }
      })

      setOpportunities(transformed)
    } catch (err) {
      console.error("Error fetching arbitrage data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch arbitrage opportunities")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [extractCategory])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setIsLoading(true)
    fetchArbitrageData(true) // Force refresh bypasses cache
  }

  // Fetch and log raw markets data
  useEffect(() => {
    const fetchMarketsData = async () => {
      try {
        const response = await fetch("/api/markets?_t=" + Date.now()) // Always fetch fresh for console logging
        if (!response.ok) {
          throw new Error(`Failed to fetch markets: ${response.statusText}`)
        }
        const data = await response.json()
        
        console.log("ALL POLYMARKET MARKETS:", data.raw?.polymarket || [])
      } catch (err) {
        console.error("Error fetching markets data:", err)
      }
    }
    
    fetchMarketsData()
  }, [])

  // Initial load
  useEffect(() => {
    setIsLoading(true)
    fetchArbitrageData(false)
  }, [fetchArbitrageData])

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && !isLoading) {
      const interval = setInterval(() => {
        fetchArbitrageData(false) // Auto-refresh uses cache
      }, 15000) // Refresh every 15 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh, isLoading, fetchArbitrageData])

  const profitableOpps = opportunities.filter((o) => o.estimatedProfit > 0).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ArbitrageHub</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/terminal" className="text-sm font-medium text-foreground">
              Terminal
            </Link>
            <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Docs
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto px-6 py-6">
        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive bg-destructive/10 p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mb-6 text-center">
            <p className="text-muted-foreground">Loading arbitrage opportunities...</p>
          </div>
        )}

        {/* Stats Bar */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Opportunities</p>
                <p className="text-2xl font-bold text-foreground">{opportunities.length}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profitable Arbitrages</p>
                <p className="text-2xl font-bold text-success">{profitableOpps}</p>
              </div>
              <div className="rounded-lg bg-success/10 p-3">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Spread</p>
                <p className="text-2xl font-bold text-foreground">
                  {(
                    opportunities.reduce((sum, o) => sum + Math.abs(o.spread), 0) /
                    (opportunities.length || 1)
                  ).toFixed(1)}
                  %
                </p>
              </div>
              <div className="rounded-lg bg-warning/10 p-3">
                <RefreshCw className="h-6 w-6 text-warning" />
              </div>
            </div>
          </Card>
        </div>

        {/* Opportunities Table */}
        <Card className="border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Outcome</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Polymarket</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Kalshi</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Spread</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Est. Profit</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Signal</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Links</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => {
                  const isProfit = opp.estimatedProfit > 0
                  return (
                    <tr
                      key={opp.id}
                      className={cn(
                        "border-b border-border/50 transition-colors hover:bg-accent/50",
                        isProfit && "bg-success/5",
                        !isProfit && opp.estimatedProfit < 0 && "bg-destructive/5",
                      )}
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{opp.eventName}</p>
                          <p className="text-xs text-muted-foreground">
                            {opp.category} • ${(opp.liquidity / 1000).toFixed(0)}k liquidity
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={opp.outcome === "Yes" ? "default" : "secondary"}>{opp.outcome}</Badge>
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-sm text-foreground">
                        ${opp.polymarketPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-sm text-foreground">
                        ${opp.kalshiPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span
                          className={cn(
                            "font-mono text-sm font-semibold",
                            isProfit && "text-success",
                            !isProfit && "text-destructive",
                          )}
                        >
                          {opp.spread > 0 ? "+" : ""}
                          {opp.spread.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span
                          className={cn(
                            "font-mono text-sm font-semibold",
                            isProfit && "text-success",
                            !isProfit && "text-destructive",
                          )}
                        >
                          {opp.estimatedProfit > 0 ? "+" : ""}
                          {opp.estimatedProfit.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {isProfit ? (
                          <Badge className="bg-success text-success-foreground">ARBITRAGE</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            NO SIGNAL
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge
                          variant={
                            opp.status === "Open" ? "default" : opp.status === "Resolved" ? "secondary" : "outline"
                          }
                        >
                          {opp.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 justify-center">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                          >
                            <a
                              href={
                                opp.polymarketSlug
                                  ? `https://polymarket.com/event/${opp.polymarketSlug}`
                                  : opp.polymarketConditionId
                                  ? `https://polymarket.com/condition/${opp.polymarketConditionId}`
                                  : `https://polymarket.com/market/${opp.polymarketMarketId}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Poly
                            </a>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                          >
                            <a
                              href={
                                opp.kalshiSeriesTicker && opp.kalshiSeriesTitle && opp.kalshiEventTicker
                                  ? (() => {
                                      // Create slug from series title: lowercase, spaces to hyphens, remove special chars
                                      const seriesSlug = opp.kalshiSeriesTitle
                                        .toLowerCase()
                                        .trim()
                                        .replace(/[^\w\s-]/g, '') // Remove special chars except hyphens
                                        .replace(/\s+/g, '-') // Replace spaces with hyphens
                                        .replace(/-+/g, '-') // Replace multiple hyphens with single
                                        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
                                      return `https://kalshi.com/markets/${opp.kalshiSeriesTicker.toLowerCase()}/${seriesSlug}/${opp.kalshiEventTicker.toLowerCase()}`
                                    })()
                                  : `https://kalshi.com/trade/${opp.kalshiMarketId}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Kalshi
                            </a>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {opportunities.length === 0 && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">No opportunities available</p>
          </div>
        )}
      </div>
    </div>
  )
}

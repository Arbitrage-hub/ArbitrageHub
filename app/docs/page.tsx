import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TrendingUp, ArrowLeft, BookOpen, Code, Database, Zap, Twitter, Github } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <TrendingUp className="h-6 w-6 text-black" />
            </div>
            <span className="text-xl font-bold text-foreground">ArbitrageHub</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/terminal" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Terminal
            </Link>
            <Link href="/docs" className="text-sm font-medium text-foreground">
              Docs
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Documentation</h1>
          <p className="text-xl leading-relaxed text-muted-foreground">
            Learn how to use ArbitrageHub to find and execute profitable trades across prediction markets.
          </p>
        </div>

        {/* Quick Start */}
        <section className="mb-12">
          <Card className="border-border bg-card p-8">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white">
              <Zap className="h-6 w-6 text-black" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">Quick Start</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Get started with ArbitrageHub in three simple steps:
            </p>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
                  1
                </span>
                <span className="leading-relaxed">
                  Navigate to the{" "}
                  <Link href="/terminal" className="text-foreground hover:underline">
                    Terminal
                  </Link>{" "}
                  page to view real-time arbitrage opportunities
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
                  2
                </span>
                <span className="leading-relaxed">
                  Use the filters to narrow down opportunities by spread percentage, category, and liquidity
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
                  3
                </span>
                <span className="leading-relaxed">
                  When you find a profitable opportunity, execute trades manually on both Polymarket and Kalshi
                </span>
              </li>
            </ol>
          </Card>
        </section>

        {/* Understanding Arbitrage */}
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold text-foreground">Understanding Arbitrage</h2>
          <Card className="border-border bg-card p-8">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white">
              <BookOpen className="h-6 w-6 text-black" />
            </div>
            <h3 className="mb-4 text-xl font-semibold text-foreground">What is Prediction Market Arbitrage?</h3>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Arbitrage in prediction markets occurs when the same outcome is priced differently on different platforms.
              By buying low on one platform and selling high on another, traders can lock in a risk-free profit.
            </p>
            <h4 className="mb-2 font-semibold text-foreground">Example:</h4>
            <div className="rounded-lg bg-background p-4 font-mono text-sm">
              <p className="text-muted-foreground">Event: "Will Bitcoin reach $120k in 2026?"</p>
              <p className="text-foreground">Polymarket YES price: $0.65</p>
              <p className="text-foreground">Kalshi YES price: $0.58</p>
              <p className="mt-2 text-foreground">
                Spread: <span className="font-bold text-foreground">+12.1%</span>
              </p>
              <p className="text-muted-foreground">Strategy: Buy on Kalshi at $0.58, sell on Polymarket at $0.65</p>
            </div>
          </Card>
        </section>

        {/* Terminal Features */}
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold text-foreground">Terminal Features</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border bg-card p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <Database className="h-5 w-5 text-black" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Real-Time Data</h3>
              <p className="leading-relaxed text-muted-foreground">
                The terminal auto-refreshes every 10 seconds to show the latest prices from both Polymarket and Kalshi.
                You can toggle auto-refresh or manually refresh the data.
              </p>
            </Card>

            <Card className="border-border bg-card p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <TrendingUp className="h-5 w-5 text-black" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Profit Calculation</h3>
              <p className="leading-relaxed text-muted-foreground">
                Each opportunity shows the spread percentage and estimated profit after accounting for typical platform
                fees (~25% of spread).
              </p>
            </Card>

            <Card className="border-border bg-card p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <Code className="h-5 w-5 text-black" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Smart Filters</h3>
              <p className="leading-relaxed text-muted-foreground">
                Filter opportunities by minimum spread percentage, market category (Crypto, Economics, Technology,
                etc.), and minimum liquidity.
              </p>
            </Card>

            <Card className="border-border bg-card p-6">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <BookOpen className="h-5 w-5 text-black" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Visual Indicators</h3>
              <p className="leading-relaxed text-muted-foreground">
                Profitable opportunities are highlighted in green with an "ARBITRAGE" badge, while negative spreads
                appear in red for easy identification.
              </p>
            </Card>
          </div>
        </section>

        {/* Understanding Metrics */}
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold text-foreground">Understanding the Metrics</h2>
          <Card className="border-border bg-card p-8">
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold text-foreground">Spread Percentage</h3>
                <p className="leading-relaxed text-muted-foreground">
                  The percentage difference between the two platform prices. Positive spreads indicate potential
                  arbitrage opportunities. Formula:{" "}
                  <code className="rounded bg-background px-2 py-1 font-mono text-sm">
                    (Polymarket - Kalshi) / Kalshi × 100
                  </code>
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground">Estimated Profit</h3>
                <p className="leading-relaxed text-muted-foreground">
                  The expected profit after platform fees, calculated as approximately 75% of the spread. This accounts
                  for typical trading fees on both platforms.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground">Liquidity</h3>
                <p className="leading-relaxed text-muted-foreground">
                  The total amount of capital available in the market. Higher liquidity means you can execute larger
                  trades without significantly affecting the price.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-foreground">Signal</h3>
                <p className="leading-relaxed text-muted-foreground">
                  "ARBITRAGE" indicates a profitable opportunity (positive estimated profit), while "NO SIGNAL" means
                  the spread is not currently profitable.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Risk Disclaimer */}
        <section className="mb-12">
          <Card className="border-border bg-card p-8">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Risk Disclaimer</h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              While arbitrage opportunities can be profitable, they come with risks:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2">
                <span>•</span>
                <span className="leading-relaxed">
                  <strong className="text-foreground">Execution Risk:</strong> Prices may change between viewing the
                  opportunity and executing trades
                </span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span className="leading-relaxed">
                  <strong className="text-foreground">Liquidity Risk:</strong> Insufficient liquidity may prevent you
                  from executing at displayed prices
                </span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span className="leading-relaxed">
                  <strong className="text-foreground">Platform Risk:</strong> Technical issues or delays on either
                  platform can affect execution
                </span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span className="leading-relaxed">
                  <strong className="text-foreground">Fee Variations:</strong> Actual fees may vary from estimates based
                  on account tier and trade size
                </span>
              </li>
            </ul>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Always conduct your own research and trade responsibly. This tool is for informational purposes only.
            </p>
          </Card>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-6 text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card className="border-border bg-card p-6">
              <h3 className="mb-2 font-semibold text-foreground">How often does the data update?</h3>
              <p className="leading-relaxed text-muted-foreground">
                With auto-refresh enabled, data updates every 10 seconds. You can also manually refresh at any time.
              </p>
            </Card>
            <Card className="border-border bg-card p-6">
              <h3 className="mb-2 font-semibold text-foreground">Does ArbitrageHub execute trades automatically?</h3>
              <p className="leading-relaxed text-muted-foreground">
                No, ArbitrageHub is a monitoring and analysis tool. You must manually execute trades on Polymarket and
                Kalshi platforms.
              </p>
            </Card>
            <Card className="border-border bg-card p-6">
              <h3 className="mb-2 font-semibold text-foreground">What is a good spread percentage to target?</h3>
              <p className="leading-relaxed text-muted-foreground">
                Generally, spreads above 5% are worth considering, but this depends on your risk tolerance, trading
                costs, and market conditions. The estimated profit already accounts for typical fees.
              </p>
            </Card>
            <Card className="border-border bg-card p-6">
              <h3 className="mb-2 font-semibold text-foreground">Are all markets available?</h3>
              <p className="leading-relaxed text-muted-foreground">
                Currently, the terminal shows a curated selection of markets with sufficient liquidity across both
                platforms. More markets are added regularly.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="border-border bg-card p-8">
            <h2 className="mb-4 text-2xl font-bold text-foreground">Ready to Find Opportunities?</h2>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              Head to the terminal and start exploring real-time arbitrage opportunities.
            </p>
            <Button asChild size="lg">
              <Link href="/terminal">Launch Terminal</Link>
            </Button>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                <TrendingUp className="h-4 w-4 text-black" />
              </div>
              <span className="font-semibold text-foreground">ArbitrageHub</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/Arbitrage_hub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="X (Twitter)"
              >
                <img
                  src="https://x.com/favicon.ico"
                  alt="X"
                  className="h-5 w-5"
                />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://pump.fun/coin/A4WvVauC1RPigNR25asTNVWtDAcm873iVYdie2wTpump"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Pumpfana"
              >
                <img
                  src="https://pump.fun/favicon.ico"
                  alt="Pumpfana"
                  className="h-5 w-5"
                />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

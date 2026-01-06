"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TrendingUp, BarChart3, Zap, Shield, ArrowRight, Twitter, Github, Activity, Target, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const features = [
  {
    icon: Activity,
    title: "Real-Time Data",
    description: "Live price feeds from Polymarket and Kalshi with automatic spread calculation and profit estimation.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track liquidity, spreads, and profitability metrics across multiple markets and categories.",
  },
  {
    icon: Zap,
    title: "Instant Alerts",
    description: "Get notified immediately when profitable arbitrage opportunities meet your criteria.",
  },
  {
    icon: Shield,
    title: "Smart Filtering",
    description: "Filter by spread percentage, category, liquidity, and more to find the best opportunities.",
  },
  {
    icon: Target,
    title: "Professional Interface",
    description: "Clean, dark-themed terminal designed for serious traders with all essential data at your fingertips.",
  },
  {
    icon: BarChart3,
    title: "Auto-Refresh",
    description: "Automatic data refresh keeps you updated without manual intervention. Never miss an opportunity.",
  },
]

function FeaturesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(features.length / 3))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(features.length / 3)) % Math.ceil(features.length / 3))
  }

  const totalPages = Math.ceil(features.length / 3)
  const canGoNext = currentIndex < totalPages - 1
  const canGoPrev = currentIndex > 0

  return (
    <div className="relative max-w-6xl mx-auto">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out gap-6"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div key={pageIndex} className="flex-shrink-0 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.slice(pageIndex * 3, pageIndex * 3 + 3).map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={pageIndex * 3 + index}
                    className="p-8 border-border/50 hover:border-border transition-all hover:shadow-lg group"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-6 w-16 h-16 rounded-lg bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <Icon className="h-8 w-8 text-black" />
                      </div>
                      <h3 className="mb-3 text-2xl font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </Card>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-4 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          disabled={!canGoPrev}
          className="border-border"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === index
                  ? "w-8 bg-foreground"
                  : "w-2 bg-border"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          disabled={!canGoNext}
          className="border-border"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              ArbitrageHub
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-foreground transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/terminal" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Terminal
            </Link>
            <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Real-time arbitrage detection
          </div>
          
          <h1 className="mb-6 text-balance text-6xl font-bold tracking-tight text-foreground leading-tight">
            Discover Profitable
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Opportunities
            </span>
            Across Prediction Markets
          </h1>
          
          <p className="mb-10 text-pretty text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            Find and track arbitrage opportunities between Polymarket and Kalshi in real-time. 
            Make data-driven decisions with our professional trading terminal.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button asChild size="lg" className="shadow-lg shadow-primary/20">
              <Link href="/terminal">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2">
              <Link href="/docs">View Documentation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-20">
          <h2 className="mb-4 text-4xl font-bold text-foreground">Why Choose ArbitrageHub?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed for serious traders
          </p>
        </div>
        
        <FeaturesCarousel />
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-20">
          <h2 className="mb-4 text-4xl font-bold text-foreground">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to start finding arbitrage opportunities
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute left-8 top-8 bottom-8 w-0.5 bg-border opacity-30" />
            
            <div className="space-y-12">
              <div className="flex items-start gap-8 group">
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-black shadow-lg group-hover:scale-110 transition-transform">
                    1
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="mb-3 text-3xl font-semibold text-foreground">Connect Markets</h3>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    We continuously monitor prices across Polymarket and Kalshi prediction markets.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-8 group">
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-black shadow-lg group-hover:scale-110 transition-transform">
                    2
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="mb-3 text-3xl font-semibold text-foreground">Detect Spreads</h3>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Our algorithm calculates price differences and identifies profitable arbitrage opportunities.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-8 group">
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-black shadow-lg group-hover:scale-110 transition-transform">
                    3
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="mb-3 text-3xl font-semibold text-foreground">Execute Trades</h3>
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    Review the data, analyze the opportunity, and execute trades on both platforms to lock in profits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-16 shadow-2xl shadow-primary/10 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground">Ready to Start Trading?</h2>
            <p className="mb-10 text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              Access the terminal now and discover your first arbitrage opportunity.
            </p>
            <Button asChild size="lg" className="shadow-lg shadow-primary/30">
              <Link href="/terminal">
                Launch Terminal <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">ArbitrageHub</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a
                href="https://x.com/Arbitrage_hub"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 transform"
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
                className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 transform"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://pump.fun/coin/A4WvVauC1RPigNR25asTNVWtDAcm873iVYdie2wTpump"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 transform"
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
          
          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">© 2026 ArbitrageHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

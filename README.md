# ⚡ ArbitrageHub

<div align="center">

<img src="https://raw.githubusercontent.com/Arbitrage-hub/ArbitrageHub/main/public/logo%20(5).png" width="180" alt="ArbitrageHub Logo" />

### **Professional Arbitrage Engine for Prediction Markets**

Real-time detection of **risk-free arbitrage opportunities** between  
**Polymarket** & **Kalshi**

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

**🔍 Track spreads • 📊 Analyze liquidity • ⚡ Act instantly**

[📖 Docs](#-documentation) • [⭐ Star Repo](https://github.com/Arbitrage-hub/ArbitrageHub)

</div>

---

## 📌 What is ArbitrageHub?

**ArbitrageHub** is a high-performance trading intelligence platform that scans multiple prediction markets in real time and identifies **guaranteed-profit arbitrage opportunities**.

It continuously compares identical outcomes across platforms, calculates spreads, evaluates liquidity, and highlights only **actionable, high-quality trades**.

> Built for traders who value **speed, precision, and clarity**.

---

## 🧠 Why Prediction Market Arbitrage?

Prediction markets often price the **same event differently**.  
When one market undervalues an outcome and another overvalues it, a **risk-free profit window** appears.

**ArbitrageHub does the hard part:**
- finds matching events  
- verifies similarity  
- calculates profit  
- filters noise  

So you can focus on execution.

---

## ✨ Core Features

| Feature | Description |
|------|------------|
| 🔄 **Real-Time Monitoring** | Live prices from Polymarket & Kalshi |
| 📈 **Spread Detection** | Instant profit & ROI calculation |
| 🎯 **Smart Filters** | Profit %, liquidity, category |
| ⚡ **Fast Refresh** | Auto-update every 10 seconds |
| 🤖 **AI Matching (Optional)** | LLM-assisted market correlation |
| 🖥️ **Professional Terminal** | Dark, trader-first UI |
| 🔔 **Alerts Ready** | Designed for instant notifications |

---

## 🚀 Quick Start

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Arbitrage-hub/ArbitrageHub.git
cd arbitragehub
```

### 2️⃣ Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3️⃣ Environment Variables (Optional)

Create a `.env.local` file in the root directory:

```env
# Optional: OpenRouter API key for AI-powered market matching
OPENROUTER_API_KEY=your_api_key_here
```

### 4️⃣ Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5️⃣ Build for Production

```bash
npm run build
npm start
```

---

## 🏗️ Architecture Overview

```
Polymarket API ──┐
                 ├──> Normalizer ──> Market Matcher ──> Arbitrage Engine ──> Filters ──> Trading Terminal
Kalshi API ──────┘
```

---

## 📁 Project Structure

```
arbitragehub/
├── app/
│   ├── api/
│   │   ├── arbitrage/          # Arbitrage opportunities API endpoint
│   │   └── markets/             # Raw markets data API endpoint
│   ├── terminal/                # Trading terminal page
│   ├── docs/                    # Documentation page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
├── components/
│   ├── arbitrage-terminal.tsx   # Main terminal component
│   ├── theme-provider.tsx       # Theme management
│   └── ui/                      # Reusable UI components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── select.tsx
├── lib/
│   ├── api/
│   │   ├── polymarket.ts        # Polymarket API client
│   │   ├── kalshi.ts            # Kalshi API client
│   │   └── openrouter.ts        # AI matching service
│   ├── matching.ts              # Market matching algorithms
│   ├── arbitrage.ts             # Arbitrage calculation logic
│   ├── normalize.ts             # Market data normalization
│   ├── cache.ts                 # Caching utilities
│   └── utils.ts                 # Utility functions
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── next.config.mjs
└── MATCHING_FLOW.md             # Technical documentation
```

---

## 🔌 API Endpoints

### Get All Arbitrage Opportunities

```http
GET /api/arbitrage?minProfitPercent=5.0
```

**Query Parameters:**
- `minProfitPercent`: Minimum profit percentage (default: 5.0)

**Response Example:**
```json
{
  "opportunities": [
    {
      "event": "Will Bitcoin reach $120k in 2026?",
      "outcome": "YES",
      "polymarketPrice": 0.65,
      "kalshiPrice": 0.58,
      "spread": 0.07,
      "profitPercent": 12.1,
      "arbitrage": true,
      "polymarketMarketId": "0x123...",
      "kalshiMarketId": "MARKET-123"
    }
  ],
  "count": 15,
  "arbitrageCount": 8,
  "timestamp": "2026-01-05T12:01:22.000Z"
}
```

### Get Market Data

```http
GET /api/markets
```

Returns raw market data from both platforms.

---

## 🔧 Configuration

### Refresh Interval

Control how often the system checks for new opportunities in `components/arbitrage-terminal.tsx`:

```typescript
const REFRESH_INTERVAL = 10 * 1000; // 10 seconds
```

### Profit Calculation

Adjust profit calculation parameters in `lib/arbitrage.ts`:

```typescript
export interface ArbitrageConfig {
  minProfitPercent?: number; // Default: 5.0
}
```

---

## 🎯 Filtering System

ArbitrageHub uses a multi-layer filtering system:

1. **Profit Filter**: Minimum profit percentage threshold
2. **Liquidity Filter**: Minimum liquidity requirement
3. **Market Matching**: Similarity-based matching with optional AI verification
4. **Resolved Markets**: Automatically filters out resolved markets

---

## 🤖 AI-Assisted Matching (Optional)

Enable AI-powered market matching by setting your OpenRouter API key:

1. Sign up at [OpenRouter](https://openrouter.ai)
2. Get your API key
3. Add to `.env.local`:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-...
   ```

The system will use LLMs to:
- Match similar events across platforms
- Validate event similarity with high confidence
- Improve matching accuracy

---

## 🛡️ Risk Disclaimer

⚠️ **IMPORTANT**: This tool is for informational purposes only and does NOT execute trades automatically.

**Potential risks include:**

- Price slippage between detection and execution
- Insufficient liquidity for large orders
- Platform API delays or downtime
- Changes in trading fees
- Market resolution differences
- Technical errors in matching logic

**Always verify:**
1. Market terms match exactly
2. Liquidity is sufficient for your position
3. Fees are accounted for in profit calculation
4. Execution can be completed quickly

---

## 🔗 Contract Address (CA)

```
Mainnet: 0xYOUR_CONTRACT_ADDRESS_HERE
Polygon: 0xYOUR_POLYGON_CONTRACT_ADDRESS_HERE
```

---

## 🚧 Development Roadmap

### Phase 1 (Current)
- [x] Basic market data fetching
- [x] Simple arbitrage detection
- [x] Web interface
- [x] Auto-refresh functionality

### Phase 2 (Q1 2026)
- [ ] Real-time WebSocket connections
- [ ] Advanced filtering UI
- [ ] Portfolio tracking
- [ ] Email/SMS alerts

### Phase 3 (Q2 2026)
- [ ] Multi-exchange support (Manifold, PredictIt)
- [ ] Advanced analytics dashboard
- [ ] Mobile app

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/arbitragehub.git
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Commit your changes**:
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new functionality
- Update documentation as needed
- Use conventional commit messages

---

## 📚 Documentation

- **[Matching Algorithm](./MATCHING_FLOW.md)** - How markets are matched
- **[Terminal Guide](/docs)** - How to use the trading terminal
- **[API Reference](#-api-endpoints)** - Complete API reference

---

## ❓ FAQ

### Q: How real-time is the data?
A: Data refreshes every 10 seconds by default. You can adjust this in the terminal settings.

### Q: What's the minimum profit threshold?
A: Default is 5% after fees, but you can adjust this in the API query parameters.

### Q: Does it work outside the US?
A: Yes, but be aware of local regulations regarding prediction markets.

### Q: Can I add more exchanges?
A: Yes! The architecture is modular. See `lib/api/` for adding new data sources.

### Q: Is there a mobile app?
A: Currently web-only, but the interface is fully responsive.

---

## 🐛 Troubleshooting

### Common Issues:

1. **"No markets found"**
   - Check your internet connection
   - Verify API endpoints are accessible
   - Check browser console for errors

2. **"Failed to fetch" errors**
   - Ensure CORS is properly configured
   - Check if APIs require authentication
   - Verify network connectivity

3. **Slow performance**
   - Reduce refresh interval
   - Enable caching
   - Check browser extensions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌍 Links

- **Website**: [https://arbitragehub.org](https://arbitragehub.org)
- **X (Twitter)**: [@Arbitrage_hub](https://x.com/Arbitrage_hub)
- **GitHub**: [https://github.com/Arbitrage-hub/ArbitrageHub](https://github.com/Arbitrage-hub/ArbitrageHub)
- **CA**: A4nS2cws5vJXq9wQkbfMpo9sK4SdJ3FZXw2n6MQZpump

---

## 🙏 Acknowledgments

- [Polymarket](https://polymarket.com) for their prediction market platform
- [Kalshi](https://kalshi.com) for their event contracts
- [Next.js](https://nextjs.org) for the amazing React framework
- All contributors and users of ArbitrageHub

---

<div align="center">

**Built for serious traders.**  
**Designed for speed.**  
**Powered by data.**

<br/>

[⬆ Back to Top](#-arbitragehub)

</div>

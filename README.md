<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react" alt="React" />
</p>

# 📊 FinBoard

**Your personalized command center for the financial markets.**

A modern, customizable finance dashboard that lets you connect multiple financial APIs and monitor stocks, crypto, and forex — all from one beautiful interface.



---

## 💡 About the Project

FinBoard is a **next-generation financial dashboard** built with **Next.js 16** and **TypeScript** that solves the problem of data fragmentation across platforms. Instead of juggling multiple tabs and apps, FinBoard gives you a unified, drag-and-drop workspace where you can track diverse financial assets in real-time.

The application features a modular widget system — add Cards, Tables, or professional-grade TradingView Charts, connect them to your preferred data provider, and arrange them exactly how you like. FinBoard handles API complexities, CORS proxying, and data normalization behind the scenes, presenting you with a seamless and stunning interface.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🧩 **Customizable Widgets** | Cards, Tables, and Charts — pick the view that suits your data |
| 📈 **TradingView Charts** | Professional candlestick & line charts powered by Lightweight Charts |
| 🔌 **Multi-Provider Support** | Connect to CoinGecko, Alpha Vantage, Finnhub & IndianAPI |
| 🖱️ **Drag & Drop Grid** | Rearrange and resize widgets with an intuitive `@dnd-kit` grid |
| 💾 **Local Persistence** | Dashboard layout & settings auto-saved via Zustand persistence |
| 🔒 **Secure API Proxy** | Server-side routes protect your API keys from client exposure |
| 🔄 **Live Updates** | Configurable auto-refresh intervals for each widget |
| 🌙 **Dark Mode** | Sleek glassmorphism-inspired design with emerald accents |
| 📱 **Responsive** | Optimized for desktop monitoring and mobile quick-checks |
| 🚀 **Quick Templates** | Pre-built widget templates to get started instantly |

---

## 🔌 Supported Data Providers

| Provider | Data Available | Use Case |
|---|---|---|
| **CoinGecko** | Real-time crypto prices, market data, OHLC charts | Cryptocurrency tracking |
| **Alpha Vantage** | Global stock quotes, forex rates, time series | Stock & forex analysis |
| **Finnhub** | Institutional-grade stock data, candles | Professional stock monitoring |
| **IndianAPI** | NSE/BSE stock data | Indian stock market tracking |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (React 19) |
| Styling | Tailwind CSS 4 |
| State Management | Zustand (with persistence) |
| Charting | TradingView Lightweight Charts & Recharts |
| Drag & Drop | @dnd-kit (core + sortable) |
| Unique IDs | uuid |

---

## 🏗 Architecture

FinBoard uses a **Frontend-Heavy Architecture** with a thin API Proxy layer:

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Zustand  │  │  Widget Grid  │  │  Modal Wizards    │  │
│  │  Store    │  │  (@dnd-kit)   │  │  (Add/Configure)  │  │
│  └────┬─────┘  └──────┬───────┘  └───────┬───────────┘  │
│       │               │                  │               │
│       └───────────────┼──────────────────┘               │
│                       ▼                                  │
│              ┌─────────────────┐                         │
│              │  Widget Render  │                         │
│              │  Card│Table│Chart│                        │
│              └────────┬────────┘                         │
└───────────────────────┼──────────────────────────────────┘
                        ▼
┌──────────────────────────────────────────────────────────┐
│              API Layer (Next.js Routes)                   │
│                                                          │
│  /api/proxy  ──  /api/data  ──  /api/search              │
│  (CORS bypass)   (Normalize)    (Symbol lookup)          │
└───────────────────────┼──────────────────────────────────┘
                        ▼
         ┌──────────────────────────────┐
         │     External Providers       │
         │ CoinGecko │ Alpha Vantage    │
         │ Finnhub   │ IndianAPI        │
         └──────────────────────────────┘
```


## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** or **yarn**
- API keys from at least one provider (all are free tier)

### 1. Clone the repository

```bash
git clone https://github.com/Akshay01070/FinBoard.git
cd FinBoard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
# Alpha Vantage (Required for stock data)
# Get your free key at: https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=your_key_here

# Finnhub (Required for real-time quotes)
# Get your free key at: https://finnhub.io/register
FINNHUB_API_KEY=your_key_here

# IndianAPI (Required for NSE/BSE data)
# Get your key at: https://indianapi.in/
INDIANAPI_API_KEY=your_key_here
```

> [!TIP]
> CoinGecko works without an API key for basic requests. The other providers require free API keys.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!NOTE]
> If you encounter a Turbopack font error, use `npx next dev` instead of `npm run dev`.

---

## 🧩 Widget Types

### 📋 Card Widget
Single metric displays for quick stats — **Price**, **Change %**, **Market Cap**, **Volume**, and more. Perfect for a quick-glance dashboard.

### 📊 Table Widget
Compare multiple assets side-by-side with sortable columns. Great for building a personal **watchlist** view.

### 📈 Chart Widget
Professional-grade interactive charts with two rendering engines:
- **TradingView Lightweight Charts** — Candlestick & line charts with crosshair, tooltips, and time-range controls.
- **Recharts** — Area and bar charts for supplementary visualizations.

### 🏆 Market Gainers
Auto-populated lists of top market movers to spot opportunities at a glance.




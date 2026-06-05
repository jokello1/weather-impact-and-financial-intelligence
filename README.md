# Weather Impact & Financial Intelligence Dashboard

A React dashboard that combines live weather forecasts with rule-based financial impact analysis. Search any location, compare cities, and explore how rain, wind, heat, and alerts translate into risk scores and expected losses for farming, business, and travel scenarios.

## Features

- **Location search** — geocode and fetch forecasts from the Weather AI API
- **Weather sidebar** — current conditions, 24h trend, impact summary, and risk gauge
- **Financial intelligence** — expected loss, best/worst case, and activity-specific insights
- **Multi-city comparison** — temperature trends across global cities
- **Responsive layout** — sticky sidebar on desktop, slide-out drawer on mobile
- **Dynamic backdrop** — UI atmosphere adapts to current weather conditions

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query) for data fetching
- [Recharts](https://recharts.org/) for charts
- [Radix UI](https://www.radix-ui.com/) for accessible primitives

## Getting Started

### Prerequisites

- Node.js 18+
- A [Weather AI API](https://api.weather-ai.co) key

### Installation

```bash
npm install
```

### Environment

Copy the example env file and add your API key:

```bash
cp .env.example .env
```

```env
WEATHERAI_API_KEY=wai_your_key_here
```

The API key is kept on the server and proxied through `/api/weather-ai` to avoid CORS issues and exposing the key in the browser.

### Development

```bash
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Build

```bash
npm run build
npm start
```

For local production preview after building:

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── app/dashboard/       # Main dashboard page
├── components/
│   ├── Charts/          # Recharts visualizations
│   ├── layout/          # Sidebar, hero, details, search bar
│   └── ui/              # Shared UI primitives
├── hooks/               # Weather and impact analysis hooks
├── lib/                 # API client, financial engine, utilities
└── types/               # Weather and financial TypeScript types
```

## How It Works

1. **Weather data** — `src/lib/weather-api.ts` fetches forecasts and geocoding results from Weather AI.
2. **Impact analysis** — `src/lib/financial-engine.ts` scores daily weather severity and estimates financial loss by activity type.
3. **Recommendations** — `src/lib/recommendation-engine.ts` produces rule-based actions from forecast signals.
4. **UI** — `DashboardPage` orchestrates location state, activity/sensitivity controls, and chart sections.

## Deploying to Render

Use a **Web Service** (not a static site):

- **Build command:** `npm install && npm run build`
- **Start command:** `npm start`
- **Environment variable:** `WEATHERAI_API_KEY`

The Node server in `server.mjs` serves the built app and proxies weather/geocoding API calls server-side.

## Configuration

| Variable | Description |
|----------|-------------|
| `WEATHERAI_API_KEY` | Server-side bearer token for the Weather AI API (production) |
| `VITE_WEATHERAI_API_KEY` | Optional fallback for the Vite dev proxy during local development |


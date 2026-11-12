# Inventory Demand Forecasting: FSWD Course Project

A full-stack inventory tracker that flags products needing a reorder and forecasts demand with a **Simple Moving Average (SMA)** and **Single Exponential Smoothing (SES)**. It is based on the [Real-Time Inventory Demand Forecasting](https://github.com/Nishchala-Sai/Real-Time-Inventory-Demand-Forecasting-REST-API) React dashboard.

```
cbp/
├── static/   Units I & II: HTML5 + CSS + vanilla JS page (no build step)
├── client/   Unit III: React + Vite single-page app
├── server/   Units IV & V: Express + MongoDB REST API with JWT auth
├── lambda/   Unit V: AWS Lambda forecast handler
└── docs/     Unit V: REST vs SOAP, architecture, deployment
```

## Setup and run

You need **Node.js 22+** and **MongoDB** running locally (or a MongoDB Atlas URI). Valkey is optional.

```bash
# 1. API
cd cbp/server
npm install
cp .env.example .env          # edit MONGO_URI / JWT_SECRET if needed
npm run seed                  # 4 products, 40 sales, user demo@example.com / password123
npm start                     # http://localhost:5000

# 2. React client (in a second terminal)
cd cbp/client
npm install
npm run dev                   # http://localhost:5173, /api is proxied to :5000

# 3. Static page: open cbp/static/index.html in a browser
```

Other scripts:

```bash
cd cbp/server && npm run demo:blocking    # blocking vs non-blocking I/O demo
```

**Valkey (optional):** start Valkey on port 6379 and keep `VALKEY_URL` in `.env`. Forecast responses are then cached for 60 seconds, and cached responses include `"cached": true`. If Valkey is not running, the server prints `Valkey not reachable - forecast caching off` and works normally.

## API endpoints

Every route except `/api/auth/*` needs the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | `{ email, password }`: creates a user and returns `{ token }` |
| POST | `/api/auth/login` | `{ email, password }`: returns `{ token }` |
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Get one product |
| POST | `/api/products` | Create `{ name, sku, stock, reorderLevel }` |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product and its sales |
| GET | `/api/products/:id/forecast?method=sma&window=3` | SMA forecast |
| GET | `/api/products/:id/forecast?method=ses&alpha=0.5` | SES forecast |
| GET | `/api/sales?productId=` | List sales (optional product filter) |
| GET | `/api/sales/:id` | Get one sale |
| POST | `/api/sales` | Create `{ productId, date, quantity }` |
| PUT | `/api/sales/:id` | Update a sale |
| DELETE | `/api/sales/:id` | Delete a sale |

The forecast response contains `history` (date and quantity per day) and a `forecast` array that is one entry longer than the history. The last entry is the prediction for the next day.

```bash
TOKEN=$(curl -s -X POST localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).token")
curl -H "Authorization: Bearer $TOKEN" localhost:5000/api/products
```

## Forecasting math

- **SMA (window k):** the forecast for day *t* is the mean of the previous *k* actual sales.
- **SES (α):** `F(t) = α·actual(t−1) + (1−α)·F(t−1)`. A higher α reacts faster to recent changes, and a lower α gives a smoother line.

Both are implemented in [server/forecast.js](server/forecast.js), which the API and the Lambda handler share.

## Syllabus map

| Unit | Topic | Where |
|---|---|---|
| I | HTML5 semantic elements (header, nav, main, section, footer), link, table | [static/index.html](static/index.html) |
| I | Form with text, number, date, email and select inputs | [static/index.html](static/index.html) |
| I | CSS selectors (element, class, id, attribute, descendant, pseudo-class) | [static/style.css](static/style.css) |
| I | Box model, positioning (sticky header), media query | [static/style.css](static/style.css) |
| II | ES6: let/const, arrow functions, template literals, destructuring, spread | [static/app.js](static/app.js) |
| II | Arrays, objects, string methods (trim, toLowerCase, includes, toUpperCase) | [static/app.js](static/app.js) |
| II | DOM, window object, event handling (submit, input, DOMContentLoaded) | [static/app.js](static/app.js) |
| III | JSX, functional components, props (`mode`) | [client/src/pages/AuthForm.jsx](client/src/pages/AuthForm.jsx) |
| III | State and effects (useState, useEffect) | [client/src/pages/Forecast.jsx](client/src/pages/Forecast.jsx) |
| III | Lists with map and keys, reorder badges | [client/src/pages/Products.jsx](client/src/pages/Products.jsx) |
| III | Controlled form for add and edit | [client/src/pages/ProductForm.jsx](client/src/pages/ProductForm.jsx) |
| III | Class component and lifecycle methods (ErrorBoundary) | [client/src/components/ErrorBoundary.jsx](client/src/components/ErrorBoundary.jsx) |
| III | React Router SPA and protected routes | [client/src/App.jsx](client/src/App.jsx) |
| III | Chart.js chart with SMA, SES and α slider | [client/src/components/ForecastChart.jsx](client/src/components/ForecastChart.jsx) |
| III | CSS file and inline style objects | [client/src/index.css](client/src/index.css), [client/src/pages/Forecast.jsx](client/src/pages/Forecast.jsx) |
| IV | Express server, middleware, error handling | [server/server.js](server/server.js) |
| IV | Mongoose models: User, Product, Sale | [server/models/](server/models/) |
| IV | REST CRUD for products and sales | [server/routes/products.js](server/routes/products.js), [server/routes/sales.js](server/routes/sales.js) |
| IV | `fs` core module: request log file | [server/core/logger.js](server/core/logger.js) |
| IV | `url` core module: parsing query params | [server/routes/products.js](server/routes/products.js) (forecast route) |
| IV | `events` core module: `lowStock` event | [server/core/events.js](server/core/events.js) |
| IV | Blocking vs non-blocking I/O | [server/core/blocking-demo.js](server/core/blocking-demo.js) |
| IV | SMA / SES forecast endpoint | [server/forecast.js](server/forecast.js) |
| IV | Valkey caching (optional) | [server/cache.js](server/cache.js) |
| IV | Seed script | [server/seed.js](server/seed.js) |
| V | JWT auth with bcrypt password hashing | [server/routes/auth.js](server/routes/auth.js), [server/middleware/auth.js](server/middleware/auth.js) |
| V | AWS Lambda handler | [lambda/forecast.js](lambda/forecast.js) |
| V | REST vs SOAP, web services, microservices, deployment | [docs/README.md](docs/README.md) |

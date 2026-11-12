# Web Services, Architecture and Deployment

## REST vs SOAP

| | REST (this project) | SOAP |
|---|---|---|
| Style | Architectural style built on HTTP | Protocol with a strict XML envelope |
| Data format | Usually JSON (anything is allowed) | XML only |
| Operations | HTTP verbs on resources: `GET /api/products/42`, `DELETE /api/products/42` | One endpoint; the operation is named inside the XML body (`<GetProduct>`) |
| Contract | Informal (README, optionally OpenAPI) | Formal WSDL file describes every operation |
| State | Stateless: every request carries its JWT | Can be stateful; WS-Security, WS-AtomicTransaction add features |
| Typical use | Web and mobile APIs | Enterprise and banking systems that need strict contracts |

The same "get product" call in each style:

```http
GET /api/products/42
Authorization: Bearer <token>
```

```xml
POST /InventoryService
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body><GetProduct><Id>42</Id></GetProduct></soap:Body>
</soap:Envelope>
```

## Web services architecture

A web service is software that other programs call over the network using standard formats. This project has three roles:

```
React client (browser) --HTTP + JSON--> Express REST API --Mongoose--> MongoDB
                                             |
                                             +--> Valkey (optional forecast cache)
```

- **Service consumer**: the React app (or curl/Postman) sends HTTP requests.
- **Service provider**: the Express API exposes resources (`/products`, `/sales`) and returns JSON.
- **Contract**: the endpoint list in the main README plays the role a WSDL plays for SOAP.
- **Stateless auth**: the server keeps no session. Each request carries a signed JWT that the middleware verifies.

## Microservices vs this monolith

This project is a **monolith**: auth, products, sales and forecasting all run in one Express process and share one database.

| | Monolith (this project) | Microservices |
|---|---|---|
| Deployment | One app to build and deploy | Each service is deployed separately |
| Scaling | Scale the whole app | Scale only the busy service (for example, forecasting) |
| Data | One shared database | Each service owns its own database |
| Communication | Function calls inside one process | HTTP or a message queue between services |
| Complexity | Simple to develop and debug | Needs service discovery, monitoring and network error handling |

A microservice version would split this project into an **Auth service**, an **Inventory service** (products and sales) and a **Forecast service**, behind an API gateway. The Lambda handler in `lambda/forecast.js` is a first step: the forecast logic already runs on its own, outside the monolith.

## Deployment, step by step

### 1. Database: MongoDB Atlas
1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. Add a database user, and under *Network Access* allow `0.0.0.0/0` (or your server's IP address).
3. Copy the connection string, for example `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/inventory`.
4. Seed it from your machine: put that string in `server/.env` as `MONGO_URI`, then run `npm run seed`.

### 2. API: Render (or EC2)
**Render**
1. Push the repo to GitHub, then create a *New Web Service* on <https://render.com>.
2. Set Root Directory to `cbp/server`, Build Command to `npm install`, and Start Command to `node server.js`.
3. Add the environment variables `MONGO_URI`, `JWT_SECRET` and (optionally) `VALKEY_URL`.
4. Deploy, then note the URL, for example `https://inventory-api.onrender.com`.

**EC2 (alternative)**
1. Launch an Ubuntu instance and open port 5000 (or 80 behind Nginx) in its security group.
2. Install Node 22+, then `git clone` the repo, `cd cbp/server` and `npm install`.
3. Create `.env`, then run the app with a process manager: `npx pm2 start server.js --node-args="--env-file=.env"`.

### 3. Frontend: Vercel (or S3 / Amplify)
**Vercel**
1. Import the repo on <https://vercel.com> and set Root Directory to `cbp/client` (Vite is detected automatically).
2. Add the environment variable `VITE_API_URL=https://inventory-api.onrender.com`.
3. Add `cbp/client/vercel.json` so that React Router paths load `index.html`:
   `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`

**S3 / Amplify**
1. Build locally with `VITE_API_URL=https://... npm run build`, which produces `cbp/client/dist/`.
2. *S3*: create a bucket, enable *Static website hosting* with index and error document `index.html`, then upload `dist/`.
3. *Amplify*: connect the repo, set the app root to `cbp/client` and the output directory to `dist`, and add a rewrite of `/<*>` to `/index.html` (200).

### 4. Forecast function: AWS Lambda
1. From `cbp/`, zip the handler together with the shared math:
   `zip lambda.zip lambda/forecast.js server/forecast.js`
2. In the Lambda console, create a function (Node.js 22 runtime), upload `lambda.zip`, and set Handler to `lambda/forecast.handler`.
3. Test it with the event `{ "sales": [12, 18, 15, 22, 20], "method": "ses", "alpha": 0.5 }`.
4. Optionally, add an API Gateway HTTP trigger and `POST` the same JSON as the request body.

# Pastebin Lite

?? **[Live Demo](https://paste-share-app.vercel.app)** | ?? **[GitHub](https://github.com/PratikshaaChavan/paste-share-app)**

---

A simple pastebin application that allows users to create text pastes with optional expiry times and view limits.

## Features

- Create text pastes with shareable URLs
- Optional time-based expiry (TTL)
- Optional view count limits
- Automated paste deletion when constraints are met
- Safe HTML rendering (XSS protection)
- Deterministic time support for testing

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Persistence**: Vercel KV (Redis)
- **Deployment**: Vercel

## Persistence Layer

This application uses **Vercel KV**, which is a serverless Redis database optimized for Vercel deployments. 

Key benefits:
- Survives across serverless function invocations
- Built-in TTL support for automatic expiry
- Low latency with edge caching
- No manual database setup required

Pastes are stored as JSON strings with the following structure:
```typescript
{
  id: string;
  content: string;
  createdAt: number;
  expiresAt: number | null;
  maxViews: number | null;
  viewCount: number;
}
```

## Running Locally

### Prerequisites

- Node.js 18+ and npm
- A Vercel account (for KV database)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pastebin-lite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Vercel KV**
   
   You need to create a Vercel KV database and get the credentials:
   
   a. Go to [Vercel Dashboard](https://vercel.com/dashboard)
   b. Navigate to Storage → Create Database → KV
   c. Copy the environment variables
   
4. **Create `.env.local` file**
   
   Create a `.env.local` file in the root directory with your Vercel KV credentials:
   ```env
   KV_URL=your_kv_url
   KV_REST_API_URL=your_kv_rest_api_url
   KV_REST_API_TOKEN=your_kv_rest_api_token
   KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Health Check
```
GET /api/healthz
```
Returns `{ "ok": true }` if the service and database are accessible.

### Create Paste
```
POST /api/pastes
Content-Type: application/json

{
  "content": "string",
  "ttl_seconds": 60,     // optional
  "max_views": 5         // optional
}
```

Returns:
```json
{
  "id": "abc123",
  "url": "https://your-app.vercel.app/p/abc123"
}
```

### Get Paste (API)
```
GET /api/pastes/:id
```

Returns:
```json
{
  "content": "string",
  "remaining_views": 4,
  "expires_at": "2026-01-01T00:00:00.000Z"
}
```

### View Paste (HTML)
```
GET /p/:id
```

Returns an HTML page displaying the paste content.

## Design Decisions

### 1. **View Count Mechanism**
- API endpoint (`/api/pastes/:id`) increments the view counter
- HTML page (`/p/:id`) does NOT increment the counter
- This prevents double-counting when users access both endpoints

### 2. **Atomic Operations**
- View count increment and availability check happen atomically
- Paste is deleted immediately when constraints are met
- Prevents negative remaining views or serving expired pastes

### 3. **Deterministic Time for Testing**
- When `TEST_MODE=1` environment variable is set
- The `x-test-now-ms` header overrides system time
- Allows automated tests to verify TTL behavior deterministically

### 4. **Error Handling**
- All unavailable cases (expired, view limit, not found) return 404
- Invalid inputs return 400 with descriptive error messages
- All API responses include proper JSON Content-Type headers

### 5. **Redis TTL Integration**
- When a paste has a TTL, Redis's native expiry is set
- Provides automatic cleanup even if the paste is never accessed
- Reduces storage costs and improves performance

### 6. **XSS Protection**
- Paste content is rendered in a `<pre>` tag
- React automatically escapes HTML entities
- Prevents script execution from malicious paste content

## Deployment

This application is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add your Vercel KV environment variables
4. Deploy

Vercel will automatically:
- Install dependencies
- Build the Next.js application
- Deploy to a global CDN
- Connect to your KV database

## Testing

The application supports automated testing with deterministic time:

```bash
# Set environment variable
TEST_MODE=1

# Make requests with custom time header
curl -H "x-test-now-ms: 1704067200000" https://your-app.vercel.app/api/pastes/abc123
```

## Project Structure

```
pastebin-lite/
├── app/
│   ├── api/
│   │   ├── healthz/
│   │   │   └── route.ts          # Health check endpoint
│   │   └── pastes/
│   │       ├── route.ts          # POST /api/pastes
│   │       └── [id]/
│   │           └── route.ts      # GET /api/pastes/:id
│   ├── p/
│   │   └── [id]/
│   │       ├── page.tsx          # HTML paste viewer
│   │       └── not-found.tsx     # 404 page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── lib/
│   └── db.ts                     # Database operations
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## License

MIT

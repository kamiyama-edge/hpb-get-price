# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HPB Price Analyzer is a web scraping and data analysis tool for Hot Pepper Beauty (ホットペッパービューティー) salon listings. It allows @edge-i.jp domain users to analyze competitor pricing and reviews through automated web scraping, storing results in Supabase for historical tracking and visualization.

## Architecture

This is a monorepo with three main components:

### Backend (Python FastAPI)
- **Location**: `backend/`
- **Entry point**: `main.py`
- **Core modules**:
  - `scraper.py`: BeautifulSoup-based HPB scraper with fallback CSS selectors
  - `database.py`: Supabase client singleton with RLS-aware operations
  - `routers/analysis.py`: FastAPI router handling analyze, history endpoints
- **Authentication**: Uses `X-User-Id` header (simplified JWT implementation - JWT verification is TODO)
- **Data flow**: URL → scraper → validation → Supabase insert → return history_id + salon data

### Frontend (Next.js 15 App Router)
- **Location**: `frontend/src/`
- **Key structure**:
  - `app/`: Pages using App Router conventions
    - `page.tsx`: Landing/login page
    - `dashboard/page.tsx`: Main analysis interface
    - `analysis/[id]/`: Dynamic route for viewing saved history
  - `components/`: Reusable UI components (LoginButton, PriceScatterChart, SalonDataTable, UrlInputForm)
  - `lib/`: Utilities
    - `supabase.ts`: Browser client factory + domain validation (`@edge-i.jp`)
    - `api.ts`: Backend API wrapper functions with typed interfaces
  - `middleware.ts`: Authentication guard + domain restriction middleware

### Database (Supabase)
- **Location**: `supabase/schema.sql`
- **Table**: `search_history` (id, created_at, user_id, target_url, raw_data JSONB)
- **RLS Policies**: Users can only view/insert/delete their own records
- **Auth**: Google OAuth restricted to `@edge-i.jp` domain via middleware

## Development Commands

### Backend
```bash
cd backend

# Setup
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
pip install -r requirements-test.txt  # For testing

# Run development server
python main.py  # Starts on port 8000 with auto-reload

# Run tests
pytest  # All tests
pytest tests/test_scraper.py  # Single file
pytest -k test_function_name  # Single test
```

### Frontend
```bash
cd frontend

# Setup
npm install

# Development
npm run dev  # Starts on localhost:3000
npm run build  # Production build
npm start  # Production server

# Testing
npm test  # Run Vitest in watch mode
npm run test:run  # Run tests once (CI)

# Linting
npm run lint
```

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:3000  # Optional, for CORS
PORT=8000  # Optional
```

### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Key Implementation Details

### Scraping Strategy
The scraper uses multiple fallback CSS selectors due to Hot Pepper Beauty's inconsistent HTML structure:
- Salon names: `.slnName, .salonName, h3 a, h2 a, [class*="name"] a, .detailTitle a`
- Reviews: `.reviewNum, .口コミ, [class*="review"], [class*="kuchikomi"], .cntWrap`
- Prices: `.couponPrice, .menuPrice, [class*="price"], .prc, .money`

If one selector fails, the parser continues with the next. Individual card parse failures don't break the entire scrape.

### Authentication Flow
1. User clicks Google OAuth button (frontend)
2. Supabase Auth handles OAuth redirect + callback
3. Middleware checks session + validates `@edge-i.jp` domain
4. Frontend passes user.id as `X-User-Id` header to backend
5. Backend uses this for RLS operations (JWT verification planned but not implemented)

### Data Storage
All scraping results are stored in `search_history.raw_data` as JSONB containing the full salon array. This allows historical analysis without re-scraping.

## Testing Approach

### Backend Tests
- Uses pytest with async support (`pytest-asyncio`)
- `test_scraper.py`: Tests parsing logic with mock HTML
- `test_api.py`: FastAPI integration tests using httpx

### Frontend Tests
- Uses Vitest + React Testing Library
- `api.test.ts`: API utility functions
- `SalonDataTable.test.tsx`: Component rendering
- `supabase.test.ts`: Domain validation logic

## Deployment

### Frontend (Vercel)
From `frontend/` directory:
```bash
vercel
```
Set environment variables in Vercel dashboard.

### Backend (Render or similar)
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add environment variables in hosting dashboard

## Important Constraints

1. **Domain Restriction**: All authentication is hardcoded to `@edge-i.jp` in `lib/supabase.ts` and `middleware.ts`
2. **No JWT Verification**: Backend accepts `X-User-Id` header directly without JWT validation (see TODO in `routers/analysis.py:44`)
3. **HPB Scraping Fragility**: Hot Pepper Beauty's HTML structure changes frequently; selectors may need updates
4. **Rate Limiting**: No rate limiting implemented - be cautious with multi-page scrapes

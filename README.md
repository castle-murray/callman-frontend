# CallManager — React Frontend

A modern single-page application for labor and event staffing management. Companies create events with call times, define labor requirements, request workers via SMS, and track clock-in/out with time entries and meal breaks.

This React app is a rebuild of the original Django template-based CallManager app, consuming the Django REST API backend.

## Tech Stack

- **React 19** with Vite 7
- **React Router 7** — client-side routing
- **TanStack React Query 5** — server state management and caching
- **Axios** — HTTP client with token auth interceptor
- **Tailwind CSS v4** — utility-first styling with dark mode support
- **Framer Motion** — animations and transitions

## Prerequisites

- Node.js 18+
- The Django backend running at `localhost:8000` (see [Backend Setup](#backend-setup))

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env

# Start the dev server (runs on port 5173)
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Production build + static prerendering |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key for location features | — |
| `VITE_API_BASE_URL` | Django backend API base URL | `http://localhost:8000` |
| `VITE_MAINTENANCE_MODE` | Set to `true` to show a maintenance page on all authenticated routes | `false` |

## Project Structure

```
src/
├── Modules/          # Page-level components (one per route)
├── components/       # Shared UI components (Header, Layout, etc.)
├── contexts/         # React context providers (User, Messages)
├── hooks/            # Custom hooks (WebSocket notifications, tooltips)
├── providers.jsx     # QueryClient + MessageProvider wrapper
├── api.js            # Axios instance with auth interceptor
├── App.jsx           # Route definitions
└── index.css         # Tailwind v4 theme (CSS custom properties)
```

## Authentication

Login via `/api/login/` returns a DRF token stored in `localStorage`. The Axios instance in `src/api.js` attaches `Authorization: Token <key>` to every request. The `Layout` component redirects unauthenticated users to the login page.

## Backend Setup

The Django backend lives in a separate repository. To run it:

```bash
cd ~/projects/callman/callman
python manage.py runserver
```

The API is served at `http://localhost:8000/api/`. CORS is configured to allow requests from the Vite dev server.

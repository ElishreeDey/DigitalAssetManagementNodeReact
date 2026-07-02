# DAM — Frontend

Single-page React app for the Digital Asset Management platform — login/register, drag-and-drop upload, an asset gallery with search/sort/filter, asset preview, and team-based sharing. Built with "React + TypeScript", bundled with "Vite".

## Tech Stack

| React + TypeScript
| Build Tool | Vite
| HTTP Client | Axios (`withCredentials` for cookie-based auth)
| Notifications | react-toastify
| Testing | Vitest + React Testing Library + jsdom
| Dev Tooling | ESLint, Prettier, Husky

## Environment Variables

Create a `.env` file in the `frontend/` directory:

- `VITE_API_BASE_URL` — base URL of the backend API (e.g. `http://localhost:3000/api/v1`)
- `VITE_EMAIL_TO_GENERATE_TOKEN` — email used

## Project Structure

frontend/
└── src/
├── assets/ # Static images/icons
├── components/ # Shared components (e.g. ConfirmModal)
├── constants/ # Auth, asset, and team constants
├── hooks/ # useLoginForm, useRegisterForm, useAssets, useUpload, useTeams
├── pages/
│ ├── Login/ # Login page
│ ├── Register/ # Register page
│ └── Dashboard/ # Dashboard shell + AssetGallery, AssetPreview, UploadZone, Teams
├── services/ # Axios-based API calls (authService, assetService, teamService)
├── types/ # Shared TypeScript types
├── utils/ # Form validation helpers
├── test/ # Vitest suites (components, hooks, pages, services, utils)
├── App.tsx # Root component — owns top-level view state (login/register/dashboard)
└── main.tsx # Entry point

## App Flow

- `App.tsx` holds a `view` state (`'login' | 'register' | 'dashboard'`) and swaps pages directly.
- `App.tsx` calls `authService.curLoggedInUser()` to check the httpOnly auth cookie; success goes straight to the dashboard, failure goes to login.
- After a successful login, `curLoggedInUser()` is called again to populate the current user before entering the dashboard.
- The `Dashboard` page `UploadZone`, `Teams`, and `AssetPreview` .

## Auth

- JWT is issued by the backend and stored in an httpOnly cookie — never touched directly by the frontend.
- Axios is configured with `withCredentials: true` so the cookie is sent on every request (see `src/services/api.ts`).

See [backend/README.md](../backend/README.md) for the full API reference this app consumes.

## Getting Started

### With Docker Compose (recommended)

From the project root, this starts the frontend alongside the backend API, worker, PostgreSQL, MinIO, and RabbitMQ:

```bash
docker compose up
```

### Locally without Docker

Install dependencies:

```bash
cd frontend
npm install
```

Run in development:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

Run tests:

```bash
npm test
```

Lint:

```bash
npm run lint
```

The app runs on `http://localhost:5173` by default.

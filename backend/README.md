# DAM — Backend

REST API for the Digital Asset Management platform. Built with "Node.js + Express + TypeScript", backed by "PostgreSQL" (Sequelize ORM), "MinIO" object storage, and "RabbitMQ" for async asset processing.

## Tech Stack

| Node.js + TypeScript
| Framework | Express.js
| Database | PostgreSQL via Sequelize ORM
| Object Storage | MinIO (S3-compatible)
| Message Queue | RabbitMQ
| Auth | JWT stored in httpOnly cookie
| Password Hashing | bcrypt
| File Uploads | Multer (in temp memory)
| Image Processing | generate thumbnails
| Video Processing | FFmpeg
| PDF Processing | pdf-to-img (thumbnail from first page)
| Security | Helmet, CORS, express-rate-limit
| Logging | Morgan
| Testing | Vitest
| Dev Tooling | ESLint, Prettier, Husky

## Environment Variables

Create a `.env` file in the `backend/` directory:

- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME

# Auth

- JWT_SECRET=your_jwt_secret_key

# CORS / Cookie

- CLIENT_URL=http://localhost:5173

# Rate limiting

- RATE_LIMIT_MAX

# MinIO

- MINIO_ENDPOINT
- MINIO_PORT
- MINIO_ACCESS_KEY
- MINIO_SECRET_KEY
- MINIO_BUCKET
- MINIO_USE_SSL

# RabbitMQ

- RABBITMQ_URL

`JWT_SECRET`, `CLIENT_URL`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` are **required** — the server will throw at startup if any are missing.

## Project Structure

backend/
└── src/
├── config/ # DB, MinIO, RabbitMQ connections and env validation
├── constants/ # App constants and user messages
├── middleware/ # Auth, rate-limit, error-handler middleware
├── models/ # Sequelize models (AuthUser, Asset, Team, TeamMembers, AssetShare)
├── repositories/ # All direct DB queries (no business logic)
├── services/ # MinIO operations, bcrypt, FFmpeg, PDF rendering
├── helpers/ # JWT generate / verify
├── controllers/ # HTTP request handlers
├── routes/ # Express routers
├── workers/ # RabbitMQ consumer — processes uploaded assets
├── types/ # Shared TypeScript types
├── index.ts # App entry point
└── worker.ts # Worker service entry point

## API Reference

All routes are prefixed with `/api/v1`.
Protected routes require a valid JWT stored in the `token` httpOnly cookie (set on login).

### Auth EndPoints

| `POST` | `/register` | Create a new account |
| `POST` | `/login` | Authenticate and receive JWT cookie |
| `POST` | `/logout` | Clear the auth cookie |
| `GET` | `/verify` | Verify current JWT is valid |
| `GET` | `/curLoggedInUser` | Get the logged-in user's profile |
| `GET` | `/accounts` | List all registered user accounts |

### Assets EndPoints

| `POST` | `/assets/upload` | Upload files (images, videos, PDFs — max 10 files, 50 MB each)
| `GET` | `/assets` | List own assets (supports `search`, `sort`, `filter`, `page`)
| `GET` | `/assets/shared-with-curloginuser` | List assets shared with the current user via team
| `DELETE` | `/assets/:id` | Delete asset and all its stored files (owner only)
| `GET` | `/assets/:id/view` | Stream asset (owner or team member with share)
| `GET` | `/assets/:id/thumbnail` | Stream asset thumbnail
| `GET` | `/assets/:id/download` | Download asset
| `POST` | `/assets/:id/share` | Share asset with a team
| `GET` | `/assets/:id/shares` | List all shares for an asset
| `DELETE` | `/assets/:id/shares/:shareId` | Remove an asset (owner only)
| `PATCH` | `/assets/:id/shares/:shareId` | Update share permission (`view` or `download`)

Accepted MIME types: `image`, `video`, `application/pdf`

### Teams EndPoints

| `POST` | `/teams` | Create a team (curLoginUser as becomes owner)
| `GET` | `/teams` | List all teams the current user belongs to
| `PATCH` | `/teams/:id` | Rename a team (owner only can do it)
| `DELETE` | `/teams/:id` | Delete a team and all its members/shares (owner only)
| `GET` | `/teams/:id/members` | List team members with emails
| `POST` | `/teams/:id/members` | Add a member to a team by email (owner only)
| `DELETE` | `/teams/:id/members/:userId` | Remove a member from a team (owner only)

### Async Asset Processing

Uploads are non-blocking. After storing the raw file in MinIO, the API publishes a job to the `asset-processing` RabbitMQ queue and returns immediately.
The "worker" service consumes the queue and generate thumbnail for image,videos and pdfs

- Images — generates a 400×400 thumbnail via Sharp
- Videos — transcodes to 720p + 1080p renditions via FFmpeg
- PDFs — renders the first page as a thumbnail via pdf-to-img

Once processing completes, the asset `status` is updated from `pending → processing → ready` (or `failed`).

### Storage Layout (MinIO)

dam-assets/
├── <uuid>.<ext> # original file
├── thumbnails/<uuid>.jpg # generated thumbnail
└── renditions/<uuid>-720p.mp4 # video renditions
renditions/<uuid>-1080p.mp4

### Token and password

- Token stored as a httpOnly, Secure cookie — never exposed to JavaScript
- Token expiry: 1 day
- Password hashing: bcrypt, 10 salt rounds

## DB Models

AuthUser (`auth_users`)
| id | UUID | Primary key
| email | STRING | Unique
| passwordHash | STRING | bcrypt hash
| createdAt / updatedAt | DATE | Auto-managed

### Asset (`assets`)

| id | UUID | Primary key
| originalName | STRING | Original filename
| storedName | STRING | UUID-based name in MinIO
| mimeType | STRING | e.g. `image/jpeg`
| size | INTEGER | Bytes
| bucketPath | STRING | MinIO object key
| thumbnailPath | STRING | MinIO thumbnail key
| tags | ARRAY(STRING) | Auto-generated keywords
| width / height | INTEGER | Image/video dimensions
| renditions | JSON | Video rendition metadata
| status | ENUM | `pending` / `processing` / `ready` / `failed`
| uploadedBy | UUID | FK → AuthUser
| downloadCount | INTEGER | Default 0

### Team (`teams`)

| id | UUID | Primary key
| name | STRING | Team display name
| createdBy | UUID | FK → AuthUser

### TeamMember (`team_members`)

| id | UUID | Primary key
| teamId | UUID | FK → Team
| userId | UUID | FK → AuthUser
| role | STRING | `owner` / `member`

### AssetShare (`asset_shares`)

| id | UUID | Primary key
| assetId | UUID | FK → Asset
| teamId | UUID | FK → Team
| permission | ENUM | `view` / `download`
| createdBy | UUID | FK → AuthUser
| — | — | Unique constraint on `(assetId, teamId)`

## Getting Started

### With Docker Compose (recommended)

This starts the backend API, worker, PostgreSQL, MinIO, and RabbitMQ together.
From the project root:

```bash
docker compose up
```

### Locally without Docker

Install dependencies

```bash
cd backend
npm install
```

Run in development

```bash
npm run dev
```

Run the asset-processing worker

```bash
npm run worker:dev
```

Build for production:

```bash
npm run build
npm start
# Worker:
npm run worker:start
```

Run tests:

```bash
npm test
npm run test:run  #single run
```

The API listens on `http://localhost:3000` by default.

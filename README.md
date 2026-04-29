# Insighta Labs+ Web Portal

A web portal for the Insighta Labs+ Profile Intelligence System, enabling non-technical users to access profile data through a secure, role-based interface.

## Overview

Insighta Labs+ is a multi-interface platform that provides secure access to the Profile Intelligence System. This repository contains the **Web Portal** component, which works in conjunction with:

- **Backend**: `hng-i14-task-3-david-uzondu-backend` - Handles authentication, data storage, and API endpoints
- **CLI**: `hng-i14-task-3-david-uzondu-cli` - Command-line interface for power users

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Insighta Labs+ Platform                     │
├─────────────────┬─────────────────────┬─────────────────────────┤
│   Web Portal    │        CLI          │       Backend           │
│   (This repo)   │   (CLI repo)        │    (Backend repo)       │
├─────────────────┼─────────────────────┼─────────────────────────┤
│ React Router    │ TypeScript/Commander │ Express/Prisma          │
│ React Bootstrap │ Axios                │ PostgreSQL              │
│ React Query     │ Chalk/Clack          │ GitHub OAuth (PKCE)     │
└────────┬────────┴──────────┬──────────┴───────────┬────────────┘
         │                   │                      │
         │    HTTP-Only Cookies + Credentials       │
         └───────────────────┴──────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │   REST API Backend   │
                    │   /api/profiles      │
                    │   /auth/*            │
                    └─────────────────────┘
```

## Features

### Authentication
- GitHub OAuth 2.0 with PKCE flow
- HTTP-only cookies for secure token storage
- CSRF protection via state validation
- Access token (3 min) + Refresh token (5 min) lifecycle

### Role-Based Access Control
- **Admin**: Full access - create, delete, query profiles
- **Analyst**: Read-only - search and view profiles only

### Pages
| Page | Description |
|------|-------------|
| `/login` | GitHub OAuth login |
| `/dashboard` | Profile statistics and quick actions |
| `/profiles` | Filter, sort, paginated profile list |
| `/profiles/create` | Create new profile (Admin only) |
| `/profiles/:id` | Profile detail view |
| `/search` | Natural language profile search |
| `/account` | User account information |

### API Features
- API versioning via `X-API-Version: 1` header
- CSV export for profile data
- Filtering, sorting, pagination
- Natural language search

## Prerequisites

- Node.js 18+
- pnpm 8+
- Access to running backend server

## Installation

```bash
# Clone the repository
git clone https://github.com/daviduzondu/hng-i14-task-3-david-uzondu-frontend.git
cd hng-i14-task-3-david-uzondu-frontend

# Install dependencies
pnpm install

# (Optional) Approve builds for esbuild
pnpm approve-builds
```

## Configuration

Create a `.env` file in the root directory:

```env
VITE_BACKEND_URL_BASE=http://localhost:6060
```

Adjust `VITE_BACKEND_URL_BASE` to point to your backend server.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Create production build |
| `pnpm start` | Run production server |
| `pnpm typecheck` | Run TypeScript type checking |

## Development

Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:5173`.

## Authentication Flow (Web Portal)

1. User visits `/login`
2. Clicks "Continue with GitHub"
3. Browser navigates to `GET /auth/github` (backend redirect)
4. Backend sets `oauth_state` and `oauth_code_verifier` cookies
5. Redirects to GitHub OAuth
6. User authenticates
7. GitHub redirects to `/auth/github/callback` with `code` and `state`
8. Frontend validates state cookie, clears cookies
9. Frontend calls backend callback with code + verifier
10. Backend sets HTTP-only access/refresh cookies
11. Frontend uses `/auth/me` to get user info

### Token Handling

- **Access Token**: Stored in HTTP-only cookie, unreadable by JavaScript
- **Refresh Token**: Automatically handled by browser cookies
- **User Info**: Retrieved via `GET /auth/me` endpoint with `credentials: "include"`

## Role Enforcement Logic

1. Backend enforces roles on all `/api/*` endpoints
2. Frontend displays features based on user role from `/auth/me`
3. Admin-only features:
   - Create profile (`/profiles/create`)
   - Delete profile

## Error Handling

- 401: Redirect to login
- 403: Show access denied message
- 429: Rate limit exceeded - show retry message

## Deployment

### Docker

```bash
# Build the image
docker build -t insighta-web .

# Run the container
docker run -p 3000:3000 insighta-web
```

### Manual

```bash
# Build for production
pnpm build

# Start the server
pnpm start
```

## Project Structure

```
├── app/
│   ├── lib/
│   │   ├── api.ts        # Axios instance with credentials
│   │   ├── auth.ts       # Auth utilities (fetchCurrentUser, logout)
│   │   └── utils.ts      # Formatting utilities
│   ├── routes/
│   │   ├── login.tsx           # Login page
│   │   ├── auth-callback.tsx   # OAuth callback handler
│   │   ├── layout.tsx          # Main layout with nav
│   │   ├── dashboard.tsx       # Dashboard with stats
│   │   ├── profiles.tsx        # Profiles list
│   │   ├── profiles-create.tsx # Create profile form
│   │   ├── profile-detail.tsx  # Profile detail view
│   │   ├── search.tsx          # Natural language search
│   │   └── account.tsx         # User account page
│   ├── types/
│   │   ├── index.ts     # Core type definitions
│   │   └── api.ts       # API response types
│   ├── root.tsx         # App root component
│   └── routes.ts        # Route definitions
├── public/                    # Static assets
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Dependencies

### Production
- `react` / `react-dom` - UI framework
- `react-router` - Routing
- `react-bootstrap` / `bootstrap` - UI components
- `@tanstack/react-query` - Data fetching
- `axios` - HTTP client
- `react-hook-form` / `zod` - Form handling & validation
- `@hookform/resolvers` - Zod resolver for React Hook Form
- `content-disposition` - Parse Content-Disposition header

### Development
- `typescript` - Type safety
- `vite` - Build tool
- `@react-router/dev` - React Router tooling

## CI/CD

This project uses GitHub Actions for continuous integration. On pull requests to `main`, the following checks run:

- TypeScript type checking
- Build verification

## Related Repositories

- **Backend**: `hng-i14-task-3-david-uzondu-backend`
- **CLI**: `hng-i14-task-3-david-uzondu-cli`

## License

MIT
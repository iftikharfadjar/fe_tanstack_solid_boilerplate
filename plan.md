# TanStack Solid Boilerplate Architecture & Implementation Plan

This document outlines the architecture, library choices, and implementation strategy used in this frontend boilerplate.

## Overview
This boilerplate is built using **TanStack Start** and **SolidJS**, prioritizing type-safe routing, server functions, and modern SSR capabilities. It adheres to **Clean Architecture** principles to separate business logic from UI and infrastructure.

## Technology Stack

- **Core Framework**: TanStack Start + SolidJS
- **Database & ORM**: SQLite + Prisma
- **Authentication**: JWT stored in HttpOnly cookies (`jose`, `bcryptjs`)
- **API Clients**: 
  - REST: Native `fetch` wrapper (No Axios)
  - GraphQL: `urql` client
- **Styling**: Tailwind CSS v4
- **UI Components**: Solid-UI (Stateful and Stateless component separation)

## Folder Structure (Clean Architecture)

```text
src/
├── core/                   # Domain Layer (Entities)
│   └── domain/             # Business models and entity types (e.g., User.ts)
├── data/                   # Interface Adapters & Infrastructure
│   ├── db/                 # Prisma client initialization (prisma.ts)
│   ├── repositories/       # Implementations of core interfaces (UserRepository.ts)
│   ├── rest/               # REST API client (apiClient.ts)
│   └── graphql/            # GraphQL API client (graphqlClient.ts)
├── presentation/           # UI Layer (Separated into Stateful and Stateless)
│   ├── components/
│   │   ├── stateful/       # Smart components (Containers) handling logic & signals
│   │   └── stateless/      # Dumb components (Presentational), pure UI via props
│   └── ui/                 # Solid-UI generic components
├── routes/                 # TanStack Router file-based routing
│   ├── index.tsx           # Public page
│   ├── auth.tsx            # Login/Signup page
│   └── dashboard.tsx       # Protected page
├── server/                 # Server-side Logic
│   └── serverFn/           # TanStack Server Functions for Auth (auth.ts, session.ts)
```

## Features

### Authentication (Server Functions)
Authentication is handled entirely via **TanStack Server Functions** natively on the server side:
- **Signup**: Hashing the user's password using `bcryptjs` and saving it via Prisma to the SQLite database.
- **Login**: Verifying credentials and signing a secure JWT using `jose`. The JWT is set as an `HttpOnly` cookie.
- **Logout**: An action that invalidates/clears the `auth_token` cookie.
- **Session Check**: A server function (`getSessionUserFn`) used in the `beforeLoad` step of the router to protect routes (like `/dashboard`).

### UI & Component Pattern
We strictly separate components into two categories:
1. **Stateful Containers** (e.g., `AuthContainer.tsx`): Responsible for managing Solid signals, handling side effects (calling server functions), and managing the overall state of the view.
2. **Stateless Presentational** (e.g., `AuthForm.tsx`): Responsible solely for rendering UI elements. They receive data and callbacks via props and do not hold their own business logic state.

### Routing Configuration
- `/`: The public landing page.
- `/auth`: The public authentication page containing the Login/Signup forms.
- `/dashboard`: A protected route that verifies the JWT cookie before rendering. If the user is unauthenticated, they are redirected to `/auth`.

## Setup & Execution

1. **Database Syncing**: Ensure the SQLite database is synchronized with Prisma.
   ```bash
   npx prisma db push
   ```
2. **Development Server**: Run the application in dev mode.
   ```bash
   npm run dev
   ```

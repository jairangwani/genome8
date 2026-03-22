# Organization

## Scope
A web application where authenticated users create, complete, and delete personal todo tasks. Admin users have elevated access to view all users and their tasks across the system.

## Architecturally Independent Parts

- **Authentication** — Self-contained login/signup flow with its own session and token lifecycle. No dependency on task or admin logic; other modules depend on it, not vice versa.
- **Task Management** — Pure CRUD operations on tasks scoped to a user. Independent of how users are created or how admins view data; only needs to know the current user's identity.
- **Admin Panel** — Read-only oversight layer that aggregates existing user and task data. Independent because it adds no new domain logic — it only queries and displays what other modules already own.

## Modules

- `auth` — User signup, login, logout, and session/token management
- `tasks` — Create, complete, and delete tasks for the authenticated user
- `users` — User profile and account data model, shared across modules
- `admin` — Admin-only views listing all users and all tasks with filtering

## Dependency Order

```
auth
  └── users       (users module uses auth for identity)
        └── tasks (tasks are scoped to a user identity)
        └── admin (admin aggregates users + tasks)
```

- `auth` — no dependencies (foundational)
- `users` — depends on `auth`
- `tasks` — depends on `auth`, `users`
- `admin` — depends on `users`, `tasks`

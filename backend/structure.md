backend/
  src/
    app.ts                       # Express app bootstrap
    server.ts                    # Server start (http.listen) for prod/dev

    config/
      env.ts                     # Load/validate env vars (Zod)
      supabase.ts                # Supabase server client (service role for backend ops)
      cors.ts                    # CORS configuration
      rate-limit.ts              # Express-rate-limit config (optional)

    middleware/
      error-handler.ts           # Central error handler
      not-found.ts               # 404 handler
      auth.ts                    # Verify Supabase JWT, attach user
      validate.ts                # Zod validator middleware

    routes/
      index.ts                   # Mount all routers under /api
      auth.routes.ts             # /auth (if any server-assisted flows)
      users.routes.ts            # /users
      clinics.routes.ts          # /clinics
      appointments.routes.ts     # /appointments
      reviews.routes.ts          # /reviews

    controllers/                 # Request/response orchestration only
      users.controller.ts
      clinics.controller.ts
      appointments.controller.ts
      reviews.controller.ts

    services/                    # Business/use-case logic (no Express)
      users.service.ts
      clinics.service.ts
      appointments.service.ts
      reviews.service.ts

    repositories/                # Direct Supabase queries (single responsibility)
      users.repo.ts
      clinics.repo.ts
      appointments.repo.ts
      reviews.repo.ts

    schemas/                     # Zod DTOs for inputs/outputs
      users.schema.ts
      clinics.schema.ts
      appointments.schema.ts
      reviews.schema.ts
      common.ts

    utils/
      logger.ts                  # Pino or console wrapper
      pagination.ts              # Limit/offset helpers
      geo.ts                     # Haversine/distance helpers (if needed)
      types.ts                   # Shared types

    dtos/                        # Response mappers for frontend
      user.dto.ts
      clinic.dto.ts
      appointment.dto.ts
      review.dto.ts

    health/
      health.routes.ts           # /health, /ready, /live

  test/
    repositories/
    services/
    controllers/

.env                             # SUPABASE_* keys, PORT, CORS_ORIGIN
tsconfig.json
package.json
eslint.config.js
README.md

---

# Conventions (Node.js + Supabase)

- Use `@supabase/supabase-js` v2. Server creates:
  - `serviceClient` (Service Role key) for trusted server tasks only
  - `userClient(req)` built from the request Bearer token for RLS-safe queries
- RLS remains enabled in Supabase; prefer `userClient` in controllers/services handling user data.
- Validation with `zod`; `middleware/validate.ts` binds schemas to routes.
- Errors: throw `HttpError(status, message)` from services; `error-handler.ts` maps to JSON.

## Environment variables

- SUPABASE_URL
- SUPABASE_ANON_KEY               # verify frontend tokens
- SUPABASE_SERVICE_ROLE_KEY       # server operations (restricted use)
- PORT=8001
- CORS_ORIGIN=http://localhost:8080

## Repositories (table access)

Match Supabase tables exactly:

- `users.repo.ts`
  - table: `users`
  - columns: `user_id, name, email, password, phone, role, created_at`

- `clinics.repo.ts`
  - table: `clinics`
  - columns: `clinic_id, name, address, latitude, longitude, services, consultation_fee, contact, rating, created_at`

- `appointments.repo.ts`
  - table: `appointments`
  - columns: `appointment_id, user_id, clinic_id, date, time, status, created_at`

- `reviews.repo.ts`
  - table: `reviews`
  - columns: `review_id, user_id, clinic_id, rating, comment, created_at`

## Schemas (zod)

- users.schema.ts
  - RegisterInput: `{ name, email, phone?, password, role? }`
  - LoginInput: `{ email, password }`

- clinics.schema.ts
  - CreateClinicInput: `{ name, address?, latitude, longitude, services?, consultation_fee?, contact? }`
  - QueryClinicsInput: `{ q?, min_rating?, limit?, offset? }`

- appointments.schema.ts
  - CreateAppointmentInput: `{ user_id, clinic_id, date, time, status? }`
  - UpdateAppointmentInput: `{ status?, date?, time? }`

- reviews.schema.ts
  - CreateReviewInput: `{ user_id, clinic_id, rating (1..5), comment? }`

## Routes (REST surface)

- `/api/users/register` POST
- `/api/users/login` POST
- `/api/users/me` GET (auth)

- `/api/clinics` GET (filters: `q, min_rating, limit, offset`)
- `/api/clinics/:clinicId` GET
- `/api/clinics` POST (auth: role clinic/admin)
- `/api/clinics/:clinicId` PUT/DELETE (optional auth)

- `/api/appointments?userId=<id>` GET (auth)
- `/api/appointments/:id` GET (auth)
- `/api/appointments` POST (auth)
- `/api/appointments/:id` PUT (auth)
- `/api/appointments/:id` DELETE (auth)

- `/api/reviews/clinic/:clinicId` GET
- `/api/reviews` POST (auth)

## Controller → Service → Repository flow

1. Route applies `validate(schema)` and `auth` as needed
2. Controller calls service with typed input
3. Service orchestrates business rules, then calls repository
4. Repository executes Supabase query and returns typed rows
5. Controller maps row(s) to DTO and responds

## Example repository signature (appointments.repo.ts)

```ts
export async function insert(serviceClient, payload: {
  user_id: number; clinic_id: number; date: string; time: string; status?: 'pending'|'confirmed'|'cancelled'
})
```

## Auth middleware

- Extract `Authorization: Bearer <token>` from request
- Verify via `supabase.auth.getUser(token)`; on success attach `{ userId: user.id, email }` to `req.user`

This structure matches your Supabase schema exactly and keeps Node.js layers clean and testable. Next step: scaffold folders/files and wire base clients and middlewares.
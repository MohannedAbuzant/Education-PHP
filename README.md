# Course Portal

A small course registration portal for a training academy. Admins manage
courses; students register for them and cancel, subject to a seat limit.

**Stack:** Laravel 13, PHP 8.3, MySQL, Inertia, React, TypeScript, Tailwind,
shadcn/ui. Laravel Sanctum for the API (planned), Docker via Laravel Sail.

## Getting started

```bash
cp .env.example .env
composer install
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
./vendor/bin/sail npm install
./vendor/bin/sail npm run dev
```

Seeded accounts (password `password`): `admin@example.com` (admin) and
`student@example.com` (student).

Run tests: `php artisan test`. Tests use in-memory SQLite, so they need no database.

## User stories

1. As an **admin**, I can create, edit and delete courses, so the catalogue stays current.
2. As an **admin**, I can set a seat limit on each course, so classes are not overbooked.
3. As a **student**, I can browse courses and see how many seats are left, so I can choose one.
4. As a **student**, I can register for a course with free seats, so I secure my place.
5. As a **student**, I can cancel my registration and register again later, so I can change my mind.

## Rules

- A full course, or a second active registration for the same course, returns 409.
- A wrong role or another student's record returns 403. Invalid input returns 422.
- Registration locks the course row in a transaction, so two students cannot take the last seat.
- Cancelling sets the status to `cancelled`; registering again reuses that row.

## Roadmap

1. Setup, login, roles (done)
2. Data model and admin course screens
3. Registration and cancellation
4. REST API with Sanctum
5. Tests and CI
6. Deployment, Sentry, API docs

# Course Portal API

A small JSON REST API for course registration. Everything below is covered by
the tests in `tests/Feature/Api`.

- **Base URL:** `https://<your-app>/api` (locally `http://localhost/api`)
- **Format:** send and receive JSON. Send `Accept: application/json`.
- **Auth:** [Laravel Sanctum](https://laravel.com/docs/sanctum) bearer tokens.

## Quick start

```bash
# 1. Log in and keep the token
TOKEN=$(curl -s -X POST http://localhost/api/login \
  -H 'Accept: application/json' -H 'Content-Type: application/json' \
  -d '{"email":"student@example.com","password":"password"}' | jq -r .token)

# 2. List courses
curl -s http://localhost/api/courses \
  -H 'Accept: application/json' -H "Authorization: Bearer $TOKEN"

# 3. Register for course 1
curl -s -X POST http://localhost/api/courses/1/enrollments \
  -H 'Accept: application/json' -H "Authorization: Bearer $TOKEN"
```

## Endpoints

| Method and path | Who | Purpose | Success |
|---|---|---|---|
| `POST /api/login` | Anyone | Get a token | 200 |
| `GET /api/courses` | Logged in | List courses, 15 per page | 200 |
| `GET /api/courses/{course}` | Logged in | Show one course and seats left | 200 |
| `POST /api/courses` | Admin | Create a course | 201 |
| `PUT /api/courses/{course}` | Admin | Update a course | 200 |
| `DELETE /api/courses/{course}` | Admin | Delete a course with no enrollments | 204 |
| `POST /api/courses/{course}/enrollments` | Student | Register | 201 |
| `GET /api/me/enrollments` | Student | List own registrations | 200 |
| `DELETE /api/enrollments/{enrollment}` | Owner | Cancel a registration | 200 |

## Authentication

### `POST /api/login`

Request:

```json
{ "email": "student@example.com", "password": "password" }
```

Response `200`:

```json
{ "token": "1|abc123...", "role": "student" }
```

Send the token on every other request as `Authorization: Bearer <token>`.
Login is rate limited to **5 attempts per minute** per IP address and returns `429`
after that. Wrong credentials return `401`.

## Courses

A course looks like this:

```json
{
  "id": 1,
  "title": "Intro to Laravel",
  "description": "Basics",
  "seats": 20,
  "seats_left": 17,
  "starts_at": "2027-01-10"
}
```

`seats_left` is calculated from active registrations. It is never stored.

### `GET /api/courses`

Paginated: the response has `data`, `links` and `meta`. Use `?page=2` for the
next page.

### `POST /api/courses` and `PUT /api/courses/{course}` (admin)

| Field | Rules |
|---|---|
| `title` | required, text, up to 255 characters |
| `description` | optional, up to 5000 characters |
| `seats` | required, whole number from 1 to 1000 |
| `starts_at` | required, a date such as `2027-01-10` |

Response: `{ "data": { ...course } }`.

### `DELETE /api/courses/{course}` (admin)

Returns `204` with no body. A course that has any registrations, even cancelled
ones, returns `409` and is kept.

## Registrations

A registration looks like this:

```json
{
  "id": 5,
  "status": "active",
  "course": { "id": 1, "title": "Intro to Laravel", "...": "..." },
  "created_at": "2027-01-01T09:30:00+00:00"
}
```

`status` is `active` or `cancelled`.

### `POST /api/courses/{course}/enrollments` (student)

No body. Returns `201` with the registration.

- A full course returns `409` with `"This course is full."`.
- A second active registration for the same course returns `409`.
- Registering again after cancelling **reuses the same registration**, so you
  get the same `id` back with `status` set to `active`.

Two students asking for the last seat at the same moment cannot both get it.
The course row is locked inside a database transaction, and this is checked by a
test that runs eight PHP processes at once against MySQL.

### `GET /api/me/enrollments` (student)

Lists your own registrations with the course included, most recently changed first.

### `DELETE /api/enrollments/{enrollment}` (owner)

Sets the status to `cancelled`, frees the seat and returns the registration.
Another student's registration returns `403`.

## Errors

Errors are JSON with a `message`. Validation errors also include `errors`.

| Status | Meaning | Example |
|---|---|---|
| 401 | Missing or invalid token, or wrong login | `{"message":"Unauthenticated."}` |
| 403 | Wrong role, or not your record | admin registering, student creating a course |
| 404 | No such course or registration | `GET /api/courses/9999` |
| 409 | Rule conflict | full course, duplicate registration, deleting a course that has registrations |
| 422 | Invalid input | `seats` below 1, empty `title` |
| 429 | Too many login attempts | more than 5 per minute |

A `422` response:

```json
{
  "message": "The title field is required. (and 1 more error)",
  "errors": {
    "title": ["The title field is required."],
    "seats": ["The seats field must be at least 1."]
  }
}
```

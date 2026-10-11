# Kerman House — Persian Carpet Store

A bilingual (Arabic / Persian / English) storefront for handmade Persian carpets,
with a full admin dashboard for managing the catalogue.

- **Storefront** — landing page, collection grid, rug detail, search, contact and a
  cart/checkout flow, all localized (RTL-aware) and animated.
- **Admin dashboard** — JWT login plus CRUD for rugs (with image upload),
  categories, inquiries and users, with a stats overview.

## Tech stack

| Layer    | Technology                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, next-intl, framer-motion               |
| Backend  | Django 6.1, Django REST Framework, SimpleJWT, django-filter, django-cors-headers, django-modeltranslation, Pillow |
| Database | SQLite (development)                                                                                              |
| Media    | Local filesystem (served by Django in development)                                                                |

## Requirements

- **Node.js ≥ 20** (tested on 24)
- **Python ≥ 3.11** (tested on 3.13)
- Git

## Project layout

```
backend/            Django project
  digitalshop/      settings / urls / wsgi-asgi
  shop/             models, admin, translations, seed_demo command, migrations
  api/              serializers, views, permissions, throttles, urls
  media/            uploaded rug images (gitignored)
  requirements.txt
src/                Next.js app
  app/[locale]/     locale-prefixed routes (public + admin)
  components/       UI + admin components
  i18n/             routing / navigation / request config
  lib/              api client, auth, cart, formatting
  messages/         ar / fa / en message catalogs
  styles/           theme stylesheets
public/             static assets (images, fonts)
venv/               Python virtualenv (repo root, gitignored)
```

## 1. Backend (Django API)

The virtualenv lives at the **repository root** (`venv/`), while the Django
project is in `backend/`.

```bash
# from the repository root
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt

cd backend
python manage.py migrate
python manage.py seed_demo        # creates demo categories, rugs and an admin user
python manage.py runserver 8000
```

The API is now at **http://localhost:8000/api/** (and the Django admin at
http://localhost:8000/admin/).

> If you prefer not to activate the venv, call the interpreter directly, e.g.
> `../venv/bin/python manage.py migrate` from inside `backend/`.

### Demo admin credentials

`seed_demo` creates the superuser **only if it does not already exist** and never
resets an existing password:

- username: `admin`
- password: `admin12345` (or the value of `DJANGO_SEED_ADMIN_PASSWORD`)

Change this before deploying. Log in to the dashboard at
`http://localhost:3000/ar/admin/login` (or `/fa/admin/login`, `/en/admin/login`).

## 2. Frontend (Next.js)

```bash
# from the repository root (second terminal)
npm install
cp .env.example .env.local
npm run dev
```

Open **http://localhost:3000** — it redirects to the default locale (`/ar`).

> **Heads-up:** if your shell exports `NODE_ENV=production`, `npm install` skips
> devDependencies. Install them explicitly with
> `NODE_ENV=development npm install --include=dev`.

### Running both together

Start the backend on port `8000` and the frontend on port `3000` (two terminals).
The frontend talks to the API via `NEXT_PUBLIC_API_URL` and, in development,
`next/image` is allowed to load media from the local API host.

## Environment variables

### Frontend — `.env.local` (see `.env.example`)

| Variable              | Default                     | Notes                          |
| --------------------- | --------------------------- | ------------------------------ |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Must include the `/api` prefix |

### Backend — optional (see `backend/.env.example`)

| Variable                      | Default               | Notes                                      |
| ----------------------------- | --------------------- | ------------------------------------------ |
| `DJANGO_SECRET_KEY`           | insecure dev key      | **Required** in production                 |
| `DJANGO_DEBUG`                | `true`                | Set to `false` in production               |
| `DJANGO_ALLOWED_HOSTS`        | `localhost,127.0.0.1` | Comma-separated                            |
| `DJANGO_CORS_ORIGINS`         | —                     | Comma-separated (CORS is open while DEBUG) |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | —                     | Comma-separated                            |
| `DJANGO_SEED_ADMIN_PASSWORD`  | `admin12345`          | Used only when seeding a new admin         |
| `SEED_ASSETS_DIR`             | `../public/assets`    | Source images for `seed_demo`              |

When `DJANGO_DEBUG=false`, HTTPS/HSTS/secure-cookie hardening is enabled
automatically.

## Scripts

### Frontend

```bash
npm run dev        # start the dev server (Turbopack)
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run format     # Prettier
```

### Backend

```bash
cd backend
python manage.py runserver   # dev server
python manage.py migrate     # apply migrations
python manage.py seed_demo   # (re)seed demo data
python manage.py test        # run the test suite
python manage.py createsuperuser
```

## Testing & checks

```bash
npm run typecheck && npm run lint && npm run build   # frontend
cd backend && python manage.py test                  # backend (10 tests)
```

A Husky `pre-commit` hook runs `npm run format && npm run lint`.

## API reference

Base URL: `/api/` — authenticated with `Authorization: Bearer <access>`.
Writes require a staff account; user administration requires a superuser.

| Method & path                               | Auth                      | Description                           |
| ------------------------------------------- | ------------------------- | ------------------------------------- |
| `POST /api/token/`                          | public                    | Obtain access + refresh tokens        |
| `POST /api/token/refresh/`                  | public                    | Refresh (rotates + blacklists)        |
| `GET  /api/me/`                             | authenticated             | Current user                          |
| `GET  /api/stats/`                          | staff                     | Dashboard counters + recent inquiries |
| `GET  /api/products/`                       | public                    | List rugs (paginated)                 |
| `POST /api/products/`                       | staff                     | Create a rug                          |
| `GET  /api/products/{id}/`                  | public                    | Rug detail                            |
| `GET  /api/products/by-slug/{slug}/`        | public                    | Rug detail by slug                    |
| `PUT/PATCH/DELETE /api/products/{id}/`      | staff                     | Update / delete a rug                 |
| `POST /api/products/{id}/images/`           | staff                     | Upload a rug image                    |
| `GET/PATCH/DELETE /api/carpet-images/{id}/` | staff                     | Manage images (primary handling)      |
| `GET/POST /api/categories/`                 | read public / write staff | Categories                            |
| `POST /api/inquiry/`                        | public                    | Submit a contact / checkout inquiry   |
| `GET/DELETE /api/inquiry/{id}/`             | staff                     | Read / delete inquiries               |
| `GET/POST /api/users/`                      | superuser                 | Manage users                          |

**Product filters:** `?search=`, `?category=<id>`, `?stock_status=available|reserved|sold`,
`?ordering=price|-price|created_at`, `?page=&page_size=`.

Rug codes (`KH-0001`, …) and slugs are generated automatically.
Inquiries and login are rate-limited.

## Internationalization

Locales: `ar` (default), `fa`, `en`. The locale is always in the path
(`/ar/...`, `/fa/...`, `/en/...`); bare paths redirect to the default locale.
Arabic and Persian render RTL. Translated content is served via
`django-modeltranslation` based on the request's `Accept-Language`.

## Deployment notes

- Set `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=false`, `DJANGO_ALLOWED_HOSTS`,
  `DJANGO_CORS_ORIGINS` and `DJANGO_CSRF_TRUSTED_ORIGINS`.
- Run `python manage.py collectstatic` (uses `STATIC_ROOT`).
- Serve `/media/` (uploaded images) and `/static/` from your web server or CDN —
  Django only serves media automatically while `DEBUG=true`.
- Point `NEXT_PUBLIC_API_URL` at the public API and ensure the API host is allowed
  in `next.config.ts` image `remotePatterns`.

# Smart Hostel & Meal Management — Frontend (Phase 1)

Frontend for **শহীদ মোনায়েম ছাত্রাবাস / Shahid Monayem Chhatrabas** (est. 1963).
This is **Phase 1: frontend only**. There is no backend and no database. Everything runs on realistic
mock data held in local React state, so the whole app is navigable and demonstrable on its own.
The backend (PostgreSQL + Prisma) is Phase 2 and has not been started.

The 3D building is modelled on the reference photo in `docs/hostel-reference.jpeg`: cream/ochre upper
walls, white balcony bands, red vertical pilasters, green window frames and the dark arch gate with red
discs and green posts.

## Phase 01 — Foundation status

- **Bilingual** UI (Bengali default, English toggle, persisted in `localStorage`).
- **RBAC shell**: `OWNER` and `ADMIN` reach `/admin`; `RESIDENT` and `MANAGER` reach `/dashboard`.
  Roles are enforced on the server too — the UI guard is only for navigation.
- **Admin shell**: responsive sidebar with global module search, breadcrumbs, notification bell and profile menu.
- **API foundation**: `src/config/index.ts` reads `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_USE_MOCK_API`;
  `src/lib/api.ts` is the typed credentialed fetch client (CSRF-aware). Phase 01 still uses the mock store.
- Better Auth / TanStack Query / Axios migration needs explicit approval — see the root README.

## Requirements

- Node.js 18.18 or newer (developed on Node 22)
- npm 9 or newer

## Install and run

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build
npm start            # http://localhost:3000
```

Other checks: `npm run lint`, `npm run typecheck`. With Next.js 16, `next lint` was removed, so `lint` uses the ESLint CLI directly.

### Visual identity

The UI uses one consistent **midnight-indigo SaaS identity**: slate surfaces, white cards, indigo→violet
gradient actions, gold accent rules, aurora/dot-grid backdrops, glowing sidebar and soft elevated panels.
Tokens live in `src/app/globals.css` and `tailwind.config.ts`; shared primitives (`Card`, `Button`,
`StatCard`, `PageHeader`) carry the look across every route, so new pages stay consistent without extra styling.
Motion is CSS-only and respects `prefers-reduced-motion`.

Phase 01 uses environment config for the future API connection (`NEXT_PUBLIC_API_BASE_URL`,
`NEXT_PUBLIC_USE_MOCK_API`) — see `.env.example`. No secrets belong in the frontend.

## Demo accounts

| Role     | Email                | Password     |
| -------- | -------------------- | ------------ |
| Admin    | `admin@demo.hostel`  | `Demo@12345` |
| Resident | `resident@demo.hostel` | `Demo@12345` |

Sign in with the credentials above on the login form — there is no role picker on the login or registration
page. Public registration always creates a resident (student) account; an admin can change roles later.

## What is included

- **Bilingual UI (বাংলা default, English second)** with an instant toggle, no reload. The choice is saved in
  `localStorage`. Dictionaries live in `src/i18n/dictionaries/`; components only use translation keys.
  Dates, numbers and currency (৳ BDT) are locale-aware, with Noto Sans Bengali for Bangla text.
- **Interactive 3D hostel** (React Three Fiber): 3 floors, 30 rooms, 120 beds. Rooms run **west → east** on every floor:
  `100–109`, `201–210`, `301–310`. Each room has a balcony, door, windows, railings and a room-number sign. Four beds sit in
  the corners (`100-A … 100-D`). Beds are green (meal ON), red (OFF) or gray (unassigned or inactive).
  Hover shows a tooltip, click opens a details panel, and there are zoom/reset buttons plus a legend.
  A loading animation is shown, and a **2D floor-plan fallback** is used when WebGL is missing, the device looks
  low-end, or the user switches to it.
- **Live meal schedule** with breakfast / lunch / dinner serving times, a "serving now / next meal" status and
  countdown. Times are editable by an admin under Settings → Meal rules.
- **Student-hostel verification**: a sealed "Verified student hostel" panel plus `/verify`, where anyone can look up
  a resident by student ID, name or room number and see their room, department and active status.
- **Today's menu** with breakfast / lunch / dinner / specials, 1–5 star ratings with optional feedback, averages,
  rating counts and duplicate-rating prevention.
- **Scrolling announcements** with 4 styles, pause on hover and a pause button.
- **Daily market**: default item list, custom items, automatic `quantity × unit price`, receipt upload (preview),
  date and category filters, history and daily summary.
- **Monthly market manager**: an admin assigns one resident per month. The manager records purchases; residents send
  "what I bought" requests which the manager approves into the shared list (or rejects). Everyone can view the list.
- **Resident identity**: date of birth and a photo are mandatory. Registration is rejected when either is missing;
  both are shown in the admin resident table and on the public verification page.
- **Registration → approval → login**: residents register with student ID, date of birth and photo. The account is
  created as **pending** and cannot log in until an admin approves it from `Admin → Residents` (approve/reject).
- **Member management**: the admin dashboard shows total members and role breakdown. Admins can add/delete members
  and assign one of three roles — Admin, Manager or Student member. Managers may record purchases; ordinary members
  can only send requests, never add entries directly. A "last month at a glance" card shows market spend and meals served.
- **Admin command center**: the dashboard links directly to every module (residents, rooms, beds, meals, menus,
  market, announcements, settings) so the admin can run the whole hostel from one place.
- **Meal management**: per-bed ON/OFF, bulk change for a room / floor / whole hostel behind a confirmation dialog,
  cancellation and activation deadlines, configurable daily reset rule, meal history.
- **Admin dashboard** (12 modules plus statistics and activity log): hostel, floors, rooms, beds, residents, meals,
  menus, ratings, announcements, market, reports, settings. Rooms can be filtered by floor, searched by number
  and are always shown in west → east order. The official numbering is read-only.
- **Resident dashboard**: assigned floor/room/bed, own meal status, menu, meal history, monthly stats, market
  expenses, announcements and own ratings.
- **Reports and analytics**: monthly meal report, configurable billing formula (per meal / per day-meals / fixed + per meal),
  expense analytics, charts, CSV export and PDF export (opens the browser print dialog, choose "Save as PDF").
- **Notifications** bell, **activity log** (action, admin, time, previous and new value — shown in the active language),
  dark and light themes, responsive layouts and loading / empty / error / success states.

## Project structure

```
src/
  app/                 Next.js App Router pages
    page.tsx             Home (3D hostel, ticker, menu, market preview)
    overview/            Hostel overview and statistics
    menu/ market/ announcements/ login/ register/ dashboard/
    admin/               Admin layout + one folder per module
  components/
    ui/                  Shadcn-style primitives (button, dialog, select, tabs, table...)
    shared/              Reusable pieces (stat card, form field, confirm dialog, role guard...)
    layout/              Header, footer, language / theme toggles, notification bell
    hostel/              3D scene, 2D fallback, room/bed panel, geometry constants
    admin/ menu/ market/ announcements/ dashboard/ charts/
  i18n/                Provider, formatters, dictionaries (bn.ts, en.ts)
  store/               hostel-store.tsx (mock state + actions), auth.tsx (mock session)
  mocks/               Seed data (official room numbers, residents, menus, market...)
  lib/                 Pure helpers (meal counts, billing, stats, CSV)
  services/contract.ts Phase 2 API map: every store action -> endpoint
  types/index.ts       Shared TypeScript interfaces for the future backend
docs/hostel-reference.jpeg   Reference photo used for the 3D design
```

## Preparing for Phase 2

- `src/types/index.ts` holds the data shapes the backend must follow.
- `src/services/contract.ts` lists each action exposed by `useHostel()` / `useAuth()` with its intended
  endpoint, method and access level.
- Room numbers come from explicit arrays in `src/mocks/structure.ts` (never generated by a sequence).
  Bed IDs are `<room>-<A|B|C|D>`.

## Known limits of the frontend-only build

- Data lives in memory: **refreshing the page resets mock data**. Only the login session, language, theme and
  3D/2D choice are remembered in `localStorage`.
- Route guards (`/admin`, `/dashboard`) are UI-level only. Real authentication, authorization, password hashing,
  rate limiting and upload validation arrive with the backend.
- Uploaded food and receipt images are previews held in the browser; they are not stored anywhere.
- Mock passwords are demo values. Do not reuse real passwords here.

## Troubleshooting

- **3D view not showing** — the device or browser may have WebGL off or look low-end, so the 2D plan is shown.
  Use "Switch to 3D view" to try it anyway.
- **Port already in use** — run `npm run dev -- -p 3001`.

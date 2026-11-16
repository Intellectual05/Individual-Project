# MediFlow ER — Hospital Emergency Room & Patient Journey Room Booking System

A responsive Vue 3 (Vite + Composition API + `<script setup>`) web application for
booking hospital rooms along patient care pathways, with an automated AI clinical
handoff trail powered by a **Make.com AI Agent webhook**.

## Features

- **Staff sign-in & session gate** — sign in with a hospital email, or use a
  one-click "Quick Staff Demo Login" list fetched live from `hospital_staff`.
  The session persists in `localStorage` (`mediflow_staff`).
- **Hospital staff self-registration** — register as a new staff member from the
  sign-in screen; the profile is validated (email and staff code uniqueness) and
  inserted into `hospital_staff`, then the new member is signed in automatically.
- **Patient Journey Room Booking form** — quick-select journey templates
  (*Urgent Appendectomy*, *Acute Trauma Triage*, *Post-Op ICU Transfer*), full
  clinical fields, and a booking-time picker that defaults to now.
- **Live Room Allocations** — relational listing of `room_bookings` joined with
  `journey_logs` and `hospital_staff`, with stat pills, room-type filter tabs,
  and color-coded urgency badges.
- **Automated AI Journey Trail** — every booking card shows the AI Clinical
  Coordinator handoff log when Make.com's agent has written it, or a pulsing
  "Awaiting Make.com AI Triage sync…" state with a manual **Sync Now** button.
- Automatic background re-fetch at **4s and 8s** after booking so the
  Make.com-generated `journey_logs` record appears without a manual reload.

## Tech Stack

- [Vue 3](https://vuejs.org/) + Vite + TypeScript + Composition API (`<script setup>`)
- [`@supabase/supabase-js`](https://supabase.com/docs/reference/javascript/introduction)
- [`lucide-vue-next`](https://lucide.dev/guide/packages/lucide-vue-next) for medical/UI icons
- Clean modern CSS (no framework) with a medical slate/white palette
- Vitest (unit) + Playwright (e2e) + ESLint/Oxlint

## Project Setup

```sh
npm install
```

### Supabase Environment Variables

Create a `.env` file from the example and fill in your Supabase project
credentials (Project Settings → API):

```sh
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Tests

```sh
npm run test:unit
npm run test:e2e
```

## Database Schema (3 tables)

All queries use these exact table and column names.

### 1. `hospital_staff`

| Column       | Type | Notes                            |
| ------------ | ---- | -------------------------------- |
| `id`         | uuid | primary key                      |
| `staff_code` | text | e.g. `"RN-204"`                  |
| `full_name`  | text | staff display name               |
| `role`       | text | e.g. `"Registered Nurse"`        |
| `department` | text | e.g. `"Emergency"`               |
| `email`      | text | used for sign-in verification    |

### 2. `room_bookings` (primary table)

| Column          | Type        | Notes                                  |
| --------------- | ----------- | -------------------------------------- |
| `id`            | uuid        | primary key                            |
| `created_at`    | timestamptz | server default                         |
| `patient_id`    | text        | e.g. `"HN-2026-4092"`                  |
| `patient_name`  | text        | patient display name                   |
| `care_pathway`  | text        | e.g. `"Acute Trauma Protocol"`         |
| `room_type`     | text        | e.g. `"ER Bay"`, `"ICU"`               |
| `room_number`   | text        | e.g. `"OT-01"`                         |
| `urgency_level` | text        | `"Critical (Immediate)"` / `"Urgent (<30m)"` / `"Standard"` |
| `booked_by`     | text        | e.g. `"Dr. A. (DR-101)"`               |
| `staff_id`      | uuid        | FK → `hospital_staff.id`               |
| `booking_time`  | timestamptz | when the room is needed                |
| `status`        | text        | default `'Confirmed'`                  |

### 3. `journey_logs` (populated asynchronously by Make.com)

| Column                  | Type        | Notes                          |
| ----------------------- | ----------- | ------------------------------ |
| `id`                    | uuid        | primary key                    |
| `created_at`            | timestamptz | server default                 |
| `booking_id`            | uuid        | FK → `room_bookings.id`        |
| `department_notified`   | text        | e.g. `"Radiology"`             |
| `action_taken`          | text        | AI prep / clinical action      |
| `next_recommended_room` | text        | e.g. `"Operating Theatre (OT)"` |

## Architecture — Make.com AI Agent

```
┌───────────────┐   insert room_booking    ┌──────────────┐
│  MediFlow ER  │ ───────────────────────▶ │  Supabase     │
│  (Vue 3 app)  │                          │  (Postgres)   │
└──────┬────────┘                          └──────┬───────┘
       │  fetch bookings (relational query)       │
       │  re-fetch at +4s and +8s                 │
       └──────────────────────────────────────────┘
                                          ▲
                                          │ webhook inserts journey_logs
                                  ┌───────┴───────┐
                                  │  Make.com AI   │
                                  │  Agent scenario│
                                  └───────────────┘
```

1. A staff member signs in and submits a **Room Booking** — the app inserts a row
   into `room_bookings` with `booked_by` and `staff_id` from the signed-in profile.
2. A **Make.com scenario** (watching `room_bookings` inserts) runs an AI Agent to
   generate the clinical handoff and writes a `journey_logs` row linked by
   `booking_id`, then emails the personalized care alert to the booking staff.
3. The app re-fetches the relational query
   `room_bookings → journey_logs → hospital_staff` immediately, then again at
   **4 seconds** and **8 seconds**, so the AI handoff log appears on the booking
   card automatically. The **Sync Now** button re-fetches a single booking on demand.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

This project replaces its workspace TypeScript package with
[typescript-native-bridge](https://github.com/johnsoncodehk/typescript-native-bridge).
After installing dependencies, accept the prompt to use the workspace TypeScript
version, or run **TypeScript: Select TypeScript Version → Use Workspace Version**.


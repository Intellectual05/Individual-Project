# MediFlow ER — Emergency Room & Patient Journey Room Booking System

**Name:** Agamjit Singh (6638261621)
**Course:** Chula International School of Engineering (ISE) — Vue Web Application Integration Assignment  
**Tech Stack:** Vue 3 (Vite + Composition API) | Supabase (PostgreSQL & Database Webhooks) | Make.com (AI Agent & Automated Email Routing)

---

## 1. Project Overview

**MediFlow ER** is a clinical room-allocation and patient-journey coordination web application built for hospital emergency department staff (physicians and nurses). When a patient arrives with an urgent condition—such as an acute appendectomy, trauma triage, or post-operative transfer—hospital staff sign in, allocate the required hospital room (ER Bay, X-Ray / CT Scan, Operating Theatre, ICU, or General Ward), and trigger an automated AI clinical routing workflow.

### Key Capabilities
* **Hospital Staff Authentication & Session Gate:** Staff sign in using their registered hospital email (or quick-select demo profile) verified against Supabase, automatically associating every room booking with the responsible staff member.
* **Patient Journey Room Booking Interface:** Responsive desktop/mobile Vue 3 interface featuring quick-select clinical pathway presets (*Urgent Appendectomy*, *Acute Trauma Triage*, *Post-Op ICU Transfer*) and urgency classification.
* **Relational PostgreSQL Backend (Supabase):** Three interconnected tables (`hospital_staff`, `room_bookings`, and `journey_logs`) enforced with foreign key constraints and Row Level Security (RLS) policies.
* **AI-Powered Clinical Triage & Alerting (Make.com):** Every new room booking triggers a Supabase Database Webhook that invokes a Make.com scenario powered by a **Make AI Agent**, automatically logging downstream department prep instructions into Supabase and dispatching a formatted HTML clinical checklist email to the assigned staff member.

---

## 2. System Architecture

```text
┌─────────────────────────┐       1. Staff Sign-In & Room Booking        ┌──────────────────────────┐
│   Vue 3 Web Application │ ───────────────────────────────────────────► │    Supabase PostgreSQL   │
│  (MediFlow ER Frontend) │ ◄─────────────────────────────────────────── │  - hospital_staff        │
└─────────────────────────┘       5. Live Relational Query + AI Logs     │  - room_bookings         │
                                                                         │  - journey_logs          │
                                                                         └────────────┬─────────────┘
                                                                                      │
                                                                    2. Database Webhook (INSERT)
                                                                                      │
                                                                                      ▼
┌─────────────────────────┐       4b. Personalized HTML Care Alert       ┌──────────────────────────┐
│   Assigned Nurse/Doctor │ ◄─────────────────────────────────────────── │     Make.com Scenario    │
│      (Email Inbox)      │                                              │  - Custom Webhook        │
└─────────────────────────┘       4a. Insert Linked `journey_logs` Row   │  - Supabase Get Staff    │
                                  (Sent back to Supabase via Router)     │  - Make AI Agent + JSON  │
                                                                         └──────────────────────────┘
```

---

## 3. Supabase Database Schema

The database consists of three related tables in the `public` schema:

| Table Name | Role | Key Columns & Relationships |
| :--- | :--- | :--- |
| **`hospital_staff`** | Staff Directory | `id` (UUID, PK), `staff_code`, `full_name`, `role`, `department`, `email` |
| **`room_bookings`** | Primary Table | `id` (UUID, PK), `patient_id`, `patient_name`, `care_pathway`, `room_type`, `room_number`, `urgency_level`, `booked_by`, `staff_id` (FK $\rightarrow$ `hospital_staff.id`), `booking_time`, `status` |
| **`journey_logs`** | Supporting Table | `id` (UUID, PK), `booking_id` (FK $\rightarrow$ `room_bookings.id`), `department_notified`, `action_taken`, `next_recommended_room` |

---

## 4. Make.com Automation Scenario

Whenever a new row is inserted into `room_bookings`, Supabase sends an HTTP `POST` payload to Make.com:

1. **Webhooks — Custom Webhook (Trigger):** Captures the newly created `room_bookings` record (`id`, `patient_name`, `patient_id`, `care_pathway`, `room_type`, `room_number`, `urgency_level`, `staff_id`).
2. **Supabase — Get a Row:** Queries `hospital_staff` using `staff_id` to retrieve the assigned staff member's `full_name`, `role`, and `email`.
3. **Make AI Agent (Clinical Flow Coordinator):** Analyzes the patient's care pathway, room assignment, and urgency level to generate structured JSON containing:
   * `department_notified`
   * `action_taken` (operational preparation summary)
   * `next_recommended_room` (next stage in the patient journey)
   * `nurse_email_subject` & `nurse_attention_points` (tailored clinical precautions)
4. **JSON — Parse JSON:** Extracts the AI Agent's JSON output into structured fields.
5. **Flow Control — Router:**
   * **Branch 1 (Database Audit Log):** Inserts a linked row into Supabase's `journey_logs` table referencing `booking_id`, making the AI triage plan immediately visible on the Vue 3 dashboard.
   * **Branch 2 (Personalized Nurse/Doctor Alert):** Sends a formatted HTML email via Make's Email module to the staff member's email address with patient details, clinical attention points, and the projected next room.

---

## 5. Local Setup & Running Instructions

### Prerequisites
* Node.js (v18+ recommended)
* A Supabase project with the three tables (`hospital_staff`, `room_bookings`, `journey_logs`) and Database Webhook configured
* An active Make.com scenario

### Installation Steps
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment variables:**
   Copy `.env.example` to `.env` and add your Supabase project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. Open the local URL shown in the terminal (e.g., `http://localhost:5173`), sign in with a staff profile, and submit a room booking to observe live database updates and Make.com AI automation.

---

## 6. Submission Package Contents

* `src/` & project configuration files (`package.json`, `vite.config.js`, `.env.example`, `README.md`)
* Screenshots of the working Vue 3 application (Staff Sign-In, Room Booking Form, and Live Allocations List with synced AI Journey Logs)
* Screenshots of Supabase tables (`hospital_staff`, `room_bookings`, `journey_logs`) displaying sample records and foreign key relationships
* Screenshots of the active Make.com scenario execution and resulting HTML clinical alert email

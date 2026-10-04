# DERP — Digital Education Records Platform

DERP is a web application for managing university-scoped education records. It brings together student and faculty account workflows, academic information, attendance, certificates, and fee-related features in one role-oriented platform.

This repository contains the **React frontend**. The Spring Boot API is maintained separately in the [DERP backend repository](https://github.com/ashish2024-28/DERP_Backend_Digital-Education-Records-Platform).

## Why DERP?

Academic details are often spread across separate systems and files. Students need a place to view their records, while faculty and administrators need tools to manage attendance and institution data. DERP explores a single web experience for those tasks, scoped to a university and the user's role.

## Current app areas

- Public home page with university discovery and university registration.
- Domain-specific login and role signup flows.
- Dashboards/routes for students, faculty, sub-admins, fees-admins, and domain-admins.
- Profile and profile-image updates, password/account actions.
- Faculty attendance marking and student/admin attendance views.
- Student certification upload, search, download, and delete screens; shared notepad screens.
- Student and fees-admin fee-account/payment workflows.
- Domain-admin attendance retention, record review, cleanup, and platform-admin university management.

> **Implementation status:** The listed student-fee, fees-admin, platform-admin, attendance-retention, and certification workflows are wired to backend endpoints. Other dashboard areas may still have incomplete parity. Platform-admin university deletion is guarded by a backend-verified OTP, exact domain confirmation, a required reason, and an audit record.

## Technology

- React 19, JavaScript, React Router
- Vite
- Tailwind CSS
- REST calls using `fetch`
- Spring Boot backend with Spring Security, JWT, JPA, and a relational database

## How it works

```text
User's browser
  React pages and role dashboards
       │ fetch requests (JWT for protected requests)
       ▼
Spring Boot REST API
  controllers → services → repositories
       ▼
Relational database
```

After login, the backend returns a JWT and role. The frontend stores those values in browser `localStorage`, uses the token in protected API requests, and navigates to the role dashboard. The backend is responsible for enforcing identity, role permissions, and university-domain checks.

## Run locally

### Requirements

- Node.js and npm
- A running DERP backend and its configured relational database
- An OTP service/base URL for signup and sensitive-account verification flows

### Frontend

From this repository:

```bash
npm ci
npm run dev
```

Create a local `.env.development` file (do not commit it) with:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_API_OTP_URL=http://your-otp-service
```

Use the actual URLs for your local setup. Configure the backend's `DERP_OTP_API_BASE_URL` to the same trusted OTP service base URL for platform-admin deletion challenges; the backend fails closed if this is not configured.

Available checks:

```bash
npm run lint
npm run build
npm run preview
```

The Vite production bundle is written to `dist/`. `vercel.json` rewrites client-side routes to the SPA entry point.

### Backend

See the [backend repository](https://github.com/ashish2024-28/DERP_Backend_Digital-Education-Records-Platform) for Java/Maven setup, database configuration, and API details. Its current compiler/JDK and database driver/dialect settings need to be aligned for a local deployment.

## Main routes

The app uses university-domain URLs. Examples:

- `/` — home page
- `/about`, `/contact` — public information
- `/HomePage/university-register` — university registration
- `/:domain/login`, `/:domain/signup` — account flows
- `/:domain/student/dashboard` — student area
- `/:domain/faculty/dashboard` — faculty area
- `/:domain/subadmin/dashboard` — sub-admin area
- `/:domain/feesadmin/dashboard` — fees-admin area
- `/:domain/feesadmin/dashboard/fees` — fee methods, account summaries, and payment processing
- `/:domain/domainAdmin/dashboard` — domain-admin area
- `/admin/dashboard` — platform-admin university and domain-admin management

See `src/App.jsx` for the full React Router tree. Route casing in the UI and backend API paths is not perfectly uniform; use the code's exact paths.

## Notes for contributors

- Most active features call APIs directly with `fetch`; `src/api/` contains commented placeholder clients, not the shared client used across the app.
- There is no centralized auth provider or universal route guard at present. Backend authorization remains essential.
- No frontend automated test suite was found; `npm run lint` and `npm run build` are the available package checks.
- Treat this as an evolving project. Confirm each screen's backend contract before extending it.

## License

No license has been specified yet. Please contact the project owner before redistribution.

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

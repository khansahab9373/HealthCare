# BloodCare

BloodCare is a full-stack blood test and diagnostic lab appointment management system built with React, Vite, Express, MongoDB, and JWT-based authentication.

## Features

- Patient registration and login
- Public registration creates patient accounts only; staff roles are managed by admins
- Technician verification workflow
- Lab test catalog and appointment booking
- Home collection and lab visit support
- Scheduling and slot validation
- Sample and report management
- Admin dashboard and audit log access
- Responsive healthcare UI
- Stable Test ObjectId technician qualifications
- Dynamic 30-minute slots, blocked periods, and booking conflict protection
- Appointment cancellation, rescheduling, and technician reassignment
- Sample IDs and sample status history
- Technician reports with admin review, correction, approval, and publication
- Secure patient-owned PDF reports
- MongoDB notifications with unread/read-all controls
- Admin test CRUD and activation management
- Authentication rate limiting and role-based authorization

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Axios
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt

## Prerequisites

- Node.js 20 or newer
- MongoDB 7 or newer running locally

## Local setup

1. Install all dependencies from the project root:
   - `npm install`
   - `npm run install:all`
2. Copy environment examples to untracked local files:
   - PowerShell: `Copy-Item client/.env.example client/.env`
   - PowerShell: `Copy-Item server/.env.example server/.env`
3. Set a strong random `JWT_SECRET` in `server/.env`.
4. Start MongoDB locally; the default database URI is `mongodb://127.0.0.1:27017/bloodcare`.
5. Seed the demo database:
   - `npm run seed`
6. Start the complete application from one terminal:
   - `npm run dev`
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:5000`

For separate processes, use `npm run start` for the backend and `npm run dev --prefix client` for Vite.

## Testing and verification

Run the complete automated suite against an isolated test database:

```powershell
$env:MONGO_URI="mongodb://127.0.0.1:27017/bloodcare_test"
$env:JWT_SECRET="integration-test-secret"
npm test
```

Individual checks:

```powershell
npm test --prefix server
npm test --prefix client
npm run lint
npm run build
Get-ChildItem .\server\src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
npm audit --prefix server --omit=dev
```

The backend integration suite covers authentication, RBAC, qualification, availability, generated slots, booking races, cancellation, rescheduling, sample history, report review/publication, PDF ownership, notifications, and audit logs.

## Demo credentials

- Admin: `admin@bloodcare.local` / `Admin@12345`
- Technician: `technician1@bloodcare.local` / `Technician@12345`
- Patient: `patient1@bloodcare.local` / `Patient@12345`

## Project structure

- client/
- server/

## Notes

Real `.env` files are intentionally excluded from source/archive. Keep only `.env.example` files. Verification documents use local development storage under `server/uploads/verification` and are not cloud-backed.

Known limitations: the automated integration suite requires a running local MongoDB service, local document storage is not suitable for multi-instance production deployment, and Vite may emit a non-blocking React plugin esbuild deprecation warning.

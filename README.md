# Mini Job Queue Dashboard

A full-stack job queue dashboard built with React + Vite on the frontend and NestJS + TypeORM + SQLite on the backend.

The application allows users to create jobs, view jobs, filter them by status, update job status according to defined state transitions, and delete jobs.

## Features

- Create a new job
- View all jobs
- Filter jobs by status
- Display counts for each job status
- Update job status
- Delete jobs
- Client-side and server-side validation
- Loading states
- API error handling
- Protected status transitions on the backend
- Backend-side protection against stale concurrent status updates
- SQLite persistence
- Responsive dashboard UI

## Tech Stack

### Frontend

- React
- Vite
- Axios
- JavaScript
- CSS

### Backend

- NestJS
- TypeScript
- TypeORM
- SQLite
- class-validator
- class-transformer

## Project Structure

```text
airth-job-queue/
├── backend/
│   ├── src/
│   │   ├── jobs/
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── job-status.enum.ts
│   │   │   ├── jobs.controller.ts
│   │   │   ├── jobs.module.ts
│   │   │   └── jobs.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md

Job Model

Each job contains:

Field	Type	Description
id	number	Unique job identifier
title	string	Job title
type	string	Job type
status	enum	Current job status
createdAt	Date	Job creation timestamp

Allowed statuses:

pending
running
completed
failed
Status Transitions

The backend enforces the following state machine:

pending
   ├──> running ───> completed
   │       │
   │       └───────> failed
   │
   └──> failed

completed and failed are terminal states.

Invalid transitions are rejected by the backend.

The transition rules are enforced on the server rather than relying only on the frontend, so direct API requests cannot bypass the rules.

API Endpoints

Base URL:

http://localhost:3000
Create Job
POST /jobs

Request:

{
  "title": "Generate monthly report",
  "type": "report"
}

New jobs start with:

status: pending
Get All Jobs
GET /jobs

Returns all jobs ordered by creation time.

Update Job Status
PATCH /jobs/:id/status

Request:

{
  "status": "running"
}

Example:

PATCH /jobs/1/status
Delete Job
DELETE /jobs/:id

Example:

DELETE /jobs/1
Validation and Error Handling

The backend uses NestJS validation with class-validator.

The API validates:

Empty job titles
Empty job types
Maximum title length
Maximum type length
Invalid status values
Invalid status transitions
Non-existent job IDs
Invalid job ID parameters

Invalid operations return appropriate HTTP errors.

Concurrency Handling

A key requirement is handling two clients attempting to update the same pending job at nearly the same time.

The backend uses a conditional database update:

UPDATE jobs
SET status = nextStatus
WHERE id = jobId
AND status = currentStatus

The backend checks whether the update affected exactly one row.

For example, if two requests both observe:

pending

and both attempt:

pending → running

only the request whose conditional update succeeds can change the status.

If another request has already changed the status, the second conditional update affects zero rows and the backend rejects the operation.

This prevents stale concurrent requests from overwriting a newer job state.

Running Locally
Prerequisites
Node.js
npm
Git
Clone the repository
git clone https://github.com/Kundank8789/airth-job-queue.git
cd airth-job-queue
Start the Backend
cd backend
npm install
npm run start:dev

Backend:

http://localhost:3000
Start the Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173
Frontend Environment Variable

Create:

frontend/.env

with:

VITE_API_URL=http://localhost:3000

The .env file is intentionally excluded from Git.

Production Build
Backend
cd backend
npm run build
Frontend
cd frontend
npm run build

Both applications should build without compilation errors.

Testing

Backend tests can be run with:

cd backend
npm test

End-to-end tests:

npm run test:e2e

The API can also be manually tested using Postman, Insomnia, curl, or the frontend dashboard.

Design Decisions
SQLite

SQLite was selected because the assignment allows PostgreSQL or SQLite and the application has a small data model.

It keeps local development simple without requiring a separate database server.

For a larger production deployment, PostgreSQL would be a natural choice.

TypeORM

TypeORM provides database access through entities and repositories and integrates naturally with NestJS.

Backend State Validation

Status-transition rules are implemented in the backend service instead of only in React.

This ensures API clients cannot bypass business rules by directly calling the backend.

Conditional Database Update

The status update uses the previously observed status as a condition in the database update.

This helps prevent stale concurrent requests from overwriting a newer state.

Simple Architecture
React UI
   ↓
Axios API client
   ↓
NestJS Controller
   ↓
NestJS Service
   ↓
TypeORM Repository
   ↓
SQLite

The architecture keeps the application simple while separating UI, API, business logic, and persistence responsibilities.

Assumptions and Tradeoffs
Jobs are created in the pending state.
Jobs can only follow the defined state-transition rules.
completed and failed are terminal states.
Authentication and authorization are outside the scope of this assignment.
SQLite is sufficient for the assignment and local development.
A production deployment with multiple backend instances would use a shared production database such as PostgreSQL.
The application does not implement background workers because the assignment focuses on job management and dashboard functionality rather than actual job execution.
The frontend uses API refreshes rather than WebSockets or Server-Sent Events.
Future Improvements

Possible production improvements include:

PostgreSQL instead of SQLite
Authentication and authorization
Background job workers
Redis-backed queues
Retry policies
Real-time job updates
Pagination for large job lists
Structured logging
Automated CI/CD
Database migrations
Automated integration and concurrency tests
Monitoring and health-check endpoints
Production-Ready Improvement

One production-oriented improvement would be replacing SQLite with PostgreSQL and using explicit database migrations.

SQLite is convenient for this assignment, but PostgreSQL provides a stronger foundation for a deployed multi-instance backend.

Migrations would also make schema changes explicit and reproducible across development, staging, and production environments.

Deployment
Frontend

Live URL:

TODO: Add deployed frontend URL
Backend

Live API URL:

TODO: Add deployed backend URL

After deployment, the frontend environment variable should point to the deployed backend:

VITE_API_URL=<deployed-backend-url>

The backend CORS configuration should allow the deployed frontend origin.

Author

Kundan Rajput

GitHub:
https://github.com/Kundank8789
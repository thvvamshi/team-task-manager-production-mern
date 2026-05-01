# Team Task Manager

A production-ready MERN task management application for teams. Admin users can create projects, manage project members, assign tasks, and track progress. Member users can view work in permitted project scope and update the status of tasks assigned to them.

## Live Submission

- Live URL: https://team-task-manager-production-7391.up.railway.app
- API Docs: https://team-task-manager-production-7391.up.railway.app/api/docs
- Health Check: https://team-task-manager-production-7391.up.railway.app/api/health
- Deployment: Railway project `team-task-manager`, service `team-task-manager`
- Verification: 23/23 live smoke checks passed after deployment
- GitHub Repo: add your repository URL before final submission
- Demo Video: add your 2-5 minute walkthrough link before final submission

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Recharts, Lucide Icons
- Backend: Node.js, Express.js
- Database: MongoDB Atlas with Mongoose
- Authentication: JWT Bearer tokens
- Validation: Zod request schemas
- API Documentation: Swagger UI with `@swagger` JSDoc annotations
- Deployment: Railway with Nixpacks
- Security: Helmet, CORS, rate limiting, Mongo query sanitization, HPP protection, environment validation

## Features

- User signup and login
- First-admin bootstrap using `INITIAL_ADMIN_EMAIL`
- Admin and Member role-based access control
- Project creation and project-level team management
- Task creation, assignment, priority, due date, and status tracking
- Member-only status updates for assigned tasks
- Dashboard with project count, task count, overdue count, progress, status chart, and upcoming tasks
- Clickable dashboard cards for Projects, Tasks, and Overdue task review
- REST API with protected routes and consistent validation errors
- Swagger API documentation at `/api/docs`
- Railway-ready production build where Express serves the React app from `client/dist`
- Vite route and dependency chunk splitting for smaller production bundles

## Project Structure

```text
.
+-- client
|   +-- src
|   |   +-- components
|   |   +-- context
|   |   +-- lib
|   |   +-- pages
|   +-- package.json
|   +-- vite.config.js
+-- server
|   +-- src
|   |   +-- config
|   |   +-- controllers
|   |   +-- middleware
|   |   +-- models
|   |   +-- routes
|   |   +-- utils
|   |   +-- validators
|   +-- package.json
+-- package.json
+-- railway.json
+-- README.md
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Update `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/team-task-manager?retryWrites=true&w=majority
JWT_SECRET=<strong-secret-at-least-32-characters>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
INITIAL_ADMIN_EMAIL=admin@example.com
NODE_ENV=development
```

4. Update `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the app:

```bash
npm run dev
```

Local URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Swagger Docs: http://localhost:5000/api/docs

## Scripts

```bash
npm run dev       # Start client and server in development
npm run build     # Build the React app through the client workspace
npm start         # Start the Express server
npm run lint      # Run frontend lint checks
```

## Railway Deployment

This repository is configured for Railway using `railway.json`.

Railway installs dependencies, runs the root build script, and starts the Express server:

```bash
npm install
npm run build
npm start
```

Required Railway variables:

```env
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<strong-secret-at-least-32-characters>
JWT_EXPIRES_IN=7d
NODE_ENV=production
CLIENT_URL=https://team-task-manager-production-7391.up.railway.app
CORS_ORIGINS=https://team-task-manager-production-7391.up.railway.app
INITIAL_ADMIN_EMAIL=<your-admin-email>
```

In production, Express serves the compiled React app from `client/dist`.

## First Admin Flow

Public signup always creates a `Member` account unless the signup email matches `INITIAL_ADMIN_EMAIL` and no Admin exists yet.

To create the first Admin:

1. Set `INITIAL_ADMIN_EMAIL` in the server or Railway environment.
2. Sign up with that exact email.
3. Save the password you used. The app does not create or reset a default password.

All later public signups become `Member` users.

## API Authentication

Protected endpoints require a JWT token:

```http
Authorization: Bearer <token>
```

Use `POST /api/auth/login` or `POST /api/auth/signup` to receive a token.

## API Endpoints

Base URL:

```text
https://team-task-manager-production-7391.up.railway.app/api
```

Core endpoints:

- `GET /health`
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- `GET /auth/users`
- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `DELETE /projects/:id`
- `POST /projects/:id/members`
- `DELETE /projects/:id/members/:userId`
- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `GET /dashboard`
- `GET /docs`

Swagger UI documents request and response details at `/api/docs`.

## RBAC Summary

| Action | Admin | Project Admin | Member |
| --- | --- | --- | --- |
| Create project | Yes | No | No |
| View accessible projects | Yes | Yes | Yes |
| Add project members | Yes | Yes | No |
| Remove project members | Yes | Yes | No |
| Create task | Yes | Yes | No |
| Update any task details | Yes | Yes | No |
| Update assigned task status | Yes | Yes | Yes |
| Delete task | Yes | Yes | No |
| View dashboard | Yes | Yes | Yes |

## Validation Errors

Invalid request bodies return `400 Bad Request`:

```json
{
  "message": "Validation failed",
  "details": {
    "formErrors": [],
    "fieldErrors": {
      "body": ["Required"]
    }
  }
}
```

Invalid MongoDB object IDs return a validation or invalid-id error.

## Postman Test Flow

1. `GET /health`
2. `POST /auth/signup` with `INITIAL_ADMIN_EMAIL`
3. Save the Admin token as `adminToken`
4. `POST /auth/signup` for a Member account
5. Save the Member token as `memberToken` and Member ID as `memberId`
6. `POST /projects` as Admin
7. Save Project ID as `projectId`
8. `POST /projects/:id/members` to add Member
9. `POST /tasks` to assign a task
10. `PATCH /tasks/:id` as Member with status only
11. `GET /dashboard`
12. Open `/api/docs` and verify Swagger UI

## Production Checklist

- Use MongoDB Atlas, not a local MongoDB instance.
- Keep `.env` files out of Git.
- Rotate credentials before final submission if they were shared during development.
- Set a 32+ character `JWT_SECRET` in Railway.
- Set `NODE_ENV=production` in Railway.
- Set `CLIENT_URL` and `CORS_ORIGINS` to the Railway domain.
- Confirm the first Admin using `INITIAL_ADMIN_EMAIL`.
- Open `/api/docs` after deployment and test protected routes with a Bearer token.

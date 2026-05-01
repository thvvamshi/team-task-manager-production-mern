# Team Task Manager

A production-ready MERN task management application for teams. Admin users can create projects, manage project members, assign tasks, and track progress. Member users can view assigned work and update task status within their permitted project scope.

## Live Submission

- Live URL: add your Railway URL here
- GitHub Repo: add your repository URL here
- Demo Video: add your 2-5 minute walkthrough link here
- API Docs: `/api/docs`

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Recharts, Lucide Icons
- Backend: Node.js, Express.js
- Database: MongoDB Atlas with Mongoose
- Authentication: JWT Bearer tokens
- Validation: Zod request schemas
- API Documentation: Swagger UI with `@swagger` JSDoc annotations
- Deployment: Railway
- Security: Helmet, CORS allowlist, rate limiting, Mongo query sanitization, HPP protection, environment validation

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
- Railway-ready production build where Express serves the React app

## Project Structure

```text
.
+-- client
�   +-- src
�   �   +-- components
�   �   +-- context
�   �   +-- lib
�   �   +-- pages
�   +-- package.json
+-- server
�   +-- src
�   �   +-- config
�   �   +-- controllers
�   �   +-- middleware
�   �   +-- models
�   �   +-- routes
�   �   +-- utils
�   �   +-- validators
�   +-- package.json
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

5. Start the application:

```bash
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Swagger Docs: `http://localhost:5000/api/docs`

## MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user with read/write access.
3. Add your IP address in Network Access.
4. For Railway deployment, allow Railway to connect. For assignment/demo use, `0.0.0.0/0` is acceptable; for real production, restrict the network rule.
5. Copy the Atlas URI and include a database name:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/team-task-manager?retryWrites=true&w=majority
```

If the database password contains special characters like `@`, `#`, `/`, or `:`, URL-encode the password before placing it in the URI.

## First Admin Flow

Public signup always creates a `Member` account. To safely create the first Admin account, set:

```env
INITIAL_ADMIN_EMAIL=admin@example.com
```

Then sign up with that exact email. The API grants `Admin` only if no Admin exists yet. All later public signups become `Member` users.

## Railway Deployment

1. Push the repository to GitHub.
2. Create a Railway project from the GitHub repository.
3. Add the production environment variables:

```env
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<strong-secret-at-least-32-characters>
JWT_EXPIRES_IN=7d
NODE_ENV=production
CLIENT_URL=<your-railway-app-url>
CORS_ORIGINS=<your-railway-app-url>
INITIAL_ADMIN_EMAIL=<your-admin-email>
```

4. Railway will install, build, and start the app with:

```bash
npm install
npm run build
npm start
```

In production, Express serves the compiled React app from `client/dist`.

## API Documentation

Swagger UI is available at:

```text
http://localhost:5000/api/docs
```

In production:

```text
<your-railway-url>/api/docs
```

The route files use `@swagger` JSDoc annotations and are loaded by `swagger-jsdoc`.

## Authentication

Protected endpoints require a JWT token:

```http
Authorization: Bearer <token>
```

Use `POST /api/auth/login` or `POST /api/auth/signup` to receive a token.

## API Endpoints With Sample Output

The examples below use:

```text
BASE_URL=http://localhost:5000/api
```

### Health Check

`GET /health`

Response `200 OK`:

```json
{
  "ok": true,
  "service": "team-task-manager-api"
}
```

### Signup

`POST /auth/signup`

Request:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

Response `201 Created`:

```json
{
  "user": {
    "_id": "66f000000000000000000001",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "Admin",
    "createdAt": "2026-05-02T10:00:00.000Z",
    "updatedAt": "2026-05-02T10:00:00.000Z"
  },
  "token": "<jwt-token>"
}
```

Notes:

- If `email` matches `INITIAL_ADMIN_EMAIL` and no Admin exists, role is `Admin`.
- Otherwise role is `Member`.

### Login

`POST /auth/login`

Request:

```json
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

Response `200 OK`:

```json
{
  "user": {
    "_id": "66f000000000000000000001",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "Admin"
  },
  "token": "<jwt-token>"
}
```

Invalid credentials response `401 Unauthorized`:

```json
{
  "message": "Invalid email or password"
}
```

### Current User

`GET /auth/me`

Headers:

```http
Authorization: Bearer <token>
```

Response `200 OK`:

```json
{
  "user": {
    "_id": "66f000000000000000000001",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "Admin"
  }
}
```

Missing token response `401 Unauthorized`:

```json
{
  "message": "Authentication required"
}
```

### List Users

`GET /auth/users`

Required role: `Admin`

Response `200 OK`:

```json
{
  "users": [
    {
      "_id": "66f000000000000000000001",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "Admin"
    },
    {
      "_id": "66f000000000000000000002",
      "name": "Member User",
      "email": "member@example.com",
      "role": "Member"
    }
  ]
}
```

### Create Project

`POST /projects`

Required role: `Admin`

Request:

```json
{
  "name": "Website Launch",
  "description": "Plan launch tasks across engineering and marketing."
}
```

Response `201 Created`:

```json
{
  "project": {
    "_id": "66f000000000000000000010",
    "name": "Website Launch",
    "description": "Plan launch tasks across engineering and marketing.",
    "status": "Active",
    "owner": {
      "_id": "66f000000000000000000001",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "Admin"
    },
    "members": [
      {
        "user": {
          "_id": "66f000000000000000000001",
          "name": "Admin User",
          "email": "admin@example.com",
          "role": "Admin"
        },
        "role": "Admin"
      }
    ]
  }
}
```

Member attempting this endpoint receives `403 Forbidden`:

```json
{
  "message": "You do not have permission to perform this action"
}
```

### List Projects

`GET /projects`

Response `200 OK`:

```json
{
  "projects": [
    {
      "_id": "66f000000000000000000010",
      "name": "Website Launch",
      "description": "Plan launch tasks across engineering and marketing.",
      "status": "Active",
      "members": []
    }
  ]
}
```

Admins see all projects. Members see projects where they are part of the `members` list.

### Add Or Update Project Member

`POST /projects/:id/members`

Required role: global `Admin` or project `Admin`

Request:

```json
{
  "userId": "66f000000000000000000002",
  "role": "Member"
}
```

Response `200 OK`:

```json
{
  "project": {
    "_id": "66f000000000000000000010",
    "name": "Website Launch",
    "members": [
      {
        "user": {
          "_id": "66f000000000000000000001",
          "name": "Admin User",
          "email": "admin@example.com"
        },
        "role": "Admin"
      },
      {
        "user": {
          "_id": "66f000000000000000000002",
          "name": "Member User",
          "email": "member@example.com"
        },
        "role": "Member"
      }
    ]
  }
}
```

### Remove Project Member

`DELETE /projects/:id/members/:userId`

Response `200 OK`:

```json
{
  "project": {
    "_id": "66f000000000000000000010",
    "name": "Website Launch",
    "members": []
  }
}
```

Trying to remove the project owner returns `400 Bad Request`:

```json
{
  "message": "Project owner cannot be removed"
}
```

### Create Task

`POST /tasks`

Required role: global `Admin` or project `Admin`

Request:

```json
{
  "title": "Build API test plan",
  "description": "Cover auth, projects, tasks, dashboard, and RBAC.",
  "project": "66f000000000000000000010",
  "assignedTo": "66f000000000000000000002",
  "status": "Todo",
  "priority": "High",
  "dueDate": "2026-05-10T10:00:00.000Z"
}
```

Response `201 Created`:

```json
{
  "task": {
    "_id": "66f000000000000000000020",
    "title": "Build API test plan",
    "description": "Cover auth, projects, tasks, dashboard, and RBAC.",
    "status": "Todo",
    "priority": "High",
    "dueDate": "2026-05-10T10:00:00.000Z",
    "project": {
      "_id": "66f000000000000000000010",
      "name": "Website Launch"
    },
    "assignedTo": {
      "_id": "66f000000000000000000002",
      "name": "Member User",
      "email": "member@example.com"
    }
  }
}
```

If the assignee is not a project member, the response is `400 Bad Request`:

```json
{
  "message": "Assigned user must be a member of the project"
}
```

### List Tasks

`GET /tasks`

Optional query filters:

```text
/tasks?project=<projectId>
/tasks?status=Todo
/tasks?assignedTo=<userId>
```

Response `200 OK`:

```json
{
  "tasks": [
    {
      "_id": "66f000000000000000000020",
      "title": "Build API test plan",
      "status": "Todo",
      "priority": "High",
      "project": {
        "_id": "66f000000000000000000010",
        "name": "Website Launch"
      },
      "assignedTo": {
        "_id": "66f000000000000000000002",
        "name": "Member User"
      }
    }
  ]
}
```

### Update Task

`PATCH /tasks/:id`

Admins/project admins can update task details. Assigned Members can update only `status`.

Member status update request:

```json
{
  "status": "In Progress"
}
```

Response `200 OK`:

```json
{
  "task": {
    "_id": "66f000000000000000000020",
    "title": "Build API test plan",
    "status": "In Progress"
  }
}
```

Member attempting to edit title receives `403 Forbidden`:

```json
{
  "message": "Members can only update status for their own tasks"
}
```

### Delete Task

`DELETE /tasks/:id`

Required role: global `Admin` or project `Admin`

Response:

```text
204 No Content
```

### Dashboard

`GET /dashboard`

Response `200 OK`:

```json
{
  "summary": {
    "totalProjects": 1,
    "totalTasks": 4,
    "overdueTasks": 1,
    "progress": 25
  },
  "statusCounts": [
    {
      "_id": "Todo",
      "count": 2
    },
    {
      "_id": "In Progress",
      "count": 1
    },
    {
      "_id": "Done",
      "count": 1
    }
  ],
  "priorityCounts": [
    {
      "_id": "High",
      "count": 2
    }
  ],
  "upcomingTasks": []
}
```

## Validation Error Format

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

Invalid MongoDB object IDs return:

```json
{
  "message": "Validation failed"
}
```

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

## Postman Test Flow

Recommended order:

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
12. Open `/api/docs` and verify the Swagger UI

## Useful Scripts

```bash
npm run dev       # Start client and server in development
npm run build     # Build React app for production
npm start         # Start Express server
npm run lint      # Run frontend lint
```

## Production Checklist

- Use MongoDB Atlas, not a local MongoDB instance.
- Rotate credentials before deployment if they were shared during development.
- Set a 32+ character `JWT_SECRET` in Railway.
- Set `NODE_ENV=production` in Railway.
- Set `CLIENT_URL` and `CORS_ORIGINS` to the Railway domain.
- Confirm the first Admin using `INITIAL_ADMIN_EMAIL`.
- Open `/api/docs` after deployment and test all protected routes with a Bearer token.

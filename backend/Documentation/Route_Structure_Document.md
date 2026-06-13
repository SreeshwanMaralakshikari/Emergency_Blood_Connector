# Emergency Blood Connector - Route Structure Document

# Base URL

```text
http://localhost:5000
```

---

# Authentication Routes

Base Route:

```text
/auth
```

| Method | Route       | Access             | Description                 |
| ------ | ----------- | ------------------ | --------------------------- |
| POST   | /register   | Public             | Register Donor or Requester |
| POST   | /login      | Public             | Login User                  |
| GET    | /check-auth | Authenticated User | Verify User Session         |
| GET    | /logout     | Authenticated User | Logout User                 |
| GET    | /           | Public             | API Health Check            |

---

# Request Management Routes

Base Route:

```text
/request-api
```

## Request Creation

| Method | Route           | Access           | Description          |
| ------ | --------------- | ---------------- | -------------------- |
| POST   | /create-request | REQUESTER, ADMIN | Create Blood Request |

---

## Request Viewing

| Method | Route                   | Access             | Description              |
| ------ | ----------------------- | ------------------ | ------------------------ |
| GET    | /open-requests          | Public             | View Open Blood Requests |
| GET    | /my-requests            | REQUESTER, ADMIN   | View Own Requests        |
| GET    | /request/:requestNumber | Authenticated User | View Request Details     |

---

## Request Management

| Method | Route           | Access           | Description         |
| ------ | --------------- | ---------------- | ------------------- |
| PUT    | /edit-request   | REQUESTER, ADMIN | Edit Open Request   |
| PATCH  | /close-request  | REQUESTER, ADMIN | Close Request       |
| PATCH  | /delete-request | REQUESTER, ADMIN | Soft Delete Request |

---

## Request Dashboard

| Method | Route      | Access           | Description         |
| ------ | ---------- | ---------------- | ------------------- |
| GET    | /dashboard | REQUESTER, ADMIN | Requester Dashboard |

---

# Donor Routes

Base Route:

```text
/donor-api
```

## Donation Actions

| Method | Route              | Access | Description          |
| ------ | ------------------ | ------ | -------------------- |
| PATCH  | /accept-request    | DONOR  | Accept Blood Request |
| PUT    | /complete-donation | DONOR  | Complete Donation    |

---

## Donation Information

| Method | Route             | Access | Description           |
| ------ | ----------------- | ------ | --------------------- |
| GET    | /donation-history | DONOR  | View Donation History |
| GET    | /dashboard        | DONOR  | Donor Dashboard       |

---

## Rewards & Ranking

| Method | Route         | Access | Description        |
| ------ | ------------- | ------ | ------------------ |
| GET    | /badges       | DONOR  | View Badges        |
| GET    | /leaderboard  | Public | View Leaderboard   |
| GET    | /my-rank      | DONOR  | View Personal Rank |
| GET    | /top-donors   | Public | View Top Donors    |
| GET    | /achievements | DONOR  | View Achievements  |

---

# Notification Routes

Base Route:

```text
/notification-api
```

| Method | Route             | Access             | Description                |
| ------ | ----------------- | ------------------ | -------------------------- |
| GET    | /my-notifications | Authenticated User | View Notifications         |
| GET    | /unread-count     | Authenticated User | Count Unread Notifications |
| PUT    | /mark-read/:id    | Authenticated User | Mark Notification Read     |
| GET    | /                 | Public             | API Health Check           |

---

# Admin Routes

Base Route:

```text
/admin-api
```

---

# User Management

| Method | Route         | Access | Description                |
| ------ | ------------- | ------ | -------------------------- |
| GET    | /users        | ADMIN  | View All Users             |
| GET    | /donors       | ADMIN  | View All Donors            |
| GET    | /requesters   | ADMIN  | View All Requesters        |
| POST   | /user-details | ADMIN  | View Specific User         |
| PATCH  | /user-status  | ADMIN  | Activate / Deactivate User |

---

# Request Management

| Method | Route                | Access | Description             |
| ------ | -------------------- | ------ | ----------------------- |
| GET    | /requests            | ADMIN  | View All Requests       |
| GET    | /open-requests       | ADMIN  | View Open Requests      |
| GET    | /fulfilled-requests  | ADMIN  | View Fulfilled Requests |
| GET    | /deleted-requests    | ADMIN  | View Deleted Requests   |
| POST   | /request-details     | ADMIN  | View Request Details    |
| PATCH  | /force-close-request | ADMIN  | Force Close Request     |

---

# Dashboard & Analytics

| Method | Route       | Access | Description     |
| ------ | ----------- | ------ | --------------- |
| GET    | /dashboard  | ADMIN  | Admin Dashboard |
| GET    | /statistics | ADMIN  | Admin Analytics |

---

# Route Count Summary

## Authentication

```text
5 Routes
```

---

## Request Module

```text
7 Routes
```

---

## Donor Module

```text
7 Routes
```

---

## Notification Module

```text
4 Routes
```

---

## Admin Module

```text
13 Routes
```

---

# Total API Routes

```text
36 Routes
```

---

# Route Design Standards

## Uses Request Numbers

```text
REQ-2026-00011
REQ-2026-00012
```

instead of MongoDB IDs wherever possible.

---

## Uses Soft Delete

Deleted requests are not removed from database.

```text
status = "DELETED"
```

---

## Authentication Method

```text
JWT Token
+
HTTP Only Cookies
```

---

## Authorization Method

```text
Role Based Access Control (RBAC)
```

Supported Roles:

```text
DONOR
REQUESTER
ADMIN
```

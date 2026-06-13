# Emergency Blood Connector - Day Wise Progress

# Day 1 - Project Planning & Database Design

## Completed

- Project Requirements Analysis
- User Roles Identification
- Database Design
- Collection Planning
- API Structure Planning
- Folder Structure Planning

### User Roles

```text
DONOR
REQUESTER
ADMIN
```

---

# Day 2 - Authentication Module

## Completed

- User Registration
- User Login
- JWT Token Generation
- Cookie Authentication
- Logout Functionality
- Check Authentication Route
- Password Hashing using bcryptjs

### APIs

```text
POST /auth/register
POST /auth/login
GET /auth/check-auth
GET /auth/logout
```

---

# Day 3 - Blood Request Module

## Completed

- Create Blood Request
- Request Number Generation
- Priority Score Calculation
- Expiry Date Calculation
- Open Requests Route
- My Requests Route

### APIs

```text
POST /request-api/create-request
GET /request-api/open-requests
GET /request-api/my-requests
```

---

# Day 4 - Donor Request Acceptance

## Completed

- Accept Blood Request
- Accepted Donors Tracking
- Duplicate Acceptance Prevention
- Role Protection

### APIs

```text
PATCH /donor-api/accept-request
```

---

# Day 5 - Donation Completion System

## Completed

- Complete Donation
- Donation History
- Cooldown System
- Next Eligible Donation Date
- Availability Update
- Request Fulfillment Logic

### APIs

```text
PUT /donor-api/complete-donation
GET /donor-api/donation-history
```

---

# Day 6 - Rewards System

## Completed

- Point Calculation
- Donor Levels
- Badge System
- Achievement Tracking
- Leaderboard

### Features

```text
Points
Levels
Badges
Achievements
Top Donors
Ranking
```

---

# Day 7 - Notification Module

## Completed

- Notification Model
- Notification Creation Utility
- Donation Notifications
- Badge Notifications
- Request Notifications
- Notification Read Status

### APIs

```text
GET /notification-api/my-notifications
GET /notification-api/unread-count
PUT /notification-api/mark-read/:id
```

---

# Day 8 - Request Management Module

## Completed

- Request Details
- Edit Request
- Close Request
- Soft Delete Request

### APIs

```text
GET /request-api/request/:requestNumber

PUT /request-api/edit-request

PATCH /request-api/close-request

PATCH /request-api/delete-request
```

---

# Day 9 - Requester Dashboard

## Completed

- Total Requests
- Open Requests Count
- Fulfilled Requests Count
- Total Units Required
- Total Units Fulfilled

### APIs

```text
GET /request-api/dashboard
```

---

# Day 10 - Donor Dashboard

## Completed

- Donation Statistics
- Points Tracking
- Achievement Tracking
- Rank Tracking

### APIs

```text
GET /donor-api/dashboard
GET /donor-api/my-rank
GET /donor-api/achievements
```

---

# Day 11 - Admin Module

## Completed

### User Management

- View Users
- View Donors
- View Requesters
- View User Details

### APIs

```text
GET /admin-api/users
GET /admin-api/donors
GET /admin-api/requesters
POST /admin-api/user-details
```

---

# Day 12 - Admin Controls

## Completed

### User Control

- Activate User
- Deactivate User

### Request Control

- View Requests
- View Open Requests
- View Fulfilled Requests
- View Deleted Requests
- Request Details
- Force Close Request

### APIs

```text
PATCH /admin-api/user-status

GET /admin-api/requests
GET /admin-api/open-requests
GET /admin-api/fulfilled-requests
GET /admin-api/deleted-requests

POST /admin-api/request-details

PATCH /admin-api/force-close-request
```

---

# Day 13 - Analytics & Statistics

## Completed

### Admin Dashboard

- Total Users
- Total Donors
- Total Requesters
- Available Donors
- Unavailable Donors
- Total Requests
- Open Requests
- Fulfilled Requests
- Closed Requests
- Deleted Requests
- Total Donations

### Statistics

- Blood Group Distribution
- State Distribution
- Alert Level Distribution
- Request Status Distribution

### APIs

```text
GET /admin-api/dashboard
GET /admin-api/statistics
```

---

# Day 14 - Testing & Validation

## Completed

- Authentication Testing
- Request Testing
- Donation Testing
- Notification Testing
- Dashboard Testing
- Admin Testing
- Statistics Testing
- Authorization Testing

### Result

```text
Backend Successfully Completed
```

---

# Current Project Status

## Backend

```text
Completed
```

## Frontend

```text
Pending
```

## Documentation

```text
In Progress
```
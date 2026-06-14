# Emergency Blood Connector

A full-stack emergency blood donation platform that connects blood donors with patients in critical need. Users can register as donors or requesters, post and accept blood requests, earn points and badges for saving lives, and track their contributions through a gamified donor progression system.

The project is built using the MERN Stack and follows a modular backend architecture with JWT authentication, role-based access control, blood group compatibility matching, real-time notifications, and separate dashboards for donors, requesters, and admins.

Backend Deployment Link: https://emergency-blood-connector-kbw2.onrender.com

Frontend Deployment Link: https://emergency-blood-connector-lilac.vercel.app

---

# Features

# Authentication and Authorization
- User Registration as Donor or Requester
- User Login and Logout
- JWT Token Authentication using localStorage
- Role-Based Access Control (DONOR, REQUESTER, ADMIN)
- Protected Routes with role verification
- Unauthorized Access Handling
- Password Encryption using bcryptjs
- Automatic Session Restore on Page Refresh
- Login History Tracking (last 50 logins)

---

# Donor Features
- Browse all open blood requests
- Filter requests by blood group, alert level, and search text
- Accept blood requests based on blood group and state compatibility
- Mark donations as complete after donating at hospital
- 90-day donation cooldown enforced automatically
- View personal donation history with points earned per donation
- Track donor level progression (Iron → Bronze → Silver → Gold → Platinum → Diamond)
- Earn badges based on donation count and total points milestones
- View achievements page with level progress bar and milestone tracking
- Appear on the public leaderboard ranked by total points
- View personal rank among all donors
- Receive notifications for request accepted and badge earned events

---

# Requester Features
- Create blood requests with patient details, hospital info, and urgency level
- Four alert levels: GREEN (routine), YELLOW (moderate), RED (critical), BLACK (catastrophic)
- Edit open requests
- Close requests manually
- Soft delete requests
- View all own requests with status filter tabs
- Dashboard showing total requests, open count, fulfilled count, and units progress
- Receive notifications when donors accept their requests

---

# Admin Features
- View platform-wide dashboard with user and request statistics
- Manage all users across all roles
- Activate and deactivate user accounts
- Browse all blood requests by status
- Force close any open request
- View statistics with blood group distribution, alert level breakdown, request status breakdown, and state-wise user distribution

---

# Blood Request Features
- Auto-generated unique request numbers in format REQ-YYYY-NNNNN
- Priority scoring system that sorts requests by urgency and units needed
- Units fulfilled tracking with progress bar
- Request expiry based on alert level
- Accepted donors list with acceptance timestamps
- Completed donors list
- Soft delete — requests are never permanently removed

---

# Donor Progression System
- Points awarded per donation based on alert level of the request
- GREEN = 1 point, YELLOW = 5 points, RED = 25 points, BLACK = 100 points
- Six donor levels with point thresholds: Iron (0), Bronze (11), Silver (26), Gold (51), Platinum (101), Diamond (1000)
- Eight badges earned through donation count and points milestones
- Leaderboard showing all donors ranked by total points with medal icons for top 3

---

# Notification Features
- Notifications created automatically for key events
- Event types: Request Created, Request Accepted, Donation Completed, Badge Earned, General
- Unread count shown as a live badge on the navbar bell icon
- Mark individual notifications as read
- Mark all as read in one action
- Filter notifications by All, Unread, and Read

---

# Blood Compatibility Features
- Full ABO and Rh blood group compatibility enforced on accept-request
- Donors can only accept requests where their blood group is compatible with the patient's
- Donors can only accept requests in their registered state
- Matched requests page shows only compatible open requests for each donor

---

# Backend Functionalities
- REST API Architecture with 5 routers and 36 endpoints
- Express 5 Middleware Integration
- MongoDB Database with Mongoose 9
- Mongoose Schema Validation with strict throw mode
- Global Error Handling Middleware
- Validation Error, Cast Error, and Duplicate Key Error handling
- Async Route Handling with next(err) pattern
- Environment Variable Configuration
- Modular utility functions for all business logic
- Index-optimised queries for donor search and request priority sorting

---

# Frontend Functionalities
- React 19 Component Architecture
- Redux Toolkit State Management with two slices
- Form Handling with React Hook Form across all forms
- API Integration using Axios with Authorization header interceptor
- Toast Notifications for all user actions
- Client-side Routing with React Router 7
- Protected Navigation with role and auth checks
- Dynamic Dashboard Rendering per role
- Conditional UI Rendering based on role and ownership
- Centralised Design Token System in common.js
- Client-side filtering with search, blood group, alert level, and status tabs
- Reusable RequestCard component used across multiple pages

---

# Tech Stack

## Frontend
- React 19
- Vite 8
- React Router 7
- Redux Toolkit 2
- React Redux 9
- Axios
- React Hook Form
- React Hot Toast
- Tailwind CSS 4

## Backend
- Node.js
- Express 5
- MongoDB
- Mongoose 9
- JWT (jsonwebtoken)
- bcryptjs
- dotenv
- cors
- cookie-parser
- nodemon (dev only)

---

# Project Structure

```
Emergency_Blood_Connector/
│
├── backend/
│   │
│   ├── APIs/
│   │   ├── CommonAPI.js
│   │   ├── RequestAPI.js
│   │   ├── DonorAPI.js
│   │   ├── NotificationAPI.js
│   │   └── AdminAPI.js
│   │
│   ├── middlewares/
│   │   └── verifyToken.js
│   │
│   ├── models/
│   │   ├── UserModel.js
│   │   ├── BloodRequestModel.js
│   │   ├── DonationModel.js
│   │   └── NotificationModel.js
│   │
│   ├── utils/
│   │   ├── bloodCompatibility.js
│   │   ├── calculatePoints.js
│   │   ├── calculateLevel.js
│   │   ├── calculateBadges.js
│   │   ├── calculatePriorityScore.js
│   │   ├── donationCooldown.js
│   │   ├── requestExpiry.js
│   │   ├── generateRequestNumber.js
│   │   └── createNotification.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    │
    ├── src/
    │   ├── api/
    │   │   └── axiosInstance.js
    │   │
    │   ├── store/
    │   │   ├── store.js
    │   │   ├── authSlice.js
    │   │   └── notifSlice.js
    │   │
    │   ├── styles/
    │   │   └── common.js
    │   │
    │   ├── utils/
    │   │   └── formatDate.js
    │   │
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── RequestCard.jsx
    │   │
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx
    │   │   │   └── Register.jsx
    │   │   │
    │   │   ├── public/
    │   │   │   ├── Home.jsx
    │   │   │   ├── OpenRequests.jsx
    │   │   │   ├── RequestDetail.jsx
    │   │   │   ├── Notifications.jsx
    │   │   │   └── Unauthorized.jsx
    │   │   │
    │   │   ├── donor/
    │   │   │   ├── DonorDashboard.jsx
    │   │   │   ├── DonationHistory.jsx
    │   │   │   ├── Leaderboard.jsx
    │   │   │   ├── Badges.jsx
    │   │   │   └── Achievements.jsx
    │   │   │
    │   │   ├── requester/
    │   │   │   ├── RequesterDashboard.jsx
    │   │   │   ├── CreateRequest.jsx
    │   │   │   ├── MyRequests.jsx
    │   │   │   └── EditRequest.jsx
    │   │   │
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminUsers.jsx
    │   │       ├── AdminRequests.jsx
    │   │       └── AdminStatistics.jsx
    │   │
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    │
    ├── public/
    ├── vite.config.js
    ├── vercel.json
    ├── package.json
    └── .env
```

---

# Database Schemas

## User Schema

```js
{
    firstName,
    lastName,
    email,               // unique, lowercase
    password,            // bcrypt hashed
    phoneNumber,         // unique
    bloodGroup,          // O+, O-, A+, A-, B+, B-, AB+, AB-
    state,               // Indian state — used for request matching
    role,                // DONOR / REQUESTER / ADMIN
    isAvailable,         // false during 90-day donation cooldown
    donationsCount,
    totalPoints,
    donorLevel,          // Iron / Bronze / Silver / Gold / Platinum / Diamond
    badges,              // array of earned badge name strings
    lastDonationDate,
    nextEligibleDonationDate,
    isUserActive,        // admin can deactivate accounts
    loginHistory,        // last 50 login timestamps
    lastLogin,
    availabilityUpdatedAt
}
```

---

## BloodRequest Schema

```js
{
    requestNumber,       // auto-generated REQ-YYYY-NNNNN
    patientName,
    patientAge,          // 0–120
    patientGender,       // MALE / FEMALE / OTHER
    bloodGroup,
    unitsRequired,       // 1–20
    unitsFulfilled,      // increments per completed donation
    hospitalName,
    hospitalAddress,
    state,               // must match donor state for eligibility
    contactPerson,
    contactNumber,
    requestCreatedBy,    // ref to user
    alertLevel,          // GREEN / YELLOW / RED / BLACK
    status,              // OPEN / FULFILLED / CLOSED / EXPIRED / DELETED
    priorityScore,       // alert score + unitsRequired
    acceptedDonors,      // [{ donorId, acceptedAt }]
    completedDonors,     // [ObjectId refs]
    requiredByDate,
    expiresAt,           // auto-calculated from alert level
    isHospitalVerified
}
```

---

## Donation Schema

```js
{
    donorId,                     // ref to user
    bloodRequestId,              // ref to bloodrequest
    requestNumber,
    alertLevel,
    pointsAwarded,
    unitsDonated,
    donationDate,
    nextEligibleDonationDate,    // 90 days after donationDate
    status,                      // PENDING / CONFIRMED / REJECTED
    isVerified
}
```

---

## Notification Schema

```js
{
    userId,      // ref to user
    title,
    message,
    type,        // REQUEST_CREATED / REQUEST_ACCEPTED / DONATION_COMPLETED / BADGE_EARNED / GENERAL
    isRead       // default false
}
```

---

# Authentication Flow

```
Register User
      ↓
Login User
      ↓
Generate JWT Token (expires in 7 days)
      ↓
Store Token in localStorage
      ↓
Attach Token to every request via Authorization header
      ↓
Verify Token using verifyToken Middleware
      ↓
Check Role against Allowed Roles
      ↓
Allow Access to Protected Route
```

---

# API Endpoints

# Auth Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register a new DONOR or REQUESTER |
| POST | `/auth/login` | Public | Login and receive JWT token |
| GET | `/auth/check-auth` | Any role | Verify token and return current user |
| GET | `/auth/logout` | Public | Client removes token from localStorage |

---

# Request Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/request-api/create-request` | REQUESTER, ADMIN | Create a blood request |
| GET | `/request-api/open-requests` | Public | All OPEN requests sorted by priority |
| GET | `/request-api/my-requests` | REQUESTER, ADMIN | Requests created by logged-in user |
| GET | `/request-api/request/:requestNumber` | DONOR, REQUESTER, ADMIN | Full request details |
| PUT | `/request-api/edit-request` | REQUESTER, ADMIN | Edit an OPEN request |
| PATCH | `/request-api/close-request` | REQUESTER, ADMIN | Close a request |
| PATCH | `/request-api/delete-request` | REQUESTER, ADMIN | Soft delete a request |
| GET | `/request-api/dashboard` | REQUESTER, ADMIN | Requester dashboard statistics |

---

# Donor Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/donor-api/dashboard` | DONOR | Stats, eligibility, matched request count |
| GET | `/donor-api/my-matched-requests` | DONOR | Compatible open requests for this donor |
| GET | `/donor-api/my-accepted-requests` | DONOR | Requests the donor has accepted |
| GET | `/donor-api/donation-history` | DONOR | All completed donations |
| GET | `/donor-api/badges` | DONOR | Earned badges |
| GET | `/donor-api/achievements` | DONOR | Milestones and level progress |
| GET | `/donor-api/leaderboard` | Public | All donors ranked by points |
| GET | `/donor-api/top-donors` | Public | Top 3 donors |
| GET | `/donor-api/my-rank` | DONOR | Current donor's rank on the leaderboard |
| PUT | `/donor-api/accept-request` | DONOR | Accept an open blood request |
| PUT | `/donor-api/complete-donation` | DONOR | Mark donation complete and award points |

---

# Notification Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/notification-api/my-notifications` | Any role | All notifications for current user |
| GET | `/notification-api/unread-count` | Any role | Count of unread notifications |
| PUT | `/notification-api/mark-read/:id` | Any role | Mark a notification as read |

---

# Admin Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/admin-api/dashboard` | ADMIN | Platform-wide statistics |
| GET | `/admin-api/statistics` | ADMIN | Blood group, state, alert level distributions |
| GET | `/admin-api/users` | ADMIN | All registered users |
| GET | `/admin-api/donors` | ADMIN | All donors |
| GET | `/admin-api/requesters` | ADMIN | All requesters |
| POST | `/admin-api/user-details` | ADMIN | Single user details by ID |
| PATCH | `/admin-api/user-status` | ADMIN | Activate or deactivate a user account |
| GET | `/admin-api/requests` | ADMIN | All blood requests |
| GET | `/admin-api/open-requests` | ADMIN | All open requests |
| GET | `/admin-api/fulfilled-requests` | ADMIN | All fulfilled requests |
| GET | `/admin-api/deleted-requests` | ADMIN | All deleted requests |
| POST | `/admin-api/request-details` | ADMIN | Single request details by request number |
| PATCH | `/admin-api/force-close-request` | ADMIN | Force close any open request |

---

# Middleware Used

## verifyToken Middleware
- Factory function that accepts allowed roles as arguments
- Reads JWT token from Authorization header (Bearer token)
- Verifies token signature against SECRET_KEY
- Checks decoded role against the allowed roles for that route
- Attaches decoded user to req.user for downstream handlers
- Returns 401 if token missing or expired
- Returns 403 if role not permitted

## Global Error Handler
- Handles Mongoose ValidationError
- Handles Mongoose CastError
- Handles MongoDB duplicate key error (code 11000) with field-level messages
- Falls back to 500 Server Side Error for anything else

---

# Utility Functions

## bloodCompatibility.js
Full ABO and Rh compatibility map. Exports `canDonate(donorBloodGroup, recipientBloodGroup)` used in accept-request validation and matched-requests filtering.

## calculatePoints.js
Returns points based on alert level. GREEN = 1, YELLOW = 5, RED = 25, BLACK = 100.

## calculateLevel.js
Returns donor level string from total points. Iron (0+), Bronze (11+), Silver (26+), Gold (51+), Platinum (101+), Diamond (1000+).

## calculateBadges.js
Returns array of earned badge names. Donation milestones at 1, 5, 10, 25, 50 donations. Points milestones at 100, 500, 1000 points.

## calculatePriorityScore.js
Returns priority score = alert level score + unitsRequired. Used to sort open requests with most urgent appearing first.

## donationCooldown.js
Calculates next eligible donation date (90 days after donation). Also exports isEligibleToDonate to check if the date has passed.

## requestExpiry.js
Calculates expiry date based on alert level. BLACK = 1 day, RED = 3 days, YELLOW = 5 days, GREEN = 7 days.

## generateRequestNumber.js
Generates unique request number in format REQ-YYYY-NNNNN using current year and zero-padded document count.

## createNotification.js
Helper function used throughout the APIs to create notification documents consistently.

---

# Frontend Pages

## Public Pages
- Home
- Open Requests
- Request Detail
- Leaderboard
- Login
- Register
- Unauthorized

## Donor Pages
- Donor Dashboard
- Donation History
- Badges
- Achievements

## Requester Pages
- Requester Dashboard
- Create Request
- My Requests
- Edit Request

## Admin Pages
- Admin Dashboard
- Admin Users
- Admin Requests
- Admin Statistics

---

# State Management

The application uses Redux Toolkit with two slices.

## authSlice
Manages the authenticated user session including user object, role, isAuthenticated flag, loading state, and error state. Exports three thunks: loginUser (saves token to localStorage on success), logoutUser (removes token from localStorage), and checkAuth (reads token from localStorage on page refresh to restore session).

## notifSlice
Manages the unread notification count for the navbar bell badge. Fetched once on login and decremented locally when a notification is marked as read to avoid unnecessary API calls.

---

# Security Features

- JWT Authentication
- Password Hashing with bcryptjs
- Protected API Routes
- Role-Based Authorization
- Environment Variable Protection
- Input Validation via Mongoose schemas
- Duplicate Email and Phone Prevention
- Strict schema mode — unknown fields throw errors immediately
- Soft deletes — data is never permanently removed

---

# Blood Compatibility Table

| Recipient | Compatible Donors |
|-----------|-------------------|
| O- | O- |
| O+ | O-, O+ |
| A- | O-, A- |
| A+ | O-, O+, A-, A+ |
| B- | O-, B- |
| B+ | O-, O+, B-, B+ |
| AB- | O-, A-, B-, AB- |
| AB+ | O-, O+, A-, A+, B-, B+, AB-, AB+ |

---

# Donor Level Thresholds

| Level | Points Required |
|-------|----------------|
| Iron | 0 |
| Bronze | 11 |
| Silver | 26 |
| Gold | 51 |
| Platinum | 101 |
| Diamond | 1000 |

---

# Alert Level System

| Alert Level | Points Awarded | Request Expires |
|-------------|---------------|-----------------|
| GREEN | 1 | 7 days |
| YELLOW | 5 | 5 days |
| RED | 25 | 3 days |
| BLACK | 100 | 1 day |

---

# Learning Concepts Covered

- MERN Stack Development
- REST API Design
- JWT Authentication
- Role-Based Authorization
- MongoDB Schema Design
- Mongoose Strict Mode
- Middleware Architecture
- Factory Middleware Pattern
- Blood Group Compatibility Logic
- Gamification System Design
- Redux Toolkit State Management
- Axios Interceptors
- React Hook Form
- Protected Routes
- SPA Deployment on Vercel
- Node.js Deployment on Render
- Cross-Origin Authentication with localStorage
- Priority Scoring and Sorting
- Soft Delete Pattern
- Notification System

---

# Future Improvements

- Email Notifications for critical blood requests
- OTP Verification on registration
- Password Reset via email
- Profile Image Upload using Cloudinary
- Real-Time Notifications using WebSockets
- Admin ability to create ADMIN accounts from the dashboard
- Request expiry auto-handling via scheduled jobs
- SMS alerts for BLACK level requests
- Donor availability toggle from dashboard
- Search and filter on Admin Users page
- Pagination for large datasets
- Dark Mode

---
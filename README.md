# Emergency Blood Connector

A full-stack emergency blood donation platform that connects blood donors with patients in critical need. Users can register as donors or requesters, post and accept blood requests, earn points and badges for saving lives, and track their contributions through a gamified donor progression system.

The project is built using the MERN Stack and follows a modular backend architecture with JWT authentication, role-based access control, blood group compatibility matching, real-time notifications, profile management with Cloudinary image uploads, and separate dashboards for donors, requesters, and admins.

Backend Deployment Link: https://emergency-blood-connector-kbw2.onrender.com

Frontend Deployment Link: https://emergency-blood-connector-lilac.vercel.app

---

# Features

# Authentication and Authorization
- User Registration as Donor or Requester with optional profile image upload
- User Login and Logout
- JWT Token Authentication using localStorage
- Role-Based Access Control (DONOR, REQUESTER, ADMIN)
- Protected Routes with role verification
- Unauthorized Access Handling
- Password Encryption using bcryptjs
- Automatic Session Restore on Page Refresh
- Login History Tracking (last 50 logins)
- Profile Update — edit name, phone, state, and profile image
- Password Change — verifies current password, clears session after success

---

# Donor Features
- Browse all open blood requests
- Filter requests by blood group, alert level, and search text
- Accept blood requests based on blood group and state compatibility
- Mark donations as complete after donating at hospital (creates a pending record)
- Requester confirms the donation before points are awarded
- 90-day donation cooldown enforced automatically after confirmation
- Cross-request lock — a donor with a pending unconfirmed donation cannot accept or mark any other request until it is resolved
- View personal donation history showing both pending and confirmed donations
- Track donor level progression (Iron → Bronze → Silver → Gold → Platinum → Diamond)
- Earn badges based on donation count and total points milestones
- View achievements page with level progress bar and milestone tracking
- Appear on the public leaderboard ranked by total points
- View personal rank among all donors
- Receive notifications for request accepted, donation confirmed, and badge earned events

---

# Requester Features
- Create blood requests with patient details, hospital info, and urgency level
- Four alert levels: GREEN (routine), YELLOW (moderate), RED (critical), BLACK (catastrophic)
- Edit open requests
- Close requests manually
- Soft delete requests
- View all own requests with status filter tabs
- Dashboard showing total requests, open count, fulfilled count, and units progress
- Confirm pending donations from donors via the donation confirmation panel
- Confirmation panel visible regardless of request status — pending donors can be confirmed even after a request is fulfilled
- Receive notifications when donors accept their requests and mark donations complete

---

# Admin Features
- View platform-wide dashboard with user and request statistics
- Manage all users across all roles with search and filter
- Activate and deactivate user accounts (cannot target own account)
- Browse all blood requests by status
- Force close any open request
- Confirm pending donations on any request
- Edit any request
- View statistics with blood group distribution, alert level breakdown, request status breakdown, and state-wise user distribution

---

# Blood Request Features
- Auto-generated unique request numbers in format REQ-YYYY-NNNNN
- Priority scoring system that sorts requests by urgency and units needed
- Units fulfilled tracking with progress bar
- Request expiry based on alert level (auto-marked EXPIRED on fetch)
- Accepted donors list with acceptance timestamps
- Pending confirmation list — donors who have marked as donated and are awaiting requester confirmation
- Completed donors list — donors whose donations have been confirmed
- Soft delete — requests are never permanently removed

---

# Two-Step Donation Confirmation
- Donor marks as donated after visiting the hospital → a PENDING DonationModel record is created
- Donor is moved from the accepted list to the pending confirmation list on the request
- No points are awarded and no cooldown starts until the requester confirms
- Requester sees each pending donor's name, blood group, and time of donation
- Requester clicks Confirm donation → points awarded, cooldown starts, donor moved to completed list
- unitsFulfilled increments; request becomes FULFILLED when all units are met
- Donor receives a Donation Confirmed notification and any newly earned badge notifications

---

# Donor Progression System
- Points awarded per confirmed donation based on alert level of the request
- GREEN = 1 point, YELLOW = 5 points, RED = 25 points, BLACK = 100 points
- Six donor levels with point thresholds: Iron (0), Bronze (11), Silver (26), Gold (51), Platinum (100), Diamond (1000)
- Eight badges earned through donation count and points milestones
- Leaderboard showing all donors ranked by total points with medal icons for top 3

---

# Notification Features
- Notifications created automatically for key events
- Event types: Request Created, Request Accepted, Donation Completed, Donation Confirmed, Badge Earned, General
- Unread count shown as a live badge on the navbar bell icon
- Mark individual notifications as read
- Mark all as read in one action
- Filter notifications by All, Unread, and Read

---

# Profile Features
- View Profile page showing all personal data and (for donors) full donor stats
- Edit Profile — update first name, last name, phone number, state, and profile image
- Email, blood group, and role cannot be changed after registration
- Profile image uploaded to Cloudinary; old image deleted automatically on replacement
- Change Password — requires current password verification; logs out and redirects to login after success
- Avatar dropdown in the navbar gives quick access to profile, dashboard, and logout

---

# Blood Compatibility Features
- Full ABO and Rh blood group compatibility enforced on accept-request
- Donors can only accept requests where their blood group is compatible with the patient's
- Donors can only accept requests in their registered state
- Matched requests page shows only compatible open requests for each donor

---

# Responsive Design
- All pages fully responsive for mobile, tablet, and desktop
- Admin tables collapse to card layouts on mobile
- Navbar shows a hamburger menu on mobile with a full-width drawer
- Font sizes, padding, and button layouts scale down on small screens
- Donor dashboard, leaderboard, and form pages all adapt to narrow viewports

---

# Backend Functionalities
- REST API Architecture with 5 routers and 43 endpoints
- Express 5 Middleware Integration
- MongoDB Database with Mongoose 9
- Mongoose Schema Validation with strict throw mode
- Multipart form handling with Multer (memory storage, 2 MB limit)
- Cloudinary integration for profile image upload and deletion
- Global Error Handling Middleware covering Multer errors, Validation errors, Cast errors, and Duplicate key errors
- Async Route Handling with next(err) pattern
- Environment Variable Configuration
- Modular utility functions for all business logic
- Index-optimised queries for donor search and request priority sorting
- CORS origin array built with filter(Boolean) to prevent production blocking if env var is missing
- Notifications wrapped in individual try-catch blocks so a notification failure never blocks the main action

---

# Frontend Functionalities
- React 19 Component Architecture
- Redux Toolkit State Management with two slices (auth and notifications)
- updateUser reducer for instant profile update without re-fetching
- Form Handling with React Hook Form across all forms with validation
- API Integration using Axios with Authorization header interceptor
- Toast Notifications for all user actions
- Client-side Routing with React Router 7
- Protected Navigation with role and auth checks
- Dynamic Dashboard Rendering per role
- Conditional UI Rendering based on role and ownership
- Centralised Design Token System in common.js
- Client-side filtering with search, blood group, alert level, and status tabs
- Reusable RequestCard component used across multiple pages
- Silent re-fetch on RequestDetail after actions — no loading flash
- Mobile hamburger drawer with three-ref click-outside system

---

# Tech Stack

## Frontend
- React 19
- Vite 8
- React Router 7
- Redux Toolkit 2
- React Redux 9
- Axios 1
- React Hook Form 7
- React Hot Toast 2
- Tailwind CSS 4

## Backend
- Node.js with ES Modules
- Express 5
- MongoDB
- Mongoose 9
- JWT (jsonwebtoken 9)
- bcryptjs 3
- Cloudinary 2
- Multer 2
- dotenv 17
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
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── cloudinaryUpload.js
│   │   └── multer.js
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
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminUsers.jsx
    │   │   │   ├── AdminRequests.jsx
    │   │   │   └── AdminStatistics.jsx
    │   │   │
    │   │   └── profile/
    │   │       ├── Profile.jsx
    │   │       ├── EditProfile.jsx
    │   │       └── ChangePassword.jsx
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
    firstName,                   // required, trimmed
    lastName,                    // required, trimmed
    email,                       // unique, lowercase
    password,                    // bcrypt hashed
    phoneNumber,                 // unique
    bloodGroup,                  // O+, O-, A+, A-, B+, B-, AB+, AB-
    state,                       // used for request matching
    role,                        // DONOR / REQUESTER / ADMIN
    isAvailable,                 // false during 90-day donation cooldown
    profileImageUrl,             // Cloudinary URL, optional
    donationsCount,              // confirmed donations only
    totalPoints,                 // cumulative from confirmed donations
    donorLevel,                  // Iron / Bronze / Silver / Gold / Platinum / Diamond
    badges,                      // array of earned badge name strings
    lastDonationDate,
    nextEligibleDonationDate,    // 90 days after last confirmed donation
    isUserActive,                // admin can deactivate accounts
    loginHistory,                // last 50 login timestamps
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
    unitsFulfilled,      // increments per confirmed donation
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
    pendingConfirmation, // [{ donorId, donationId, donatedAt }] — awaiting requester confirmation
    completedDonors,     // [ObjectId refs] — confirmed donations
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
    pointsAwarded,               // calculated at time of donation
    unitsDonated,                // always 1
    donationDate,
    nextEligibleDonationDate,    // 90 days after donationDate
    status,                      // PENDING / CONFIRMED / REJECTED
    isVerified                   // true after requester confirms
}
```

---

## Notification Schema

```js
{
    userId,      // ref to user
    title,
    message,
    type,        // REQUEST_CREATED / REQUEST_ACCEPTED / DONATION_COMPLETED /
                 // DONATION_CONFIRMED / BADGE_EARNED / GENERAL
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
| POST | `/auth/register` | Public | Register a new DONOR or REQUESTER (multipart — supports profile image) |
| POST | `/auth/login` | Public | Login and receive JWT token |
| GET | `/auth/check-auth` | Any role | Verify token and return current user |
| GET | `/auth/logout` | Any role | Client removes token from localStorage |
| PATCH | `/auth/update-profile` | Any role | Update profile fields and/or profile image (multipart) |
| PATCH | `/auth/change-password` | Any role | Verify current password and set a new one |

---

# Request Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/request-api/create-request` | REQUESTER, ADMIN | Create a blood request |
| GET | `/request-api/open-requests` | Public | All OPEN requests sorted by priority (auto-expires overdue) |
| GET | `/request-api/my-requests` | REQUESTER, ADMIN | Requests created by logged-in user (auto-expires overdue) |
| GET | `/request-api/request/:requestNumber` | Public | Full request details with pending donors populated |
| PUT | `/request-api/edit-request` | REQUESTER, ADMIN | Edit an OPEN request |
| PATCH | `/request-api/close-request` | REQUESTER, ADMIN | Close a request |
| PATCH | `/request-api/delete-request` | REQUESTER, ADMIN | Soft delete a request |
| GET | `/request-api/dashboard` | REQUESTER, ADMIN | Requester dashboard statistics |
| PATCH | `/request-api/confirm-donation` | REQUESTER, ADMIN | Confirm a pending donation, award points, start cooldown |

---

# Donor Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/donor-api/dashboard` | DONOR | Stats, eligibility, matched request count |
| GET | `/donor-api/my-matched-requests` | DONOR | Compatible open requests for this donor |
| GET | `/donor-api/my-accepted-requests` | DONOR | Requests the donor has accepted |
| GET | `/donor-api/donation-history` | DONOR | All donation records (PENDING and CONFIRMED) |
| GET | `/donor-api/badges` | DONOR | Earned badges |
| GET | `/donor-api/achievements` | DONOR | Milestones and level progress |
| GET | `/donor-api/leaderboard` | Public | All donors ranked by points |
| GET | `/donor-api/top-donors` | Public | Top 3 donors |
| GET | `/donor-api/my-rank` | DONOR | Current donor's rank on the leaderboard |
| PUT | `/donor-api/accept-request` | DONOR | Accept an open blood request |
| PUT | `/donor-api/complete-donation` | DONOR | Mark donation as complete — creates PENDING record awaiting requester confirmation |

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
| GET | `/admin-api/statistics` | ADMIN | Blood group, state, alert level, status distributions |
| GET | `/admin-api/users` | ADMIN | All registered users |
| GET | `/admin-api/donors` | ADMIN | All donors |
| GET | `/admin-api/requesters` | ADMIN | All requesters |
| POST | `/admin-api/user-details` | ADMIN | Single user details by ID |
| PATCH | `/admin-api/user-status` | ADMIN | Activate or deactivate a user (cannot target own account) |
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
- Handles Multer errors (file size exceeded, unexpected field)
- Handles custom file filter errors (wrong MIME type)
- Handles Mongoose ValidationError
- Handles Mongoose CastError
- Handles MongoDB duplicate key error (code 11000) with field-level messages
- Falls back to 500 Server Side Error for anything else

---

# Utility Functions

## bloodCompatibility.js
Full ABO and Rh compatibility map. Exports `canDonate(donorBloodGroup, recipientBloodGroup)` used in accept-request validation and matched-requests filtering.

## calculatePoints.js
Returns points based on alert level. GREEN = 1, YELLOW = 5, RED = 25, BLACK = 100. Points are calculated when the donor marks as donated and stored on the DonationModel record, but only credited to the donor when the requester confirms.

## calculateLevel.js
Returns donor level string from total points. Iron (0+), Bronze (11+), Silver (26+), Gold (51+), Platinum (100+), Diamond (1000+).

## calculateBadges.js
Returns array of earned badge names. Donation milestones at 1, 5, 10, 25, 50 donations. Points milestones at 100, 500, 1000 points. Called after every confirmed donation to recalculate and update the donor's badge array.

## calculatePriorityScore.js
Returns priority score = alert level score + unitsRequired. Alert scores: GREEN = 10, YELLOW = 30, RED = 60, BLACK = 100. Used to sort open requests with most urgent appearing first.

## donationCooldown.js
Calculates next eligible donation date (90 days after donation). Also exports isEligibleToDonate to check if the date has passed.

## requestExpiry.js
Calculates expiry date based on alert level. BLACK = 1 day, RED = 3 days, YELLOW = 5 days, GREEN = 7 days.

## generateRequestNumber.js
Generates unique request number in format REQ-YYYY-NNNNN using current year and zero-padded document count.

## createNotification.js
Helper function used throughout the APIs to create notification documents consistently. All calls are wrapped in their own try-catch blocks so a notification failure never blocks the main action from succeeding.

---

# Frontend Pages

## Public Pages
- Home
- Open Requests
- Request Detail
- Leaderboard (public)
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

## Profile Pages (all roles)
- Profile (view)
- Edit Profile
- Change Password

---

# State Management

The application uses Redux Toolkit with two slices.

## authSlice
Manages the authenticated user session including user object, role, isAuthenticated flag, loading state, and error state. Exports three thunks: loginUser (saves token to localStorage on success), logoutUser (removes token from localStorage), and checkAuth (reads token from localStorage on page refresh to restore session). Also exports the updateUser action, which merges a partial user object into Redux state so the Navbar and Profile page update immediately after a profile edit without a full re-fetch.

## notifSlice
Manages the unread notification count for the navbar bell badge. Fetched once on login and re-fetched when auth state changes. Decremented locally when a notification is marked as read to avoid unnecessary API calls.

---

# Security Features

- JWT Authentication with 7-day token expiry
- Password Hashing with bcryptjs
- Protected API Routes
- Role-Based Authorization
- Environment Variable Protection
- Input Validation via Mongoose schemas with strict throw mode
- Duplicate Email and Phone Prevention
- Soft deletes — data is never permanently removed
- Profile image stored on Cloudinary — old image deleted automatically on replacement
- Password change clears the session — old JWT cannot continue to be used
- CORS origin built with filter(Boolean) — missing env var cannot silently block production traffic
- Admin cannot deactivate their own account

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
| Platinum | 100 |
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
- Multipart Form Handling with Multer
- Cloud Image Storage with Cloudinary
- Blood Group Compatibility Logic
- Gamification System Design
- Two-Step Confirmation Flow
- Redux Toolkit State Management
- Axios Interceptors
- React Hook Form
- Protected Routes
- Responsive Design with Tailwind CSS
- SPA Deployment on Vercel
- Node.js Deployment on Render
- Cross-Origin Authentication with localStorage
- Priority Scoring and Sorting
- Soft Delete Pattern
- Notification System
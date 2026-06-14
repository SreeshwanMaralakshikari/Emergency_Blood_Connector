# Emergency Blood Connector — Backend

A REST API backend for a blood donation platform that connects donors with patients in emergency situations. Built with Node.js, Express 5, and MongoDB.

---

## What This Project Does

The backend manages three types of users — donors, requesters, and admins. Requesters post blood requests on behalf of patients or hospitals. Donors browse those requests, accept ones they are eligible for, and mark them complete after donating. The system automatically awards points and badges based on how critical the donation was, and tracks donor progression through six levels. Admins can manage all users and requests from a dedicated panel.

---

Backend Deployment Link: https://emergency-blood-connector-kbw2.onrender.com

---

## Tech Stack

- Node.js with ES Modules (type: "module")
- Express 5
- MongoDB with Mongoose 9
- bcryptjs for password hashing
- jsonwebtoken for JWT authentication
- dotenv for environment configuration
- cors and cookie-parser middleware
- nodemon for development

---

## Folder Structure

```
backend/
├── server.js
├── APIs/
│   ├── CommonAPI.js
│   ├── RequestAPI.js
│   ├── DonorAPI.js
│   ├── NotificationAPI.js
│   └── AdminAPI.js
├── middlewares/
│   └── verifyToken.js
├── models/
│   ├── UserModel.js
│   ├── BloodRequestModel.js
│   ├── DonationModel.js
│   └── NotificationModel.js
└── utils/
    ├── bloodCompatibility.js
    ├── calculatePoints.js
    ├── calculateLevel.js
    ├── calculateBadges.js
    ├── calculatePriorityScore.js
    ├── donationCooldown.js
    ├── requestExpiry.js
    ├── generateRequestNumber.js
    └── createNotification.js
```

---

## Environment Variables

```
PORT=5000
DB_URL=mongodb-connection-string
SECRET_KEY=long-random-string
FRONTEND_URL=frontend-url
```

---

## Authentication

JWT-based authentication. On login the server signs a token and returns it in the response body. The client stores it in localStorage and attaches it to every request via the `Authorization: Bearer <token>` header. The `verifyToken` middleware is a factory function that accepts allowed roles:

```js
verifyToken("DONOR", "ADMIN")  // only these roles can access
verifyToken()                  // any authenticated user
```

Tokens expire after 7 days.

---

## Roles

Three roles are supported:
- DONOR — can browse requests, accept them, and complete donations
- REQUESTER — can create, edit, close, and delete blood requests
- ADMIN — full platform access

DONOR and REQUESTER can self-register. ADMIN accounts are created manually in the database.

---

## Schemas and Models

### UserModel

```
firstName           String      required
lastName            String      required
email               String      required, unique, lowercase
password            String      required (bcrypt hashed)
phoneNumber         String      required, unique
bloodGroup          String      O+, O-, A+, A-, B+, B-, AB+, AB-
state               String      required — used for request matching
role                String      DONOR / REQUESTER / ADMIN
isAvailable         Boolean     false during 90-day cooldown
donationsCount      Number      total completed donations
totalPoints         Number      cumulative points earned
donorLevel          String      Iron / Bronze / Silver / Gold / Platinum / Diamond
badges              [String]    earned badge names
lastDonationDate    Date
nextEligibleDate    Date        90 days after last donation
isUserActive        Boolean     admin can deactivate accounts
loginHistory        [Date]      last 50 login timestamps
```

Index on `role`, `isAvailable`, `state`, `bloodGroup` for fast donor lookup queries.

---

### BloodRequestModel

```
requestNumber       String      unique, auto-generated (REQ-YYYY-NNNNN)
patientName         String      required
patientAge          Number      0–120
patientGender       String      MALE / FEMALE / OTHER
bloodGroup          String      blood group needed
unitsRequired       Number      1–20
unitsFulfilled      Number      starts at 0, increments per donation
hospitalName        String      required
hospitalAddress     String      required
state               String      required — must match donor state
contactPerson       String      required
contactNumber       String      required
requestCreatedBy    ObjectId    ref to user
alertLevel          String      GREEN / YELLOW / RED / BLACK
status              String      OPEN / FULFILLED / CLOSED / EXPIRED / DELETED
priorityScore       Number      computed from alert level + units required
acceptedDonors      [Object]    { donorId, acceptedAt }
completedDonors     [ObjectId]  refs to users who donated
requiredByDate      Date        required
expiresAt           Date        auto-calculated from alert level
```

Index on `status` and `priorityScore` for fast open-request queries sorted by urgency.

---

### DonationModel

```
donorId                     ObjectId    ref to user
bloodRequestId              ObjectId    ref to bloodrequest
requestNumber               String
alertLevel                  String
pointsAwarded               Number
unitsDonated                Number
donationDate                Date
nextEligibleDonationDate    Date
status                      String      PENDING / CONFIRMED / REJECTED
isVerified                  Boolean
```

Index on `donorId` and `createdAt` for fast donation history queries.

---

### NotificationModel

```
userId      ObjectId    ref to user
title       String      required
message     String      required
type        String      REQUEST_CREATED / REQUEST_ACCEPTED / DONATION_COMPLETED / BADGE_EARNED / GENERAL
isRead      Boolean     default false
```

---

## APIs

### CommonAPI — /auth

```
POST    /auth/register          Register a new DONOR or REQUESTER
POST    /auth/login             Login and receive JWT token
GET     /auth/check-auth        Verify token and return current user
GET     /auth/logout            Client removes token (no server-side session)
GET     /auth/                  Health check
```

---

### RequestAPI — /request-api

```
POST    /request-api/create-request             REQUESTER, ADMIN    Create a blood request
GET     /request-api/open-requests              Public              All OPEN requests sorted by priority
GET     /request-api/my-requests                REQUESTER, ADMIN    Requests created by logged-in user
GET     /request-api/request/:requestNumber     DONOR, REQ, ADMIN   Full request details
PUT     /request-api/edit-request               REQUESTER, ADMIN    Edit an OPEN request
PATCH   /request-api/close-request              REQUESTER, ADMIN    Close a request
PATCH   /request-api/delete-request             REQUESTER, ADMIN    Soft delete a request
GET     /request-api/dashboard                  REQUESTER, ADMIN    Requester dashboard stats
GET     /request-api/                           Health check
```

---

### DonorAPI — /donor-api

```
GET     /donor-api/dashboard                DONOR       Stats, eligibility, matched request count
GET     /donor-api/my-matched-requests      DONOR       Open requests compatible with donor blood group + state
GET     /donor-api/my-accepted-requests     DONOR       Requests the donor has accepted
GET     /donor-api/donation-history         DONOR       All completed donations
GET     /donor-api/badges                   DONOR       Earned badges
GET     /donor-api/achievements             DONOR       Milestones and level progress
GET     /donor-api/leaderboard              Public      All donors ranked by points
GET     /donor-api/top-donors               Public      Top 3 donors
GET     /donor-api/my-rank                  DONOR       Current donor's rank
PUT     /donor-api/accept-request           DONOR       Accept an open blood request
PUT     /donor-api/complete-donation        DONOR       Mark donation as complete, award points
GET     /donor-api/                         Health check
```

---

### NotificationAPI — /notification-api

```
GET     /notification-api/my-notifications      Any     All notifications for current user
GET     /notification-api/unread-count          Any     Count of unread notifications
PUT     /notification-api/mark-read/:id         Any     Mark a single notification as read
GET     /notification-api/                      Health check
```

---

### AdminAPI — /admin-api

```
GET     /admin-api/dashboard                ADMIN   Platform-wide stats
GET     /admin-api/statistics               ADMIN   Blood group, state, alert level distributions
GET     /admin-api/users                    ADMIN   All users
GET     /admin-api/donors                   ADMIN   All donors
GET     /admin-api/requesters               ADMIN   All requesters
POST    /admin-api/user-details             ADMIN   Single user by ID
PATCH   /admin-api/user-status              ADMIN   Activate or deactivate a user
GET     /admin-api/requests                 ADMIN   All requests
GET     /admin-api/open-requests            ADMIN   All open requests
GET     /admin-api/fulfilled-requests       ADMIN   All fulfilled requests
GET     /admin-api/deleted-requests         ADMIN   All deleted requests
POST    /admin-api/request-details          ADMIN   Single request by request number
PATCH   /admin-api/force-close-request      ADMIN   Force close any open request
GET     /admin-api/                         Health check
```

---

## Utility Functions

### bloodCompatibility.js
Contains the full ABO/Rh compatibility map. `canDonate(donorBloodGroup, recipientBloodGroup)` returns true or false. Used in `accept-request` to validate eligibility and in `my-matched-requests` to filter open requests for a donor.

### calculatePoints.js
Returns points awarded based on alert level: GREEN = 1, YELLOW = 5, RED = 25, BLACK = 100.

### calculateLevel.js
Returns the donor level string from total points: Iron (0), Bronze (11), Silver (26), Gold (51), Platinum (101), Diamond (1000).

### calculateBadges.js
Returns the full list of earned badge names based on donations count and total points. Donation milestones: 1, 5, 10, 25, 50 donations. Points milestones: 100, 500, 1000 points.

### calculatePriorityScore.js
Computes request priority = alert score + unitsRequired. Alert scores: GREEN = 10, YELLOW = 30, RED = 60, BLACK = 100. Open requests are sorted by this score so the most urgent appear first.

### donationCooldown.js
Calculates the next eligible donation date — 90 days after the donation date. Also exports `isEligibleToDonate` which compares today against that date.

### requestExpiry.js
Calculates the expiry date based on alert level: BLACK = 1 day, RED = 3 days, YELLOW = 5 days, GREEN = 7 days.

### generateRequestNumber.js
Generates a unique request number in the format `REQ-YYYY-NNNNN` using the current year and a zero-padded count.

### createNotification.js
A small helper that creates a NotificationModel document for a given user. Used throughout DonorAPI and RequestAPI to keep notification creation consistent.

---

## Key Design Decisions

- `strict: "throw"` on all Mongoose schemas — any unknown field in a create or save call throws an error immediately rather than silently being ignored. This caught several bugs during development where extra fields were accidentally passed.

- Soft deletes only — requests are never removed from the database. Setting `status` to `DELETED` hides them from all public queries while keeping the data intact.

- `verifyToken` is a factory function rather than a single middleware. This means each route declares its own allowed roles inline, making permissions easy to read at a glance.

- The donor matching system enforces two rules simultaneously: state match and blood group compatibility. Both must pass for `accept-request` to succeed.

- Notifications are fire-and-forget inside try-catch blocks. A notification failure never blocks the main action (accepting a request, completing a donation) from succeeding.

- Deployed on Render (free tier). Backend URL: https://emergency-blood-connector-kbw2.onrender.com

# Emergency Blood Connector — Frontend

A React single-page application for the Emergency Blood Connector platform. Built with Vite, Tailwind CSS v4, Redux Toolkit, and React Router v7. The frontend connects to the backend REST API and provides separate interfaces for donors, requesters, and admins.

---

## What This Project Does

The frontend gives three types of users a dedicated experience. Donors can browse open blood requests filtered by blood group and urgency, accept requests they are eligible for, and track their points, badges, and donation history. Requesters can post blood requests with patient and hospital details, monitor how many units have been fulfilled, and manage their requests. Admins can view platform-wide statistics, manage all user accounts, and oversee all requests.

The app is fully deployed on Vercel and connects to a Node.js backend on Render.

---

Frontend Deployment Link: https://emergency-blood-connector-lilac.vercel.app

---

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4 with the @tailwindcss/vite plugin
- React Router 7
- Redux Toolkit 2 with React Redux 9
- Axios 1 with a request interceptor for JWT auth
- React Hook Form 7 for all forms
- React Hot Toast 2 for toast notifications

---

## Folder Structure

```
frontend/
├── index.html
├── vite.config.js
├── vercel.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── api/
│   │   └── axiosInstance.js
│   ├── store/
│   │   ├── store.js
│   │   ├── authSlice.js
│   │   └── notifSlice.js
│   ├── styles/
│   │   └── common.js
│   ├── utils/
│   │   └── formatDate.js
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── RequestCard.jsx
│   └── pages/
│       ├── auth/
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       ├── public/
│       │   ├── Home.jsx
│       │   ├── OpenRequests.jsx
│       │   ├── RequestDetail.jsx
│       │   ├── Notifications.jsx
│       │   └── Unauthorized.jsx
│       ├── donor/
│       │   ├── DonorDashboard.jsx
│       │   ├── DonationHistory.jsx
│       │   ├── Leaderboard.jsx
│       │   ├── Badges.jsx
│       │   └── Achievements.jsx
│       ├── requester/
│       │   ├── RequesterDashboard.jsx
│       │   ├── CreateRequest.jsx
│       │   ├── MyRequests.jsx
│       │   └── EditRequest.jsx
│       └── admin/
│           ├── AdminDashboard.jsx
│           ├── AdminUsers.jsx
│           ├── AdminRequests.jsx
│           └── AdminStatistics.jsx
```

---

## Environment Variables

```
VITE_API_BASE_URL=backend-url
```

For local development this is `http://localhost:5000`. For production it points to the Render backend URL, set as an environment variable in the Vercel dashboard.

---

## Authentication

Authentication uses JWT tokens stored in `localStorage`. This approach was chosen because cookies don't work reliably across different domains (Vercel frontend to Render backend) on the browser's free-tier restrictions.

How the flow works:

1. On login, the backend returns a `token` in the response body
2. `authSlice.js` saves it to `localStorage`
3. `axiosInstance.js` has a request interceptor that reads the token from `localStorage` and attaches it as `Authorization: Bearer <token>` on every outgoing request
4. On page refresh, `checkAuth` in `App.jsx` reads the token, calls `/auth/check-auth`, and restores the Redux session
5. On logout, the token is removed from `localStorage` and Redux state is cleared

---

## State Management

Redux Toolkit manages two global state slices.

### authSlice

Handles everything related to the logged-in session.

```
user              — full user object from the backend
role              — DONOR / REQUESTER / ADMIN
isAuthenticated   — true when logged in
loading           — true while checkAuth is resolving on page load
error             — login error message if login failed
```

Thunks: `loginUser`, `logoutUser`, `checkAuth`

### notifSlice

Handles the unread notification count shown on the navbar bell icon.

```
unreadCount   — number of unread notifications
```

The count is fetched once on login. When the user marks a notification as read, `decrementUnread` updates the count locally without re-fetching from the server.

Thunk: `fetchUnreadCount`
Actions: `decrementUnread`, `clearUnread`

---

## Routes

### Public — no login required

```
/                           Home page
/requests                   Browse all open blood requests
/requests/:requestNumber    Full details of a single request
/donor/leaderboard          Top donors ranked by points
/login                      Sign in
/register                   Create a DONOR or REQUESTER account
/unauthorized               Shown when a user visits a restricted page
```

### Protected — login required

```
/notifications                          Any logged-in role
/donor/dashboard                        DONOR, ADMIN
/donor/history                          DONOR, ADMIN
/donor/badges                           DONOR, ADMIN
/donor/achievements                     DONOR, ADMIN
/requester/dashboard                    REQUESTER, ADMIN
/requester/create                       REQUESTER, ADMIN
/requester/my-requests                  REQUESTER, ADMIN
/requester/edit/:requestNumber          REQUESTER, ADMIN
/admin/dashboard                        ADMIN
/admin/users                            ADMIN
/admin/requests                         ADMIN
/admin/statistics                       ADMIN
```

---

## Components

### Navbar
Role-aware navigation. Shows different links depending on whether the user is a donor, requester, or admin. Includes a bell icon that displays the unread notification count as a badge. The count is pulled from Redux and stays in sync without page refreshes.

### ProtectedRoute
A wrapper component that guards every protected route. It checks loading state first (to avoid flash redirects on page refresh), then checks `isAuthenticated`, then checks `allowedRoles`. If any check fails it redirects appropriately.

### RequestCard
A reusable card component used across the open requests page, requester dashboard, and my-requests page. Shows blood group badge, alert level, patient name, hospital, units progress bar, request number, and time ago. Clicking navigates to the full request detail page.

---

## Pages

### auth
- **Login** — email and password form. Uses a `loginAttempted` ref to distinguish between a fresh login and a session restore, so the role-based redirect only fires after the user actually submits the form.
- **Register** — full registration form for DONOR or REQUESTER. Role is selected via pill-style radio buttons. Sends only known fields to avoid backend strict-mode errors.

### public
- **Home** — landing page with hero, stats strip, how-it-works section, alert level breakdown, blood group display, and a CTA that changes based on login state.
- **OpenRequests** — lists all OPEN requests with client-side filters for blood group, alert level, and a text search across patient name, hospital, state, and request number.
- **RequestDetail** — shows full request details. The action buttons shown depend on who is viewing: donors see Accept or Complete, requesters/admins see Edit, Close, Delete, and admins see Force Close.
- **Notifications** — full inbox with ALL / UNREAD / READ filter tabs. Mark as read updates the navbar badge instantly via `decrementUnread`. Mark all as read fires all requests in parallel using `Promise.allSettled`.

### donor
- **DonorDashboard** — fetches dashboard and rank in parallel. Shows profile with level badge and availability, stats strip, eligibility card with next eligible date, quick links to history/badges/achievements, and a leaderboard teaser.
- **DonationHistory** — all completed donations with a summary strip showing totals for donations, units, and points.
- **Leaderboard** — public page showing all donors ranked by points with medal icons for top 3. If the user is logged in as a donor, their personal rank card appears at the top.
- **Badges** — displays all possible badges. Earned ones are highlighted, locked ones are dimmed. Badge icons are mapped to domain-relevant emojis.
- **Achievements** — shows stats, a level progress bar with exact points needed to reach the next level, and a milestones list where each row has its own progress bar.

### requester
- **RequesterDashboard** — fetches dashboard stats and the 3 most recent requests in parallel. Shows a units fulfilled progress bar across all requests.
- **CreateRequest** — 12-field form in three sections: patient info, hospital info, and contact & urgency. Navigates to the new request's detail page on success using the returned request number.
- **MyRequests** — all requests with status filter tabs (ALL / OPEN / FULFILLED / CLOSED / EXPIRED / DELETED) each showing a live count badge.
- **EditRequest** — pre-fills the form using `reset()` from React Hook Form with the existing request data. Only works for OPEN requests.

### admin
- **AdminDashboard** — platform-wide counts across users, requests, and donations. Quick nav cards to the three management sections.
- **AdminUsers** — three-tab view (All / Donors / Requesters) with client-side search. Activate/deactivate toggle updates local state instantly without a full refetch.
- **AdminRequests** — four-tab view (All / Open / Fulfilled / Deleted) with client-side search. Force close button appears only on OPEN requests with a confirm dialog.
- **AdminStatistics** — four distribution charts using pure CSS bar charts (no chart library). Blood group cards, alert level breakdown, request status breakdown, and state-wise user distribution with top-3 medal highlights.

---

## Design System

All Tailwind class strings are stored as named constants in `src/styles/common.js`. Components import and use these names instead of writing classes inline. This keeps the design consistent across all 20 pages and means a colour or style change only needs to happen in one place.

The design uses a crimson accent (`#c0152a`), warm off-white background (`#fafafa`), and a clear text hierarchy with three levels of gray. Badge colours are semantic — alert levels use green/amber/red/black, donor levels use distinct colours from iron-gray through to purple for diamond.

---

## Key Design Decisions

- localStorage for JWT instead of cookies, because cross-domain cookie restrictions between Vercel and Render prevented the HTTP-only cookie approach from working in production.

- All API calls are made directly inside components using `axiosInstance`, not in a separate service layer. This is consistent with the codebase style from the Blog App project.

- `common.js` as a centralised design token file instead of a component library. Simpler to maintain for a project of this size and gives full control over every class.

- `vercel.json` rewrites all routes to `index.html` so React Router can handle client-side navigation correctly. Without this, refreshing any page other than `/` returns a 404 on Vercel.

- Deployed on Vercel. Frontend URL: https://emergency-blood-connector-lilac.vercel.app

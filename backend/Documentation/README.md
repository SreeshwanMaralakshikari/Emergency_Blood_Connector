# Emergency Blood Connector

## Project Overview

Emergency Blood Connector is a full-stack web application designed to connect blood donors with patients and hospitals during emergencies. The system allows requesters to create blood requests, donors to accept and complete donations, and administrators to manage users, requests, and platform analytics.

The project focuses on reducing delays in emergency blood availability through a centralized and organized donation management platform.

---

# Features

## Authentication & Authorization

* User Registration
* User Login
* User Logout
* JWT Authentication
* Cookie-Based Authentication
* Role-Based Authorization
* Protected Routes

### Supported Roles

* DONOR
* REQUESTER
* ADMIN

---

# Donor Features

* View Open Blood Requests
* Accept Blood Requests
* Complete Donations
* Donation History
* Donor Dashboard
* Points System
* Donor Levels
* Badge System
* Achievements Tracking
* Leaderboard Ranking
* Availability Status Tracking
* Donation Cooldown Management

---

# Requester Features

* Create Blood Requests
* View Own Requests
* View Request Details
* Edit Open Requests
* Close Requests
* Soft Delete Requests
* Requester Dashboard

---

# Notification Features

* Request Created Notifications
* Donation Completed Notifications
* Badge Earned Notifications
* Unread Notification Count
* Mark Notifications as Read
* Notification History

---

# Admin Features

## User Management

* View All Users
* View Donors
* View Requesters
* View User Details
* Activate Users
* Deactivate Users

## Request Management

* View All Requests
* View Open Requests
* View Fulfilled Requests
* View Deleted Requests
* View Request Details
* Force Close Requests

## Analytics

* Admin Dashboard
* User Statistics
* Request Statistics
* Donation Statistics
* Blood Group Distribution
* Alert Level Distribution
* State-Wise User Distribution

---

# Reward System

## Points

Points are awarded based on request alert level.

### Example

| Alert Level | Points |
| ----------- | ------ |
| GREEN       | 2      |
| YELLOW      | 5      |
| RED         | 10     |
| BLACK       | 25     |

---

## Donor Levels

* Iron
* Bronze
* Silver
* Gold
* Platinum
* Diamond

---

## Badges

Examples:

* First Donation
* Five Donations
* Ten Donations
* Fifty Points
* Hundred Points

---

# Project Structure

```text
Backend
│
├── APIs
│   ├── CommonAPI.js
│   ├── RequestAPI.js
│   ├── DonorAPI.js
│   ├── NotificationAPI.js
│   └── AdminAPI.js
│
├── models
│   ├── UserModel.js
│   ├── BloodRequestModel.js
│   ├── DonationModel.js
│   └── NotificationModel.js
│
├── middlewares
│   └── verifyToken.js
│
├── utils
│   ├── generateRequestNumber.js
│   ├── calculatePoints.js
│   ├── calculateLevel.js
│   ├── calculateBadges.js
│   ├── calculatePriorityScore.js
│   ├── calculateExpiryDate.js
│   ├── calculateNextEligibleDate.js
│   └── createNotification.js
│
├── server.js
├── package.json
└── .env
```

---

# Technology Stack

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* cookie-parser
* cors

---

# Environment Variables

Create a `.env` file:

```env
PORT=5000

DB_URL=YOUR_MONGODB_CONNECTION_STRING

SECRET_KEY=YOUR_SECRET_KEY

FRONTEND_URL=http://localhost:5173
```

---

# Installation

Install dependencies:

```bash
npm install
```

Run server:

```bash
npm run dev
```

---

# API Modules

* Authentication Module
* Request Management Module
* Donor Management Module
* Notification Module
* Admin Management Module
* Dashboard Module
* Analytics Module

---

# Future Enhancements

* Email Notifications
* SMS Notifications
* OTP Verification
* Password Reset
* Cloudinary Profile Images
* Hospital Verification Workflow
* Real-Time Notifications
* Mobile Application

---

# Current Status

Backend Development Status:

✅ Complete

Frontend Development Status:

⏳ Pending

Documentation Status:

⏳ In Progress

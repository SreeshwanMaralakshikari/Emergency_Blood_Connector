# Emergency Blood Connector - Frontend API Integration Guide

# Base URL

Development:

```text
http://localhost:5000
```

---

# Authentication Module

Base Route

```text
/auth
```

---

## Register

### Endpoint

```http
POST /auth/register
```

### Request Body

```json
{
  "firstName": "Donor",
  "lastName": "One",
  "email": "donor@test.com",
  "password": "123456",
  "phoneNumber": "9001000001",
  "bloodGroup": "O+",
  "state": "Telangana",
  "role": "DONOR"
}
```

### Success Response

```json
{
  "message": "User created successfully",
  "payload": {}
}
```

---

## Login

### Endpoint

```http
POST /auth/login
```

### Request Body

```json
{
  "email": "donor@test.com",
  "password": "123456"
}
```

### Success Response

```json
{
  "message": "Login Successful",
  "token": "JWT_TOKEN",
  "payload": {}
}
```

---

## Check Authentication

### Endpoint

```http
GET /auth/check-auth
```

### Authentication

```text
Required
```

---

## Logout

### Endpoint

```http
GET /auth/logout
```

---

# Request Module

Base Route

```text
/request-api
```

---

## Create Request

### Endpoint

```http
POST /request-api/create-request
```

### Role

```text
REQUESTER
ADMIN
```

### Request Body

```json
{
  "patientName": "Patient",
  "patientAge": 40,
  "patientGender": "MALE",
  "bloodGroup": "O+",
  "unitsRequired": 2,
  "hospitalName": "Apollo",
  "hospitalAddress": "Hyderabad",
  "state": "Telangana",
  "contactPerson": "Doctor",
  "contactNumber": "9999999999",
  "alertLevel": "RED",
  "requiredByDate": "2026-07-01"
}
```

---

## Get Open Requests

### Endpoint

```http
GET /request-api/open-requests
```

### Role

```text
Public
```

---

## Get My Requests

### Endpoint

```http
GET /request-api/my-requests
```

### Role

```text
REQUESTER
ADMIN
```

---

## Request Details

### Endpoint

```http
GET /request-api/request/:requestNumber
```

### Example

```http
GET /request-api/request/REQ-2026-00011
```

---

## Edit Request

### Endpoint

```http
PUT /request-api/edit-request
```

### Request Body

```json
{
  "requestNumber": "REQ-2026-00011",
  "patientName": "Updated Patient",
  "patientAge": 45
}
```

---

## Close Request

### Endpoint

```http
PATCH /request-api/close-request
```

### Request Body

```json
{
  "requestNumber": "REQ-2026-00011"
}
```

---

## Delete Request

### Endpoint

```http
PATCH /request-api/delete-request
```

### Request Body

```json
{
  "requestNumber": "REQ-2026-00011"
}
```

---

## Requester Dashboard

### Endpoint

```http
GET /request-api/dashboard
```

---

# Donor Module

Base Route

```text
/donor-api
```

---

## Accept Request

### Endpoint

```http
PATCH /donor-api/accept-request
```

### Request Body

```json
{
  "requestNumber": "REQ-2026-00011"
}
```

---

## Complete Donation

### Endpoint

```http
PUT /donor-api/complete-donation
```

### Request Body

```json
{
  "requestNumber": "REQ-2026-00011"
}
```

---

## Donation History

### Endpoint

```http
GET /donor-api/donation-history
```

---

## Donor Dashboard

### Endpoint

```http
GET /donor-api/dashboard
```

---

## Leaderboard

### Endpoint

```http
GET /donor-api/leaderboard
```

---

## My Rank

### Endpoint

```http
GET /donor-api/my-rank
```

---

## Top Donors

### Endpoint

```http
GET /donor-api/top-donors
```

---

## Achievements

### Endpoint

```http
GET /donor-api/achievements
```

---

# Notification Module

Base Route

```text
/notification-api
```

---

## My Notifications

### Endpoint

```http
GET /notification-api/my-notifications
```

---

## Unread Count

### Endpoint

```http
GET /notification-api/unread-count
```

---

## Mark Read

### Endpoint

```http
PUT /notification-api/mark-read/:id
```

---

# Admin Module

Base Route

```text
/admin-api
```

---

## Users

```http
GET /admin-api/users
```

---

## Donors

```http
GET /admin-api/donors
```

---

## Requesters

```http
GET /admin-api/requesters
```

---

## User Details

```http
POST /admin-api/user-details
```

### Request Body

```json
{
  "userId": "USER_ID"
}
```

---

## User Status

```http
PATCH /admin-api/user-status
```

### Request Body

```json
{
  "userId": "USER_ID",
  "isUserActive": true
}
```

---

## All Requests

```http
GET /admin-api/requests
```

---

## Open Requests

```http
GET /admin-api/open-requests
```

---

## Fulfilled Requests

```http
GET /admin-api/fulfilled-requests
```

---

## Deleted Requests

```http
GET /admin-api/deleted-requests
```

---

## Request Details

```http
POST /admin-api/request-details
```

### Request Body

```json
{
  "requestNumber": "REQ-2026-00011"
}
```

---

## Force Close Request

```http
PATCH /admin-api/force-close-request
```

### Request Body

```json
{
  "requestNumber": "REQ-2026-00011"
}
```

---

## Admin Dashboard

```http
GET /admin-api/dashboard
```

---

## Statistics

```http
GET /admin-api/statistics
```

---

# Frontend Notes

## Axios Configuration

```javascript
axios.defaults.withCredentials = true;
```

---

## Authentication Storage

```text
Redux Toolkit
```

Store:

```text
user
token
role
isAuthenticated
```

---

## Route Protection

### Donor Routes

```text
DONOR
```

### Requester Routes

```text
REQUESTER
```

### Admin Routes

```text
ADMIN
```

---

## Completed Backend Status

```text
Backend Ready For Frontend Integration
```
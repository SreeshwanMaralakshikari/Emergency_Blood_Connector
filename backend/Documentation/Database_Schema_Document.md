# Emergency Blood Connector - Database Schema Document

# Database

MongoDB

Collections:

1. users
2. bloodrequests
3. donations
4. notifications

---

# User Model

Collection:

```text
users
```

## Fields

| Field | Type | Description |
|---------|---------|---------|
| _id | ObjectId | MongoDB Primary Key |
| firstName | String | User First Name |
| lastName | String | User Last Name |
| email | String | Unique Email |
| password | String | Hashed Password |
| phoneNumber | String | Unique Mobile Number |
| bloodGroup | String | Blood Group |
| state | String | User State |
| role | String | DONOR / REQUESTER / ADMIN |
| isAvailable | Boolean | Donor Availability |
| profileImageUrl | String | Profile Image |
| donationsCount | Number | Total Donations |
| totalPoints | Number | Total Reward Points |
| donorLevel | String | Donor Level |
| badges | Array | Earned Badges |
| notifications | Array | Reserved |
| lastDonationDate | Date | Last Donation Date |
| nextEligibleDonationDate | Date | Next Donation Eligibility |
| isUserActive | Boolean | Active Status |
| loginHistory | Array<Date> | Login Records |
| lastLogin | Date | Latest Login |
| availabilityUpdatedAt | Date | Availability Update Time |
| createdAt | Date | Auto Generated |
| updatedAt | Date | Auto Generated |

---

## Roles

```text
DONOR
REQUESTER
ADMIN
```

---

## Donor Levels

```text
Iron
Bronze
Silver
Gold
Platinum
Diamond
```

---

# Blood Request Model

Collection:

```text
bloodrequests
```

## Fields

| Field | Type | Description |
|---------|---------|---------|
| _id | ObjectId | MongoDB Primary Key |
| requestNumber | String | Public Request Number |
| patientName | String | Patient Name |
| patientAge | Number | Patient Age |
| patientGender | String | Patient Gender |
| bloodGroup | String | Required Blood Group |
| unitsRequired | Number | Units Needed |
| unitsFulfilled | Number | Units Collected |
| hospitalName | String | Hospital Name |
| hospitalAddress | String | Hospital Address |
| state | String | Request State |
| contactPerson | String | Contact Person |
| contactNumber | String | Contact Number |
| requestCreatedBy | ObjectId | Request Creator |
| alertLevel | String | Priority Level |
| status | String | Request Status |
| acceptedDonors | Array | Accepted Donors |
| completedDonors | Array | Completed Donors |
| priorityScore | Number | Calculated Priority |
| isHospitalVerified | Boolean | Verification Status |
| requiredByDate | Date | Required Date |
| expiresAt | Date | Auto Expiry Date |
| createdAt | Date | Auto Generated |
| updatedAt | Date | Auto Generated |

---

## Alert Levels

```text
GREEN
YELLOW
RED
BLACK
```

---

## Status Values

```text
OPEN
FULFILLED
CLOSED
EXPIRED
DELETED
```

---

# Donation Model

Collection:

```text
donations
```

## Fields

| Field | Type | Description |
|---------|---------|---------|
| donorId | ObjectId | Donor User |
| bloodRequestId | ObjectId | Related Request |
| requestNumber | String | Request Number |
| alertLevel | String | Request Alert Level |
| pointsAwarded | Number | Reward Points |
| unitsDonated | Number | Units Donated |
| donationDate | Date | Donation Date |
| nextEligibleDonationDate | Date | Next Eligible Date |
| status | String | Donation Status |
| isVerified | Boolean | Verification Flag |
| createdAt | Date | Auto Generated |
| updatedAt | Date | Auto Generated |

---

## Donation Status

```text
CONFIRMED
```

---

# Notification Model

Collection:

```text
notifications
```

## Fields

| Field | Type | Description |
|---------|---------|---------|
| userId | ObjectId | Notification Owner |
| title | String | Notification Title |
| message | String | Notification Message |
| type | String | Notification Type |
| isRead | Boolean | Read Status |
| createdAt | Date | Auto Generated |
| updatedAt | Date | Auto Generated |

---

## Notification Types

```text
REQUEST_CREATED
REQUEST_ACCEPTED
DONATION_COMPLETED
BADGE_EARNED
GENERAL
```

---

# Relationships

User → BloodRequest

```text
One User
Can Create
Many Requests
```

---

User → Donation

```text
One User
Can Complete
Many Donations
```

---

BloodRequest → Donation

```text
One Request
Can Have
Many Donations
```

---

User → Notification

```text
One User
Can Receive
Many Notifications
```
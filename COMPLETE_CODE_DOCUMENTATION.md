# Complete Code Documentation: PharmaT Audit System

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Structure](#database-structure)
4. [Frontend Pages](#frontend-pages)
5. [Backend API](#backend-api)
6. [Authentication & Authorization](#authentication--authorization)
7. [User Roles](#user-roles)
8. [Data Flow](#data-flow)
9. [Key Features](#key-features)
10. [Technical Implementation Details](#technical-implementation-details)

---

## System Overview

The **PharmaT Audit System** is a web-based application designed for managing daily visual audits of pharmacy locations. The system allows employees to submit photos of required tasks (windows, trash cans, outfits) and enables RGA (Regional General Auditor) users to review and approve/reject these submissions.

### Main Components:
- **Frontend**: HTML/CSS/JavaScript single-page applications
- **Backend**: Serverless API functions (Node.js)
- **Database**: Supabase (PostgreSQL)
- **Email Service**: Resend API (optional, with dev fallback)
- **Maps**: Yandex Maps API (for RGA dashboard)

---

## Architecture

### Technology Stack:
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Serverless functions (Vercel/Netlify compatible)
- **Database**: Supabase (PostgreSQL)
- **Storage**: SessionStorage (client-side), LocalStorage (client-side)
- **Email**: Resend API
- **Maps**: Yandex Maps API

### System Flow:
```
User → Frontend (HTML/JS) → API Endpoints → Supabase Database
                              ↓
                         Email Service (Resend)
```

---

## Database Structure

### Tables in Supabase:

#### 1. `users` Table
Stores basic user account information.

**Columns:**
- `email` (TEXT, PRIMARY KEY) - User's email address
- `role` (TEXT) - User role: 'employee' or 'rga'
- `created_at` (TIMESTAMP) - Account creation timestamp

**Purpose**: Authentication and role-based access control.

---

#### 2. `profiles` Table
Stores detailed user profile information.

**Columns:**
- `email` (TEXT, PRIMARY KEY) - User's email (foreign key to users)
- `first_name` (TEXT) - User's first name
- `last_name` (TEXT) - User's last name
- `role` (TEXT) - User role
- `pharmacies` (JSONB) - Array of assigned pharmacies
  ```json
  [
    {
      "index": 0,
      "region": "Москва",
      "address": "г. Москва, ул. Химкинский б-р, д.14, к. 4",
      "phone": "8-499-176-22-04",
      "hours": "09.00-21.00"
    }
  ]
  ```
- `created_at` (TIMESTAMP) - Profile creation timestamp

**Purpose**: Stores complete user profile with pharmacy assignments.

---

#### 3. `email_codes` Table
Stores email verification codes for registration.

**Columns:**
- `email` (TEXT) - Email address
- `code` (TEXT) - 6-digit verification code
- `expires_at` (TIMESTAMP) - Code expiration time (10 minutes)
- `used` (BOOLEAN) - Whether code has been used

**Purpose**: Email verification during registration process.

---

#### 4. `task_submissions` Table
Stores photo submissions for daily tasks.

**Columns:**
- `id` (SERIAL, PRIMARY KEY) - Unique submission ID
- `employee_email` (TEXT) - Email of employee who submitted
- `pharmacy_index` (INTEGER) - Index of pharmacy (0-83)
- `task_key` (TEXT) - Task identifier: 'window', 'trash', or 'outfit'
- `status` (TEXT) - Status: 'not_submitted', 'waiting', 'approved', 'rejected'
- `file_name` (TEXT) - Original filename
- `file_url` (TEXT) - Base64 DataURL or URL to file
- `reviewer_email` (TEXT) - Email of RGA who reviewed
- `updated_at` (TIMESTAMP) - Last update timestamp
- `reviewed_at` (TIMESTAMP) - When reviewed by RGA

**Purpose**: Tracks all task submissions and their review status.

---

#### 5. `audit_questions` Table (Referenced in audit.html)
Stores audit questionnaire questions.

**Columns:**
- `id` (SERIAL, PRIMARY KEY)
- `question_text` (TEXT) - Question content
- `question_type` (TEXT) - Type: 'text', 'multiple_choice', 'yes_no', 'rating'
- `options` (JSONB) - Options for multiple choice questions
- `order_index` (INTEGER) - Display order
- `required` (BOOLEAN) - Whether question is required

**Purpose**: Dynamic audit questionnaire system.

---

#### 6. `audit_sessions` Table (Referenced in audit.html)
Stores audit session metadata.

**Columns:**
- `id` (SERIAL, PRIMARY KEY)
- `session_name` (TEXT) - Session identifier
- `session_data` (JSONB) - Session data
- `status` (TEXT) - Session status

**Purpose**: Groups audit responses into sessions.

---

#### 7. `audit_responses` Table (Referenced in audit.html)
Stores individual audit question responses.

**Columns:**
- `id` (SERIAL, PRIMARY KEY)
- `session_id` (INTEGER) - Foreign key to audit_sessions
- `question_id` (INTEGER) - Foreign key to audit_questions
- `response` (TEXT) - User's response

**Purpose**: Stores answers to audit questions.

---

## Frontend Pages

### 1. `index.html` - Landing Page

**Purpose**: Entry point of the application.

**Features:**
- Welcome message
- Link to registration page
- Simple, clean design

**Key Elements:**
- Gradient background (purple)
- Centered white card container
- "Register" button linking to `register.html`

**Code Structure:**
- Static HTML with embedded CSS
- Responsive design (mobile-friendly)
- No JavaScript functionality

---

### 2. `register.html` - Registration Page

**Purpose**: User registration with email verification.

**Features:**
1. **Role Selection**: Choose between 'employee' or 'rga'
2. **Email Input**: Enter email address
3. **Email Verification**: Send and verify 6-digit code
4. **Password Entry**: Role-based passwords:
   - RGA: `Sosiska1`
   - Employee: `Sosiska2`
5. **Login Modal**: Allows existing users to log in

**Key Functions:**

#### Email Verification Flow:
```javascript
// 1. User enters email and clicks "Send verification code"
sendCodeBtn.addEventListener('click', async () => {
  // Calls /api/send-code
  // Receives 6-digit code (or devCode if email not configured)
  // Shows code input field
});

// 2. User enters code and clicks "Verify code"
verifyCodeBtn.addEventListener('click', async () => {
  // Calls /api/verify-code
  // Validates code and expiration
  // Marks code as verified
});
```

#### Registration Submission:
```javascript
step1Form.addEventListener('submit', function(event) {
  // Validates:
  // - Role selected
  // - Email entered
  // - Password matches role
  // - Email verified
  
  // Calls /api/register to save user
  // Stores role/email in sessionStorage
  // Redirects to profile.html
});
```

#### Login Flow:
```javascript
loginForm.addEventListener('submit', async function(event) {
  // Calls /api/login
  // Validates email/password
  // Stores role/email in sessionStorage
  // Fetches profile data
  // Redirects based on role:
  // - RGA → rga-dashboard.html
  // - Employee → welcome.html (or profile.html if incomplete)
});
```

**State Management:**
- Uses `sessionStorage` for:
  - `userRole` - Current user's role
  - `userEmail` - Current user's email
  - `profileFormData` - Cached profile data

**UI Components:**
- Form inputs with validation
- Error/success message display
- Password visibility toggle (eye icon)
- Modal for login
- Responsive design

---

### 3. `profile.html` - Profile Completion Page

**Purpose**: Complete user profile with pharmacy assignments.

**Features:**
1. **Personal Information**: First name, last name
2. **Pharmacy Selection**: 
   - Employees: Select 1 pharmacy
   - RGAs: Select up to 5 pharmacies
3. **Pharmacy List**: 84 predefined pharmacies (Moscow and Moscow Oblast)
4. **Profile Summary View**: Shows saved profile (read-only)
5. **Edit Profile**: Allows editing existing profile

**Key Functions:**

#### Pharmacy Selection:
```javascript
// Dynamic pharmacy dropdowns
function createPharmacyItem() {
  // Creates select dropdown with all 84 pharmacies
  // Each pharmacy has: region, address, phone, hours
  // Index (0-83) is used as identifier
}

// Handles selection
function handlePharmacySelection(selectElement) {
  // Prevents duplicate selections
  // Enforces pharmacy limits (1 for employees, 5 for RGAs)
  // Updates selected pharmacies display
}
```

#### Profile Submission:
```javascript
profileForm.addEventListener('submit', async function(event) {
  // Validates required fields
  // Calls /api/save-profile
  // Saves to Supabase profiles table
  // Stores in sessionStorage
  // Updates localStorage for employee/RGA assignments
  // Redirects:
  // - RGA → rga-dashboard.html
  // - Employee → welcome.html
});
```

#### Profile Restoration:
```javascript
function restoreFormValuesIfAvailable() {
  // Loads from sessionStorage
  // If profile exists, shows summary view
  // Otherwise shows form
}
```

**Pharmacy Data Structure:**
```javascript
const pharmacies = [
  {
    region: "Москва",
    address: "г. Москва, ул. Химкинский б-р, д.14, к. 4",
    phone: "8-499-176-22-04",
    hours: "09.00-21.00"
  },
  // ... 83 more pharmacies
];
```

**LocalStorage Usage:**
- `pharmacyRga`: Maps pharmacy index → RGA info
- `pharmacyEmployees`: Maps pharmacy index → array of employees

**UI Components:**
- Dynamic pharmacy selection dropdowns
- Selected pharmacies display cards
- Add/remove pharmacy buttons
- Profile summary view
- Logout button

---

### 4. `welcome.html` - Employee Dashboard

**Purpose**: Daily task submission interface for employees.

**Features:**
1. **Task Cards**: Three tasks (window, trash, outfit)
2. **File Upload**: Image upload with compression
3. **Status Tracking**: Real-time status updates
4. **Auto-refresh**: Polls server every 30-60 seconds
5. **Profile Chip**: Shows user info and links to profile

**Key Functions:**

#### State Management:
```javascript
let employeeSubmissionState = {};
// Structure:
// {
//   "0": {  // pharmacy_index
//     "window": { state, fileUrl, fileName, ... },
//     "trash": { ... },
//     "outfit": { ... }
//   }
// }
```

#### Image Upload Flow:
```javascript
async function handleUpload(file, taskKey, indexKey, input) {
  // 1. Show loading state
  // 2. Optimistic UI update (show "waiting")
  // 3. Compress image if > 500KB
  // 4. Convert to DataURL (base64)
  // 5. POST to /api/save-submission
  // 6. Update state with server response
  // 7. Refresh from server after 1 second
}
```

#### Image Compression:
```javascript
function compressImage(file, maxWidth, maxHeight, quality) {
  // Uses HTML5 Canvas API
  // Resizes image maintaining aspect ratio
  // Converts to JPEG format
  // Reduces file size before upload
  // Mobile: max 1024px, Desktop: max 1280px
}
```

#### Status Rendering:
```javascript
function renderEmployeeTasks(indexKey) {
  // Updates status chips (waiting/approved/rejected/not_submitted)
  // Updates status notes
  // Shows/hides action buttons (Open/Delete)
  // Only updates changed elements (performance optimization)
}
```

#### Auto-refresh:
```javascript
// Uses Page Visibility API
// Pauses when tab is hidden (saves resources)
// Different intervals: 60s mobile, 30s desktop
setInterval(() => {
  hydrateEmployeeState(indexKey, true)
    .then(() => renderEmployeeTasks(indexKey));
}, pollInterval);
```

**Task Definitions:**
```javascript
const TASK_DEFINITIONS = [
  { key: 'window', title: 'Send photo of a window', description: '...' },
  { key: 'trash', title: 'Send photo of trash cans', description: '...' },
  { key: 'outfit', title: 'Send photo of an outfit', description: '...' }
];
```

**Status States:**
- `not_submitted` - No submission yet
- `waiting` - Submitted, awaiting RGA review
- `approved` - Approved by RGA
- `rejected` - Rejected, needs resubmission

**UI Components:**
- Task cards with upload buttons
- Status chips with color coding
- Action buttons (Open/Delete)
- Profile chip in header
- Responsive design

---

### 5. `rga-dashboard.html` - RGA Dashboard

**Purpose**: Review and manage submissions for assigned pharmacies.

**Features:**
1. **Pharmacy Cards**: One card per assigned pharmacy
2. **Task Status**: Shows status for each task per pharmacy
3. **Review Actions**: Approve/Reject buttons
4. **Map View**: Yandex Maps showing pharmacy locations
5. **Pharmacy Modal**: Detailed view with employees and tasks
6. **Auto-refresh**: Updates every 30 seconds

**Key Functions:**

#### Map Integration:
```javascript
// Uses Yandex Maps API
async function updateMapWithPharmacies(pharmacies) {
  // Geocodes pharmacy addresses
  // Caches coordinates in localStorage
  // Creates placemarks on map
  // Fits bounds to show all pharmacies
}

async function geocodePharmacy(pharmacy) {
  // Checks cache first
  // Uses Yandex geocoding API
  // Caches results for performance
}
```

#### Submission Review:
```javascript
// Approve action
if (action === 'approve') {
  // Calls /api/update-submission-status
  // Sets status to 'approved'
  // Records reviewer email
  // Updates timestamp
}

// Reject action
if (action === 'reject') {
  // Sets status to 'rejected'
  // Employee can resubmit
}
```

#### Pharmacy Modal:
```javascript
function openPharmacyModal(pharmacy) {
  // Shows pharmacy details
  // Lists assigned employees (from localStorage)
  // Shows task statuses
  // Click outside to close
}
```

**State Management:**
```javascript
const submissionState = {};
// Structure same as employee state
// Tracks submissions for all assigned pharmacies
```

**UI Components:**
- Pharmacy cards grid layout
- Task items with status chips
- Action buttons (Approve/Reject/Open)
- Interactive map
- Modal dialog
- Profile chip

---

### 6. `audit.html` - Audit Questionnaire

**Purpose**: Dynamic audit questionnaire system.

**Features:**
1. **Dynamic Questions**: Loads from `audit_questions` table
2. **Question Types**: Text, multiple choice, yes/no, rating
3. **Progress Bar**: Shows completion percentage
4. **Response Storage**: Saves to `audit_responses` table

**Key Functions:**

#### Question Loading:
```javascript
async function loadQuestions() {
  // Fetches from Supabase audit_questions table
  // Orders by order_index
  // Renders questions dynamically
}
```

#### Question Rendering:
```javascript
function renderQuestionInput(question, index) {
  // Renders based on question_type:
  // - text: textarea
  // - multiple_choice: radio buttons
  // - yes_no: yes/no radio buttons
  // - rating: range slider (1-10)
}
```

#### Response Submission:
```javascript
async function saveAuditResponses(responses) {
  // Creates audit session
  // Saves individual responses
  // Links responses to session
}
```

**Question Types:**
- `text` - Free text input
- `multiple_choice` - Radio button selection
- `yes_no` - Yes/No selection
- `rating` - 1-10 scale slider

---

## Backend API

All API endpoints are serverless functions compatible with Vercel/Netlify.

### API Endpoints:

#### 1. `/api/register` - User Registration

**Method**: POST

**Request Body:**
```json
{
  "role": "employee" | "rga",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "data": [{ "email": "...", "role": "..." }]
}
```

**Functionality:**
- Validates role and email
- Inserts into `users` table
- Returns created user data

**Error Handling:**
- 400: Missing fields
- 500: Database error

---

#### 2. `/api/login` - User Authentication

**Method**: POST

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Sosiska1" | "Sosiska2"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Login successful",
  "role": "employee" | "rga",
  "email": "user@example.com"
}
```

**Functionality:**
- Looks up user by email
- Validates password based on role
- Returns user role and email

**Password Rules:**
- RGA: `Sosiska1`
- Employee: `Sosiska2`

**Error Handling:**
- 400: Missing fields
- 401: Invalid credentials
- 500: Database error

---

#### 3. `/api/check-email` - Email Existence Check

**Method**: POST

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "exists": true | false
}
```

**Functionality:**
- Checks if email exists in `users` table
- Used to prevent duplicate registrations

---

#### 4. `/api/send-code` - Send Verification Code

**Method**: POST

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "ok": true,
  "message": "Verification code sent to your email",
  "emailSent": true
}
```

**Response (Dev Mode):**
```json
{
  "ok": true,
  "devCode": "123456",
  "note": "Email provider not configured..."
}
```

**Functionality:**
1. Generates 6-digit random code
2. Saves to `email_codes` table with 10-minute expiration
3. Attempts to send email via Resend API
4. Falls back to dev mode if email not configured

**Email Template:**
- HTML formatted email
- Shows code prominently
- Includes expiration notice

**Error Handling:**
- 400: Invalid email format
- 500: Database/email service error

---

#### 5. `/api/verify-code` - Verify Email Code

**Method**: POST

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "ok": true
}
```

**Functionality:**
1. Looks up code in `email_codes` table
2. Validates code matches and not expired
3. Checks if already used
4. Marks code as used
5. Returns success

**Error Handling:**
- 400: Invalid/expired code
- 500: Database error

---

#### 6. `/api/get-profile` - Get User Profile

**Method**: GET

**Query Parameters:**
- `email` - User's email address

**Response:**
```json
{
  "ok": true,
  "profile": {
    "email": "...",
    "first_name": "...",
    "last_name": "...",
    "role": "...",
    "pharmacies": [...]
  }
}
```

**Functionality:**
- Fetches profile from `profiles` table
- Returns null if profile doesn't exist

**Error Handling:**
- 400: Missing email
- 500: Database error

---

#### 7. `/api/save-profile` - Save User Profile

**Method**: POST

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "pharmacies": [
    {
      "index": 0,
      "region": "Москва",
      "address": "...",
      "phone": "...",
      "hours": "..."
    }
  ],
  "role": "employee" | "rga",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Profile saved successfully",
  "profile": { ... }
}
```

**Functionality:**
1. Validates required fields
2. Validates pharmacy count based on role:
   - Employee: max 1 pharmacy
   - RGA: max 5 pharmacies
3. Upserts profile (updates if exists, inserts if new)
4. Returns saved profile

**Error Handling:**
- 400: Missing fields or invalid pharmacy count
- 500: Database error

---

#### 8. `/api/get-submissions` - Get Task Submissions

**Method**: GET

**Query Parameters:**
- `email` - Filter by employee email
- `pharmacies` - Comma-separated pharmacy indices
- `role` - 'employee' or 'rga'

**Response:**
```json
{
  "ok": true,
  "submissions": [
    {
      "id": 1,
      "employee_email": "...",
      "pharmacy_index": 0,
      "task_key": "window",
      "status": "waiting",
      "file_name": "...",
      "file_url": "...",
      "reviewer_email": null,
      "updated_at": "...",
      "reviewed_at": null
    }
  ]
}
```

**Functionality:**
- Builds Supabase query with filters
- Orders by `updated_at` descending
- Returns array of submissions

**Query Building:**
```javascript
// Filters by employee_email if role is 'employee'
// Filters by pharmacy_index if pharmacies provided
// Uses Supabase REST API with query parameters
```

**Error Handling:**
- 500: Database error

---

#### 9. `/api/save-submission` - Save Task Submission

**Method**: POST

**Request Body:**
```json
{
  "email": "employee@example.com",
  "pharmacyIndex": 0,
  "taskKey": "window",
  "fileName": "photo.jpg",
  "fileUrl": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "ok": true,
  "submission": { ... }
}
```

**Functionality:**
1. Validates required fields
2. Inserts/updates submission in `task_submissions` table
3. Sets status to 'waiting'
4. Stores file as base64 DataURL
5. Returns created submission

**Merge Strategy:**
- Uses `Prefer: resolution=merge-duplicates`
- Updates existing submission if same employee/pharmacy/task

**Error Handling:**
- 400: Missing required fields
- 500: Database error

---

#### 10. `/api/delete-submission` - Delete Task Submission

**Method**: POST

**Request Body:**
```json
{
  "email": "employee@example.com",
  "pharmacyIndex": 0,
  "taskKey": "window"
}
```

**Response:**
```json
{
  "ok": true
}
```

**Functionality:**
- Deletes submission from `task_submissions` table
- Uses Supabase DELETE with filters

**Error Handling:**
- 400: Missing required fields
- 500: Database error

---

#### 11. `/api/update-submission-status` - Update Submission Status

**Method**: POST

**Request Body:**
```json
{
  "employeeEmail": "employee@example.com",
  "pharmacyIndex": 0,
  "taskKey": "window",
  "status": "approved" | "rejected",
  "reviewerEmail": "rga@example.com"
}
```

**Response:**
```json
{
  "ok": true,
  "submission": { ... }
}
```

**Functionality:**
1. Updates submission status
2. Records reviewer email
3. Sets `reviewed_at` timestamp
4. Returns updated submission

**Error Handling:**
- 400: Missing required fields
- 500: Database error

---

## Authentication & Authorization

### Authentication Flow:

1. **Registration:**
   - User selects role (employee/rga)
   - Enters email
   - Receives verification code via email
   - Verifies code
   - Enters role-specific password
   - Account created in `users` table

2. **Login:**
   - User enters email and password
   - System validates credentials
   - Stores role/email in sessionStorage
   - Redirects based on role and profile completion

3. **Session Management:**
   - Uses `sessionStorage` (cleared on browser close)
   - Stores: `userRole`, `userEmail`, `profileFormData`
   - No server-side sessions (stateless)

### Authorization:

**Role-Based Access:**
- **Employee**: Can only view/edit their own submissions
- **RGA**: Can view/review submissions for assigned pharmacies

**Profile-Based Routing:**
- Incomplete profile → Redirected to `profile.html`
- Complete profile → Access to dashboard

---

## User Roles

### Employee Role

**Capabilities:**
- Submit photos for 3 daily tasks
- View submission status
- Delete own submissions
- View assigned pharmacy

**Limitations:**
- Can only be assigned to 1 pharmacy
- Cannot review submissions
- Cannot view other employees' submissions

**Dashboard:** `welcome.html`

---

### RGA Role

**Capabilities:**
- Review submissions for assigned pharmacies
- Approve/reject submissions
- View map of assigned pharmacies
- View employee lists per pharmacy
- View all task statuses

**Limitations:**
- Can be assigned up to 5 pharmacies
- Cannot submit tasks
- Can only review submissions for assigned pharmacies

**Dashboard:** `rga-dashboard.html`

**Passwords:**
- RGA: `Sosiska1`
- Employee: `Sosiska2`

---

## Data Flow

### Submission Flow (Employee):

```
1. Employee opens welcome.html
   ↓
2. System loads profile from sessionStorage/API
   ↓
3. Determines assigned pharmacy index
   ↓
4. Fetches existing submissions from /api/get-submissions
   ↓
5. Renders task cards with current status
   ↓
6. Employee selects photo file
   ↓
7. Image compressed (if > 500KB)
   ↓
8. Converted to base64 DataURL
   ↓
9. POST to /api/save-submission
   ↓
10. Saved to task_submissions table
    ↓
11. UI updates optimistically
    ↓
12. Auto-refresh fetches latest status
```

### Review Flow (RGA):

```
1. RGA opens rga-dashboard.html
   ↓
2. System loads profile with assigned pharmacies
   ↓
3. Fetches submissions for all assigned pharmacies
   ↓
4. Renders pharmacy cards with task statuses
   ↓
5. RGA clicks "Approve" or "Reject"
   ↓
6. POST to /api/update-submission-status
   ↓
7. Database updated with new status
   ↓
8. UI updates immediately
   ↓
9. Employee sees updated status on next refresh
```

### Registration Flow:

```
1. User opens register.html
   ↓
2. Selects role and enters email
   ↓
3. Clicks "Send verification code"
   ↓
4. POST to /api/send-code
   ↓
5. Code generated and saved to email_codes table
   ↓
6. Email sent via Resend API (or devCode shown)
   ↓
7. User enters code
   ↓
8. POST to /api/verify-code
   ↓
9. Code validated and marked as used
   ↓
10. User enters password
    ↓
11. Form submitted
    ↓
12. POST to /api/register
    ↓
13. User created in users table
    ↓
14. Redirected to profile.html
```

---

## Key Features

### 1. Image Compression

**Purpose**: Reduce file sizes before upload.

**Implementation:**
- Uses HTML5 Canvas API
- Resizes images maintaining aspect ratio
- Converts to JPEG format
- Mobile: max 1024px, Desktop: max 1280px
- Only compresses if file > 500KB

**Benefits:**
- Faster uploads
- Reduced storage costs
- Better mobile performance

---

### 2. Optimistic UI Updates

**Purpose**: Provide instant feedback to users.

**Implementation:**
- UI updates immediately before server confirmation
- Shows "waiting" status immediately after upload
- Reverts on error

**Benefits:**
- Perceived faster performance
- Better user experience

---

### 3. Auto-refresh with Page Visibility

**Purpose**: Keep data synchronized without manual refresh.

**Implementation:**
- Uses `setInterval` for polling
- Pauses when tab is hidden (Page Visibility API)
- Different intervals: 60s mobile, 30s desktop

**Benefits:**
- Real-time updates
- Battery efficient
- Reduces unnecessary requests

---

### 4. Email Verification

**Purpose**: Ensure valid email addresses during registration.

**Implementation:**
- Generates 6-digit random code
- Stores in database with expiration
- Sends via Resend API
- Dev fallback shows code on screen

**Security:**
- Codes expire after 10 minutes
- Codes marked as used after verification
- One code per email at a time

---

### 5. Geocoding & Maps

**Purpose**: Visualize pharmacy locations for RGAs.

**Implementation:**
- Uses Yandex Maps API
- Geocodes pharmacy addresses
- Caches coordinates in localStorage
- Creates interactive map with placemarks

**Benefits:**
- Visual representation
- Easy navigation
- Cached for performance

---

### 6. State Management

**Purpose**: Efficient data handling and UI updates.

**Implementation:**
- Client-side state objects
- Merges server data with local state
- Only updates changed elements
- Uses timestamps for conflict resolution

**State Structure:**
```javascript
{
  "pharmacy_index": {
    "task_key": {
      state: "waiting",
      fileUrl: "...",
      fileName: "...",
      employeeEmail: "...",
      reviewerEmail: "...",
      updatedAt: "...",
      reviewedAt: "..."
    }
  }
}
```

---

### 7. Responsive Design

**Purpose**: Works on all device sizes.

**Implementation:**
- CSS media queries
- Mobile-first approach
- Flexible layouts (flexbox, grid)
- Touch-friendly buttons (min 44px)

**Breakpoints:**
- Desktop: > 768px
- Tablet: 480px - 768px
- Mobile: < 480px

---

## Technical Implementation Details

### Error Handling

**Frontend:**
- Try-catch blocks around async operations
- User-friendly error messages
- Fallback UI states
- Console logging for debugging

**Backend:**
- HTTP status codes (400, 401, 500)
- Error messages in JSON responses
- Console logging for debugging
- Graceful degradation

---

### Security Considerations

1. **Password Storage**: Passwords are hardcoded (not secure for production)
2. **Email Verification**: Prevents invalid emails
3. **Role-Based Access**: Enforced in frontend and backend
4. **Input Validation**: All inputs validated before processing
5. **URL Encoding**: Prevents injection attacks
6. **Noopener**: Prevents tabnabbing attacks

**Improvements Needed:**
- Hash passwords in database
- Implement JWT tokens
- Add CSRF protection
- Rate limiting on API endpoints

---

### Performance Optimizations

1. **Image Compression**: Reduces upload size
2. **Conditional Rendering**: Only updates changed elements
3. **Event Delegation**: Single listener instead of many
4. **Caching**: sessionStorage, localStorage, coordinate cache
5. **Lazy Loading**: Map loads only when needed
6. **Page Visibility API**: Pauses polling when hidden

---

### Browser Compatibility

**Supported:**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- ES6+ JavaScript features

**Required APIs:**
- Fetch API
- FileReader API
- Canvas API
- SessionStorage/LocalStorage
- Page Visibility API

---

### Code Organization

**Frontend:**
- Single HTML file per page
- Embedded CSS and JavaScript
- No build process required
- Easy to deploy

**Backend:**
- Serverless functions
- One file per endpoint
- Standardized request/response format
- Error handling in each function

---

## Deployment

### Frontend:
- Static HTML files
- Can be deployed to any static hosting (Netlify, Vercel, GitHub Pages)

### Backend:
- Serverless functions
- Compatible with Vercel, Netlify Functions
- Requires environment variables:
  - `RESEND_API_KEY` (optional)

### Database:
- Supabase (hosted PostgreSQL)
- No deployment needed

---

## Future Enhancements

1. **Real-time Updates**: WebSocket support for instant updates
2. **File Storage**: Move from base64 to cloud storage (S3, Supabase Storage)
3. **Authentication**: JWT tokens, OAuth integration
4. **Notifications**: Email/push notifications for status changes
5. **Analytics**: Dashboard with submission statistics
6. **Mobile App**: Native mobile application
7. **Offline Support**: Service workers for offline functionality
8. **Multi-language**: Support for multiple languages

---

## Conclusion

This documentation covers all aspects of the PharmaT Audit System, including:
- Database structure and relationships
- Frontend pages and their functionality
- Backend API endpoints
- Authentication and authorization flows
- Data flow diagrams
- Key features and implementations
- Technical details and optimizations

The system is designed to be simple, efficient, and user-friendly while maintaining scalability for future enhancements.


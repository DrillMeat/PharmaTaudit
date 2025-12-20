# Code Documentation: welcome.html - Daily Tasks Dashboard

## Overview
This file (`welcome.html`) is a single-page web application that serves as a task submission dashboard for pharmacy employees. It allows employees to upload photos for three daily visual tasks (window, trash cans, outfit) and track their submission status. The application uses HTML, CSS, and JavaScript, communicating with a backend API that stores data in Supabase.

---

## 1. HTML STRUCTURE (Lines 1-521)

### 1.1 Document Head (Lines 1-6)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <title>Daily Tasks | PharmaT Audit</title>
```

**Purpose:**
- Declares HTML5 document type
- Sets language to English
- Defines character encoding (UTF-8) for international characters
- Configures viewport for responsive design on mobile devices
- Sets page title shown in browser tab

**Key Features:**
- `maximum-scale=5.0, user-scalable=yes` allows zooming for accessibility

---

### 1.2 CSS Styles (Lines 7-454)

#### 1.2.1 Global Reset (Lines 8-10)
```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

**Purpose:** Ensures padding and borders are included in element width calculations, preventing layout issues.

#### 1.2.2 Body Styling (Lines 12-23)
```css
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0;
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  color: #1f2933;
  overflow-x: hidden;
}
```

**Purpose:**
- Sets modern font stack (falls back to system fonts)
- Creates purple gradient background
- Uses flexbox to center content vertically and horizontally
- Prevents horizontal scrolling
- Sets base text color

#### 1.2.3 Dashboard Container (Lines 25-34)
```css
.dashboard {
  width: 100%;
  max-width: 900px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 18px 40px rgba(31, 45, 61, 0.18);
  padding: 36px 40px 44px;
  position: relative;
  overflow-x: hidden;
}
```

**Purpose:** Creates the main white card container with rounded corners and shadow for depth.

#### 1.2.4 Header Section (Lines 36-57)
```css
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 32px;
  width: 100%;
  flex-wrap: wrap;
}
```

**Purpose:** Flexbox layout for header with title on left and profile chip on right. `flex-wrap` allows stacking on small screens.

#### 1.2.5 Profile Chip (Lines 59-91)
```css
.profile-chip {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #d1d9e6;
  color: #1f2933;
  text-decoration: none;
  transition: all 0.2s ease;
  max-width: 100%;
  overflow: hidden;
}
```

**Purpose:** Creates a pill-shaped button/link showing user profile info. Includes hover effects for interactivity.

#### 1.2.6 Task Cards (Lines 115-132)
```css
.task-card {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
  margin-bottom: 18px;
  width: 100%;
  overflow-x: hidden;
}
```

**Purpose:** Individual card for each task. Flexbox layout separates task info from status. Includes subtle shadow for elevation.

#### 1.2.7 Status Chips (Lines 188-230)
```css
.status-chip {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background: #e2e8f0;
  color: #1f2933;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: default;
}
```

**Purpose:** Visual indicators for task status. Different classes provide color coding:
- `.status-waiting` - Yellow (awaiting review)
- `.status-approved` - Green (approved)
- `.status-rejected` - Red (needs resubmission)
- `.status-not-submitted` - Gray (not yet submitted)

#### 1.2.8 Responsive Design (Lines 272-453)
```css
@media (max-width: 768px) { ... }
@media (max-width: 480px) { ... }
```

**Purpose:** Media queries adjust layout for tablets (768px) and phones (480px):
- Reduces padding and font sizes
- Stacks elements vertically
- Makes buttons full-width for easier tapping
- Adjusts spacing for smaller screens

---

### 1.3 HTML Body Structure (Lines 456-521)

#### 1.3.1 Dashboard Container (Line 457)
```html
<div class="dashboard" id="dashboardContainer">
```

**Purpose:** Main container element that JavaScript manipulates.

#### 1.3.2 Header Section (Lines 458-470)
```html
<div class="header">
  <div>
    <h1>Daily Visual Tasks</h1>
    <p>Please upload today's photos so the management team can review them.</p>
  </div>
  <a href="profile.html" class="profile-chip" title="Go to profile" id="profileLink">
    <span id="profileInitials">P</span>
    <div>
      <div id="chipName" style="font-weight:600; color:#1f2933;">—</div>
      <small id="chipEmail" style="color:#52606d;">—</small>
    </div>
  </a>
</div>
```

**Purpose:**
- Displays page title and instructions
- Profile chip shows user initials, name, and email (populated by JavaScript)
- Links to profile page

#### 1.3.3 Tasks Section (Lines 472-520)
```html
<div class="tasks-section" id="tasksSection">
  <h2>Required submissions</h2>
  <p>Make sure images are clear, recent, and taken in landscape orientation when possible.</p>
  
  <div class="task-card" data-task-key="window">
    ...
  </div>
  <!-- Similar cards for "trash" and "outfit" -->
</div>
```

**Purpose:**
- Container for all task cards
- Each task card has:
  - `data-task-key` attribute (used by JavaScript to identify tasks)
  - Task title and description
  - File upload button (`<input type="file">`)
  - Status chip showing current state
  - Status note with additional info

**Key Attributes:**
- `accept="image/*"` - Only allows image files
- `capture="environment"` - On mobile, opens camera instead of file picker
- `data-status-label` and `data-status-note` - JavaScript targets these to update status

---

## 2. JAVASCRIPT FUNCTIONALITY (Lines 523-1184)

### 2.1 IIFE Wrapper (Line 524)
```javascript
(function() {
  // All code here
})();
```

**Purpose:** Immediately Invoked Function Expression (IIFE) creates a private scope, preventing variable pollution of global namespace.

---

### 2.2 DOM Element References (Lines 525-528)
```javascript
const link = document.getElementById('profileLink');
const tasksSection = document.getElementById('tasksSection');
const dashboardContainer = document.getElementById('dashboardContainer');
if (!link || !dashboardContainer) return;
```

**Purpose:** Gets references to key DOM elements. Early return if critical elements missing (defensive programming).

---

### 2.3 Constants and Configuration (Lines 530-548)

#### Task Definitions (Lines 530-534)
```javascript
const TASK_DEFINITIONS = [
  { key: 'window', title: 'Send photo of a window', description: '...' },
  { key: 'trash', title: 'Send photo of trash cans', description: '...' },
  { key: 'outfit', title: 'Send photo of an outfit', description: '...' }
];
```

**Purpose:** Centralized configuration of all tasks. Makes it easy to add/modify tasks.

#### Status Labels and Classes (Lines 536-548)
```javascript
const STATUS_LABELS = {
  not_submitted: 'Not submitted',
  waiting: 'Waiting for approval',
  approved: 'Approved',
  rejected: 'Not approved'
};

const STATUS_CLASSES = {
  not_submitted: 'status-not-submitted',
  waiting: 'status-waiting',
  approved: 'status-approved',
  rejected: 'status-rejected'
};
```

**Purpose:** Maps internal status codes to user-friendly labels and CSS classes. Maintains consistency across the app.

---

### 2.4 State Variables (Lines 550-554)
```javascript
let userEmail = '';
let userRole = '';
let activePharmacyIndex = null;
let employeeSubmissionState = {};
let employeeRefreshTimer = null;
```

**Purpose:**
- `userEmail` - Current user's email (from sessionStorage)
- `userRole` - User's role ('employee' or 'rga')
- `activePharmacyIndex` - Which pharmacy the employee is assigned to
- `employeeSubmissionState` - Object storing submission data: `{ pharmacyIndex: { taskKey: { state, fileUrl, ... } } }`
- `employeeRefreshTimer` - Reference to interval timer for auto-refresh

---

### 2.5 Helper Functions

#### 2.5.1 buildProfileHref (Lines 556-562)
```javascript
function buildProfileHref(role, email) {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  if (email) params.set('email', email);
  const suffix = params.toString();
  return suffix ? `profile.html?${suffix}` : 'profile.html';
}
```

**Purpose:** Constructs URL with query parameters for profile page. Uses URLSearchParams API for safe URL encoding.

#### 2.5.2 setTaskStatusMessage (Lines 564-575)
```javascript
function setTaskStatusMessage(taskKey, message, options = {}) {
  const card = document.querySelector(`.task-card[data-task-key="${taskKey}"]`);
  const note = card?.querySelector('[data-status-note]');
  if (!note) return;
  note.textContent = message;
  if (options.color) {
    note.style.color = options.color;
  }
  // ...
}
```

**Purpose:** Updates status note text and styling. Used for success/error messages. Optional chaining (`?.`) prevents errors if element not found.

#### 2.5.3 compressImage (Lines 577-618)
```javascript
function compressImage(file, maxWidth = 1280, maxHeight = 1280, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Calculate new dimensions
        // Draw image to canvas
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
```

**Purpose:** 
- Reduces image file size before upload
- Uses HTML5 Canvas API to resize images
- Maintains aspect ratio
- Converts to JPEG format
- Returns Promise for async handling

**Process:**
1. Read file as DataURL
2. Create Image object
3. Calculate scaling ratio
4. Draw to canvas at new size
5. Convert canvas to Blob (binary data)

#### 2.5.4 showUploadProgress (Lines 620-649)
```javascript
function showUploadProgress(taskKey, isLoading) {
  const card = document.querySelector(`.task-card[data-task-key="${taskKey}"]`);
  if (!card) return;
  
  const uploadBtn = card.querySelector('.upload-btn');
  if (isLoading) {
    uploadBtn.disabled = true;
    uploadBtn.style.opacity = '0.6';
    uploadBtn.innerHTML = '<span style="...">⏳</span> Uploading...';
  } else {
    // Restore original state
  }
}
```

**Purpose:** Provides visual feedback during upload:
- Disables button to prevent double-submission
- Shows loading spinner
- Updates status note
- Restores original state when done

#### 2.5.5 openFileUrl (Lines 651-667)
```javascript
function openFileUrl(fileUrl, fileName = 'submission') {
  if (!fileUrl) return;
  try {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    window.open(fileUrl, '_blank', 'noopener');
  }
}
```

**Purpose:** Opens submitted file in new tab/window. Creates temporary anchor element, clicks it programmatically, then removes it. Falls back to `window.open()` if that fails.

**Security:** `rel="noopener"` prevents new window from accessing parent window (prevents tabnabbing attacks).

---

### 2.6 Data Management Functions

#### 2.6.1 createEmptyTaskEntry (Lines 669-680)
```javascript
function createEmptyTaskEntry(overrides = {}) {
  return Object.assign({
    state: 'not_submitted',
    submitted: false,
    fileName: '',
    fileUrl: '',
    employeeEmail: '',
    reviewerEmail: '',
    updatedAt: null,
    reviewedAt: null
  }, overrides);
}
```

**Purpose:** Factory function creates standardized task entry object. `Object.assign()` merges defaults with overrides.

#### 2.6.2 createEmptyTaskMap (Lines 682-687)
```javascript
function createEmptyTaskMap() {
  return TASK_DEFINITIONS.reduce((acc, task) => {
    acc[task.key] = createEmptyTaskEntry();
    return acc;
  }, {});
}
```

**Purpose:** Creates object with all tasks initialized to empty state. Uses `reduce()` to build object from array.

**Result:** `{ window: {...}, trash: {...}, outfit: {...} }`

#### 2.6.3 formatStatusNote (Lines 689-700)
```javascript
function formatStatusNote(status, entry) {
  switch (status) {
    case 'waiting':
      return `Submitted by ${entry.employeeEmail || 'employee'} • Awaiting review by RGA.`;
    case 'approved':
      return entry.reviewerEmail ? `Approved by ${entry.reviewerEmail}.` : 'Approved by RGA.';
    case 'rejected':
      return 'RGA requested a new submission.';
    default:
      return 'No submission yet.';
  }
}
```

**Purpose:** Generates human-readable status messages based on task state. Switch statement handles different statuses.

---

### 2.7 API Communication Functions

#### 2.7.1 fetchSubmissions (Lines 703-713)
```javascript
async function fetchSubmissions(query) {
  const params = new URLSearchParams(query);
  const response = await fetch(`/api/get-submissions?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Unable to fetch submissions');
  }
  const data = await response.json();
  if (!data?.ok) throw new Error('Unexpected response');
  return data.submissions || [];
}
```

**Purpose:** 
- Fetches submissions from backend API
- Uses `async/await` for asynchronous operations
- Builds query string from parameters
- Handles errors gracefully
- Returns array of submissions

**API Endpoint:** `/api/get-submissions` (see `api/get-submissions.js`)

#### 2.7.2 mergeSubmissionsIntoState (Lines 715-738)
```javascript
function mergeSubmissionsIntoState(targetState, submissions) {
  submissions.forEach(item => {
    if (!item || !item.task_key) return;
    const indexKey = String(item.pharmacy_index);
    if (!targetState[indexKey]) {
      targetState[indexKey] = createEmptyTaskMap();
    }
    const existing = targetState[indexKey][item.task_key] || createEmptyTaskEntry();
    const incomingUpdatedAt = item.updated_at ? new Date(item.updated_at).getTime() : 0;
    const existingUpdatedAt = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
    if (!existing.updatedAt || incomingUpdatedAt >= existingUpdatedAt) {
      // Update with newer data
    }
  });
}
```

**Purpose:**
- Merges API data into local state
- Handles multiple pharmacies (indexed by `pharmacy_index`)
- Only updates if incoming data is newer (prevents overwriting with stale data)
- Converts timestamps to milliseconds for comparison

**State Structure:**
```
{
  "0": {  // pharmacy_index
    "window": { state: "waiting", fileUrl: "...", ... },
    "trash": { ... },
    "outfit": { ... }
  }
}
```

---

### 2.8 UI Rendering Functions

#### 2.8.1 renderEmployeeTasks (Lines 740-790)
```javascript
function renderEmployeeTasks(indexKey) {
  const cards = document.querySelectorAll('.task-card');
  const taskState = employeeSubmissionState[indexKey] || createEmptyTaskMap();

  cards.forEach(card => {
    const key = card.dataset.taskKey;
    const statusChip = card.querySelector('[data-status-label]');
    const entry = taskState[key] || createEmptyTaskEntry();
    const status = entry.state || 'not_submitted';

    // Update status chip
    if (statusChip && statusChip.textContent !== (STATUS_LABELS[status] || STATUS_LABELS.waiting)) {
      statusChip.textContent = STATUS_LABELS[status];
      statusChip.className = `status-chip ${STATUS_CLASSES[status]}`;
    }

    // Update status note
    // Show/hide action buttons (Open/Delete)
  });
}
```

**Purpose:** 
- Updates UI to reflect current state
- Only updates changed elements (performance optimization)
- Shows/hides action buttons based on submission status
- Dynamically creates buttons if needed

**Key Logic:**
- Finds each task card by `data-task-key`
- Looks up state for that task
- Updates status chip text and CSS class
- Updates status note
- Conditionally shows "Open" and "Delete" buttons

---

### 2.9 State Hydration (Lines 792-816)
```javascript
async function hydrateEmployeeState(indexKey, skipRender = false) {
  if (!userEmail || indexKey === null || isHydrating) return;
  isHydrating = true;
  try {
    const submissions = await fetchSubmissions({ email: userEmail, pharmacies: indexKey, role: 'employee' });
    if (!employeeSubmissionState[indexKey]) {
      employeeSubmissionState[indexKey] = createEmptyTaskMap();
    }
    mergeSubmissionsIntoState(employeeSubmissionState, submissions);
    if (!skipRender) {
      renderEmployeeTasks(indexKey);
    }
  } catch (error) {
    console.warn('Unable to load submissions', error);
    // Fallback to empty state
  } finally {
    isHydrating = false;
  }
}
```

**Purpose:**
- Loads submission data from server
- Merges into local state
- Optionally renders UI (`skipRender` flag prevents unnecessary renders during polling)
- Uses `isHydrating` flag to prevent concurrent requests
- Handles errors gracefully

**Called:**
- On page load
- Periodically via timer (polling)
- After uploads

---

### 2.10 File Upload Handler (Lines 818-948)

#### Main Upload Function
```javascript
async function handleUpload(file, taskKey, indexKey, input) {
  if (!file) return;
  
  // Show loading state
  showUploadProgress(taskKey, true);
  
  try {
    // Optimistic UI update
    employeeSubmissionState[indexKey][taskKey] = createEmptyTaskEntry({
      state: 'waiting',
      submitted: true,
      fileName: file.name,
      // ...
    });
    renderEmployeeTasks(indexKey);
    
    // Compress image if needed
    let processedFile = file;
    if (file.type.startsWith('image/') && file.size > 500 * 1024) {
      const isMobile = window.innerWidth <= 768;
      const maxSize = isMobile ? 1024 : 1280;
      processedFile = await compressImage(file, maxSize, maxSize, 0.75);
    }
    
    // Convert to DataURL
    const fileUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(processedFile);
    });
    
    // Send to server
    const response = await fetch('/api/save-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        pharmacyIndex: Number(indexKey),
        taskKey,
        fileName: fileName,
        fileUrl
      })
    });
    
    // Update state with server response
    // Show success message
    // Refresh from server after delay
  } catch (error) {
    // Handle errors
    // Reset to previous state
  }
}
```

**Purpose:** Complete upload workflow:

1. **Validation:** Checks file exists
2. **Optimistic Update:** Immediately shows "waiting" status (better UX)
3. **Image Compression:** Reduces file size if > 500KB
   - Smaller dimensions on mobile (1024px vs 1280px)
   - Converts to JPEG
4. **File Conversion:** Converts Blob to DataURL (base64 string) for JSON transmission
5. **API Call:** Sends to `/api/save-submission`
6. **State Update:** Merges server response
7. **Success Feedback:** Shows success message
8. **Refresh:** Fetches latest data after 1 second
9. **Error Handling:** Reverts UI on failure

**Key Features:**
- Optimistic UI (feels instant)
- Progressive enhancement (works even if compression fails)
- Mobile optimization (smaller images)
- Error recovery

---

### 2.11 Delete Handler (Lines 950-977)
```javascript
async function handleDelete(taskKey, indexKey) {
  try {
    const response = await fetch('/api/delete-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        pharmacyIndex: Number(indexKey),
        taskKey
      })
    });
    const data = await response.json();
    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || 'Failed to delete submission');
    }
    // Reset to empty state
    employeeSubmissionState[indexKey][taskKey] = createEmptyTaskEntry();
    renderEmployeeTasks(indexKey);
  } catch (error) {
    setTaskStatusMessage(taskKey, 'Unable to delete photo right now. Please try again later.', {
      color: '#b91c1c',
      fontWeight: '600'
    });
  }
}
```

**Purpose:** Deletes submission from server and updates UI. Resets task to "not_submitted" state.

---

### 2.12 Event Binding (Lines 979-1062)

#### File Input Listeners (Lines 981-1013)
```javascript
function bindEmployeeEvents(indexKey) {
  const fileInputs = document.querySelectorAll('.task-card input[type="file"]');
  fileInputs.forEach(input => {
    // Remove existing listeners by cloning
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    
    newInput.addEventListener('change', async () => {
      const card = newInput.closest('.task-card');
      const taskKey = card.dataset.taskKey;
      const file = newInput.files?.[0];
      
      // Validate file size
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setTaskStatusMessage(taskKey, 'File too large...');
        newInput.value = '';
        return;
      }
      
      await handleUpload(file, taskKey, indexKey, newInput);
    }, { passive: true });
  });
```

**Purpose:**
- Attaches change listeners to file inputs
- Clones inputs to remove old listeners (prevents duplicates)
- Validates file size (max 10MB)
- Calls upload handler
- `{ passive: true }` improves scroll performance

#### Click Event Delegation (Lines 1015-1062)
```javascript
dashboardContainer.addEventListener('click', async (event) => {
  const btn = event.target.closest('.task-action-btn');
  if (btn) {
    const action = btn.dataset.action;
    const taskKey = btn.dataset.task;
    const idx = btn.dataset.pharmacyIndex;
    if (action === 'open') {
      // Open file
    } else if (action === 'delete') {
      await handleDelete(taskKey, idx);
    }
    return;
  }
  
  const chip = event.target.closest('.status-chip');
  if (chip) {
    // Open file when clicking status chip
  }
}, { passive: true });
```

**Purpose:**
- Uses event delegation (single listener on container)
- Handles clicks on dynamically created buttons
- Opens files when clicking status chips
- More efficient than individual listeners

**Event Delegation Benefits:**
- Works with dynamically added elements
- Single listener (better performance)
- Less memory usage

---

### 2.13 Profile Data Resolution (Lines 1064-1086)
```javascript
async function resolveProfileData(email) {
  const stored = sessionStorage.getItem('profileFormData');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (err) {
      console.warn('Failed to parse stored profile data', err);
    }
  }
  if (!email) return null;
  try {
    const response = await fetch(`/api/get-profile?email=${encodeURIComponent(email)}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data?.profile) {
      sessionStorage.setItem('profileFormData', JSON.stringify(data.profile));
    }
    return data?.profile || null;
  } catch (error) {
    console.warn('Unable to fetch profile', error);
    return null;
  }
}
```

**Purpose:**
- Checks sessionStorage first (caching)
- Falls back to API if not cached
- Stores result in sessionStorage for future use
- Returns null on error

**Caching Benefits:**
- Faster page loads
- Reduces API calls
- Works offline (for cached data)

---

### 2.14 Initialization Function (Lines 1088-1180)

```javascript
async function init() {
  try {
    // Get user data from sessionStorage
    userRole = sessionStorage.getItem('userRole') || '';
    userEmail = sessionStorage.getItem('userEmail') || '';
    link.href = buildProfileHref(userRole, userEmail);

    // Update profile chip
    const profileData = await resolveProfileData(userEmail);
    if (profileData) {
      nameEl.textContent = `${firstName} ${lastName}`.trim() || 'Employee';
      emailEl.textContent = userEmail || '—';
      const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      initialsEl.textContent = initials || (userEmail?.charAt(0).toUpperCase() || 'E');
    }

    // Redirect RGA users
    if (userRole && userRole.toLowerCase() === 'rga') {
      // Show link to RGA dashboard
      return;
    }

    // Check if profile exists
    if (!profileData) {
      window.location.href = 'profile.html';
      return;
    }

    // Get assigned pharmacy
    const assigned = profileData.pharmacies?.[0];
    const indexKey = assigned?.index !== undefined ? String(assigned.index) : null;
    if (!indexKey) {
      window.location.href = 'profile.html';
      return;
    }

    // Initialize state
    activePharmacyIndex = indexKey;
    employeeSubmissionState[indexKey] = createEmptyTaskMap();
    renderEmployeeTasks(indexKey);
    await hydrateEmployeeState(indexKey);
    
    // Set up polling
    const isMobile = window.innerWidth <= 768;
    const pollInterval = isMobile ? 60000 : 30000; // 60s mobile, 30s desktop
    
    // Use Page Visibility API
    let isPageVisible = !document.hidden;
    document.addEventListener('visibilitychange', () => {
      isPageVisible = !document.hidden;
      if (isPageVisible && !employeeRefreshTimer) {
        // Start polling
      } else if (!isPageVisible && employeeRefreshTimer) {
        // Stop polling
      }
    });
    
    // Start polling if visible
    if (isPageVisible) {
      employeeRefreshTimer = setInterval(() => {
        if (isPageVisible) {
          hydrateEmployeeState(indexKey, true).then(() => {
            renderEmployeeTasks(indexKey);
          });
        }
      }, pollInterval);
    }
    
    bindEmployeeEvents(indexKey);
  } catch (error) {
    console.error('Initialization error', error);
  }
}

init();
```

**Purpose:** Main initialization sequence:

1. **Load User Data:** Gets email/role from sessionStorage
2. **Update Profile:** Fetches and displays user info
3. **Role Check:** Redirects RGA users
4. **Profile Validation:** Ensures profile exists
5. **Pharmacy Assignment:** Gets assigned pharmacy index
6. **State Initialization:** Creates empty state map
7. **Load Submissions:** Fetches existing submissions
8. **Set Up Polling:** Auto-refreshes every 30-60 seconds
   - Uses Page Visibility API (pauses when tab hidden)
   - Different intervals for mobile/desktop
9. **Bind Events:** Attaches event listeners

**Page Visibility API:**
- Pauses polling when tab is hidden (saves resources)
- Resumes when tab becomes visible
- Better battery life on mobile

---

## 3. KEY TECHNOLOGIES AND CONCEPTS

### 3.1 Asynchronous Programming
- **Promises:** Used for file reading, image compression
- **async/await:** Makes async code readable
- **Fetch API:** Modern replacement for XMLHttpRequest

### 3.2 State Management
- **Local State:** `employeeSubmissionState` object
- **Session Storage:** Caches profile data
- **Optimistic Updates:** UI updates before server confirms

### 3.3 Performance Optimizations
- **Image Compression:** Reduces upload size
- **Event Delegation:** Single listener instead of many
- **Conditional Rendering:** Only updates changed elements
- **Page Visibility API:** Pauses polling when hidden
- **Passive Event Listeners:** Improves scroll performance

### 3.4 Error Handling
- **Try-Catch Blocks:** Graceful error handling
- **Fallback Values:** Defaults if data missing
- **User Feedback:** Error messages displayed to user
- **State Recovery:** Reverts UI on failure

### 3.5 Responsive Design
- **Media Queries:** Adapts to screen size
- **Flexbox:** Flexible layouts
- **Mobile-First:** Optimized for mobile devices

---

## 4. DATA FLOW

### Upload Flow:
1. User selects file → File input change event
2. Validate file size → Show warning if large
3. Optimistic UI update → Show "waiting" status
4. Compress image → Reduce file size
5. Convert to DataURL → Base64 string
6. POST to `/api/save-submission` → Save to database
7. Update state → Merge server response
8. Render UI → Show updated status
9. Refresh after delay → Ensure consistency

### Load Flow:
1. Page loads → `init()` called
2. Get user data → From sessionStorage
3. Fetch profile → From API or cache
4. Get pharmacy index → From profile
5. Fetch submissions → From API
6. Merge into state → Update local state
7. Render tasks → Update UI
8. Start polling → Auto-refresh

---

## 5. SECURITY CONSIDERATIONS

1. **Input Validation:** File size limits, file type checking
2. **URL Encoding:** `encodeURIComponent()` prevents injection
3. **Noopener:** Prevents tabnabbing attacks
4. **Error Messages:** Don't expose sensitive info
5. **Session Storage:** Client-side only (not sent in requests automatically)

---

## 6. ACCESSIBILITY FEATURES

1. **Semantic HTML:** Proper heading hierarchy
2. **ARIA Labels:** Status chips have descriptive text
3. **Keyboard Navigation:** Links and buttons are focusable
4. **Color Contrast:** Status colors meet WCAG standards
5. **Zoom Support:** `user-scalable=yes` allows zooming

---

This documentation covers all major components of the `welcome.html` file. Each function, CSS rule, and HTML element serves a specific purpose in creating a functional, user-friendly task submission system.


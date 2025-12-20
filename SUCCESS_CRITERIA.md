# Success Criteria for PharmaT Audit System
## Computer Science Internal Assessment

---

## 1. Functional Requirements

### 1.1 User Registration and Authentication
- **Criterion 1.1.1**: The system successfully registers new users with email verification
  - **Measurement**: 100% of test registrations complete successfully with valid email addresses
  - **Test**: Register 10 users with valid emails and verify all complete registration flow

- **Criterion 1.1.2**: Email verification codes are generated and validated correctly
  - **Measurement**: 100% of verification codes are 6-digit numeric codes, and verification succeeds with correct code and fails with incorrect code
  - **Test**: Generate 20 codes and verify format; test correct/incorrect code validation

- **Criterion 1.1.3**: Role-based access control functions correctly
  - **Measurement**: 100% of employee users can only access employee dashboard, and 100% of RGA users can only access RGA dashboard
  - **Test**: Login with 5 employee accounts and 5 RGA accounts, verify correct dashboard access

- **Criterion 1.1.4**: Duplicate email registration is prevented
  - **Measurement**: 100% of attempts to register with existing email addresses are rejected with appropriate error message
  - **Test**: Attempt to register 5 duplicate emails and verify all are rejected

### 1.2 Profile Management
- **Criterion 1.2.1**: Users can complete their profile with required information
  - **Measurement**: 100% of registered users can successfully save profile with first name, last name, and at least one pharmacy assignment
  - **Test**: Complete profiles for 10 users and verify all data is saved correctly in database

- **Criterion 1.2.2**: RGA users can assign multiple pharmacies (up to limit)
  - **Measurement**: RGA users can assign pharmacies up to their role limit (as defined in `pharmacyLimits`), and exceeding limit is prevented
  - **Test**: Assign pharmacies to RGA users up to limit and attempt to exceed limit

- **Criterion 1.2.3**: Profile data persists across sessions
  - **Measurement**: 100% of profile data is correctly retrieved when user logs in again
  - **Test**: Complete profiles for 10 users, logout, login again, and verify all data is displayed correctly

### 1.3 Task Submission (Employee Dashboard)
- **Criterion 1.3.1**: Employees can upload photos for all three task types (windows, trash cans, outfits)
  - **Measurement**: 100% of task types accept photo uploads successfully
  - **Test**: Upload photos for all 3 task types from 5 different employee accounts

- **Criterion 1.3.2**: Image compression reduces file size appropriately
  - **Measurement**: Images larger than 500KB are compressed to at least 50% of original size while maintaining acceptable quality
  - **Test**: Upload 10 images >500KB and measure compression ratio

- **Criterion 1.3.3**: Task submissions are saved to database correctly
  - **Measurement**: 100% of submitted tasks are stored in database with correct metadata (email, pharmacy_index, task_id, photo_url, timestamp)
  - **Test**: Submit 20 tasks and verify all are correctly stored in `task_submissions` table

- **Criterion 1.3.4**: Employees can delete their own submissions
  - **Measurement**: 100% of delete operations successfully remove submissions from database
  - **Test**: Create 10 submissions and delete all 10, verify removal from database

- **Criterion 1.3.5**: Task status is displayed correctly (waiting, approved, rejected)
  - **Measurement**: 100% of task statuses are correctly displayed with appropriate color coding
  - **Test**: Create submissions with different statuses and verify correct display

### 1.4 Review and Approval (RGA Dashboard)
- **Criterion 1.4.1**: RGA users can view all assigned pharmacies
  - **Measurement**: 100% of pharmacies assigned to RGA user are displayed on dashboard
  - **Test**: Assign 10 pharmacies to RGA user and verify all are displayed

- **Criterion 1.4.2**: RGA users can approve task submissions
  - **Measurement**: 100% of approval actions update submission status to "approved" with reviewer email and timestamp
  - **Test**: Approve 20 submissions and verify status updates in database

- **Criterion 1.4.3**: RGA users can reject task submissions
  - **Measurement**: 100% of rejection actions update submission status to "rejected" with reviewer email and timestamp
  - **Test**: Reject 10 submissions and verify status updates in database

- **Criterion 1.4.4**: Pharmacy locations are displayed on map
  - **Measurement**: 100% of assigned pharmacies are geocoded and displayed as markers on Yandex Maps
  - **Test**: Assign 10 pharmacies and verify all appear on map with correct locations

- **Criterion 1.4.5**: Map coordinates are cached for performance
  - **Measurement**: Geocoding API is called only once per pharmacy address, subsequent loads use cached coordinates
  - **Test**: Load RGA dashboard twice and verify geocoding API called only once per pharmacy

### 1.5 Audit Questionnaire System
- **Criterion 1.5.1**: Audit questions load dynamically from database
  - **Measurement**: 100% of questions stored in `audit_questions` table are displayed on audit page
  - **Test**: Add 10 questions to database and verify all appear on audit page

- **Criterion 1.5.2**: Different question types render correctly
  - **Measurement**: All question types (text, multiple_choice, yes_no, rating) render with appropriate input controls
  - **Test**: Create one question of each type and verify correct rendering

- **Criterion 1.5.3**: Audit responses are saved to database
  - **Measurement**: 100% of submitted audit responses are stored in `audit_responses` table with correct question_id and response values
  - **Test**: Submit 5 complete audit questionnaires and verify all responses are saved

---

## 2. Performance Requirements

### 2.1 Response Time
- **Criterion 2.1.1**: API endpoints respond within acceptable time
  - **Measurement**: 95% of API requests complete within 2 seconds under normal load
  - **Test**: Make 100 API requests and measure response times, calculate 95th percentile

- **Criterion 2.1.2**: Dashboard loads within acceptable time
  - **Measurement**: Employee dashboard loads and displays tasks within 3 seconds on average internet connection
  - **Test**: Load dashboard 20 times and measure average load time

- **Criterion 2.1.3**: Image upload completes within reasonable time
  - **Measurement**: Images up to 2MB upload and process within 5 seconds
  - **Test**: Upload 10 images of various sizes and measure upload time

### 2.2 Auto-refresh Functionality
- **Criterion 2.2.1**: Dashboard auto-refreshes at specified intervals
  - **Measurement**: Dashboard refreshes every 30 seconds (desktop) or 60 seconds (mobile) when tab is visible
  - **Test**: Monitor network requests and verify refresh intervals match specification

- **Criterion 2.2.2**: Auto-refresh pauses when tab is hidden
  - **Measurement**: No refresh requests are made when browser tab is hidden (using Page Visibility API)
  - **Test**: Hide tab and verify no API calls are made during hidden period

### 2.3 Image Compression Performance
- **Criterion 2.3.1**: Image compression completes within reasonable time
  - **Measurement**: Images are compressed within 2 seconds on average device
  - **Test**: Compress 20 images and measure average compression time

---

## 3. Usability Requirements

### 3.1 User Interface
- **Criterion 3.1.1**: Interface is responsive on mobile devices
  - **Measurement**: All pages render correctly and are usable on screens as small as 320px width
  - **Test**: Test all pages on mobile viewport (320px, 375px, 414px widths)

- **Criterion 3.1.2**: Navigation is intuitive
  - **Measurement**: Users can complete registration → profile → dashboard flow without external guidance
  - **Test**: Have 5 test users complete full flow and measure completion rate (target: 100%)

- **Criterion 3.1.3**: Error messages are clear and helpful
  - **Measurement**: 100% of error scenarios display user-friendly error messages
  - **Test**: Trigger all error scenarios (invalid email, wrong password, network errors) and verify messages

### 3.2 Form Validation
- **Criterion 3.2.1**: Email format validation works correctly
  - **Measurement**: Invalid email formats are rejected before submission
  - **Test**: Attempt to submit 10 invalid email formats and verify all are rejected

- **Criterion 3.2.2**: Required fields are validated
  - **Measurement**: Forms cannot be submitted with empty required fields
  - **Test**: Attempt to submit forms with missing required fields and verify prevention

### 3.3 Visual Feedback
- **Criterion 3.3.1**: Upload progress is displayed
  - **Measurement**: Image uploads show progress indicator during upload process
  - **Test**: Upload 10 images and verify progress indicators appear

- **Criterion 3.3.2**: Status changes are immediately visible
  - **Measurement**: UI updates immediately after actions (upload, approve, reject) without requiring page refresh
  - **Test**: Perform 20 actions and verify immediate UI updates

---

## 4. Data Management Requirements

### 4.1 Database Operations
- **Criterion 4.1.1**: Data integrity is maintained
  - **Measurement**: 100% of database operations maintain referential integrity (no orphaned records)
  - **Test**: Create and delete users, profiles, and submissions, verify no orphaned records

- **Criterion 4.1.2**: Data is correctly retrieved
  - **Measurement**: 100% of data retrieval operations return correct data matching database records
  - **Test**: Store 50 records and retrieve all, verify 100% match

- **Criterion 4.1.3**: Concurrent operations handle correctly
  - **Measurement**: System handles 10 simultaneous users without data corruption
  - **Test**: Have 10 users perform operations simultaneously and verify data consistency

### 4.2 Data Persistence
- **Criterion 4.2.1**: User sessions persist correctly
  - **Measurement**: User login state persists across page navigations using sessionStorage
  - **Test**: Login, navigate between pages, verify session persists

- **Criterion 4.2.2**: Form data is preserved on navigation
  - **Measurement**: Partially completed forms retain values when navigating away and returning
  - **Test**: Start filling forms, navigate away, return, verify data preserved

---

## 5. Security Requirements

### 5.1 Authentication
- **Criterion 5.1.1**: Unauthorized access is prevented
  - **Measurement**: 100% of attempts to access protected pages without login are redirected to login
  - **Test**: Attempt to access protected pages without login and verify redirects

- **Criterion 5.1.2**: Password validation works correctly
  - **Measurement**: Only correct passwords allow login (100% rejection of incorrect passwords)
  - **Test**: Attempt login with 20 incorrect passwords and verify all are rejected

- **Criterion 5.1.3**: Email verification prevents unauthorized registration
  - **Measurement**: Users cannot complete registration without verifying email (100% prevention)
  - **Test**: Attempt to bypass email verification and verify prevention

### 5.2 Authorization
- **Criterion 5.2.1**: Role-based access is enforced
  - **Measurement**: Employees cannot access RGA dashboard and RGAs cannot access employee dashboard (100% prevention)
  - **Test**: Attempt cross-role access and verify prevention

- **Criterion 5.2.2**: Users can only modify their own data
  - **Measurement**: Users cannot delete or modify submissions belonging to other users
  - **Test**: Attempt to modify other users' data and verify prevention

---

## 6. Technical Implementation Requirements

### 6.1 Code Quality
- **Criterion 6.1.1**: Code follows consistent style
  - **Measurement**: 100% of JavaScript code follows consistent naming conventions and formatting
  - **Test**: Code review of all JavaScript files

- **Criterion 6.1.2**: Error handling is implemented
  - **Measurement**: 100% of API calls include error handling (try-catch blocks)
  - **Test**: Code review of all API endpoint files

- **Criterion 6.1.3**: Code is modular and organized
  - **Measurement**: Code is separated into logical modules (API endpoints, frontend pages)
  - **Test**: Review project structure and verify logical organization

### 6.2 API Design
- **Criterion 6.2.1**: RESTful API conventions are followed
  - **Measurement**: API endpoints use appropriate HTTP methods (GET, POST, PATCH, DELETE)
  - **Test**: Review all API endpoints and verify HTTP method usage

- **Criterion 6.2.2**: API responses are consistent
  - **Measurement**: 100% of API responses follow consistent format (success/error structure)
  - **Test**: Review API response structures across all endpoints

### 6.3 Browser Compatibility
- **Criterion 6.3.1**: Application works on modern browsers
  - **Measurement**: Application functions correctly on Chrome, Firefox, Safari, and Edge (latest versions)
  - **Test**: Test application on all four browsers

---

## 7. Integration Requirements

### 7.1 External Services
- **Criterion 7.1.1**: Supabase integration functions correctly
  - **Measurement**: 100% of database operations complete successfully
  - **Test**: Perform all CRUD operations and verify success

- **Criterion 7.1.2**: Email service integration works (when configured)
  - **Measurement**: Email verification codes are sent successfully when email service is configured
  - **Test**: Configure email service and verify code delivery

- **Criterion 7.1.3**: Yandex Maps integration displays correctly
  - **Measurement**: Map loads and displays pharmacy locations correctly
  - **Test**: Load RGA dashboard with 10 pharmacies and verify map display

---

## Summary of Success Criteria

**Total Criteria**: 42 measurable success criteria

**Categories**:
- Functional Requirements: 15 criteria
- Performance Requirements: 5 criteria
- Usability Requirements: 6 criteria
- Data Management Requirements: 5 criteria
- Security Requirements: 5 criteria
- Technical Implementation Requirements: 6 criteria
- Integration Requirements: 3 criteria

**Measurement Approach**:
- Quantitative testing with specific metrics
- User testing for usability criteria
- Code review for technical criteria
- Automated testing where possible
- Manual testing with documented results

---

## Testing Methodology

For each success criterion, testing should include:
1. **Test Plan**: Define test cases and expected results
2. **Test Execution**: Perform tests and document results
3. **Test Results**: Record pass/fail status with evidence
4. **Analysis**: Evaluate if criterion is met and document any issues

**Evidence Collection**:
- Screenshots of test results
- Database queries showing data integrity
- Network logs showing API performance
- Code snippets demonstrating implementation
- User feedback for usability criteria

---

*Note: These success criteria are designed to be measurable and testable, which is essential for the IB Computer Science Internal Assessment. Each criterion includes specific metrics and testing approaches to ensure objective evaluation.*


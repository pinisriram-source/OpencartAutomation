# Practice Login Page - Smoke Test Plan

## Application Overview

This test plan covers comprehensive testing of the Practice Login Page at https://practicetestautomation.com/practice-test-login/. The page provides a simple login form for testing positive and negative login scenarios. The application accepts a single valid credential pair (username: student, password: Password123) and displays appropriate error messages for invalid attempts. Testing will cover happy path login, negative scenarios (invalid username, invalid password), boundary/edge cases (empty fields, case sensitivity, whitespace handling), and UI/navigation verification.

## Test Scenarios

### 1. Practice Login Page Tests

**Seed:** `N/A - Simple static page with login form`

#### 1.1. TC-LOGIN-001 - Valid Login Redirects To Success Page

**File:** `tests/login/tc-login-001-valid-login.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
    - expect: Page title is 'Test Login | Practice Test Automation'
  2. Enter 'student' into Username field
    - expect: Username field accepts the input
  3. Enter 'Password123' into Password field
    - expect: Password field accepts the input (masked)
  4. Click Submit button
    - expect: Page navigates to success page
    - expect: URL is 'https://practicetestautomation.com/logged-in-successfully/'
    - expect: Page title is 'Logged In Successfully | Practice Test Automation'
    - expect: Page displays heading 'Logged In Successfully'
    - expect: Page contains message 'Congratulations student. You successfully logged in!'
    - expect: Log out link is visible and links to practice login page

#### 1.2. TC-LOGIN-002 - Invalid Username Shows Error Message

**File:** `tests/login/tc-login-002-invalid-username.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'invaliduser' into Username field
    - expect: Username field accepts the input
  3. Enter 'Password123' into Password field
    - expect: Password field accepts the input
  4. Click Submit button
    - expect: Page remains on login page (URL unchanged)
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: Error message is visible to the user
    - expect: Username and password fields are still present

#### 1.3. TC-LOGIN-003 - Invalid Password Shows Error Message

**File:** `tests/login/tc-login-003-invalid-password.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'student' into Username field
    - expect: Username field accepts the input
  3. Enter 'wrongpassword' into Password field
    - expect: Password field accepts the input
  4. Click Submit button
    - expect: Page remains on login page (URL unchanged)
    - expect: Error message 'Your password is invalid!' is displayed
    - expect: Error message is visible to the user
    - expect: Username and password fields are still present

#### 1.4. TC-LOGIN-004 - Empty Username And Password Shows Error

**File:** `tests/login/tc-login-004-empty-fields.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Leave Username field empty
    - expect: Username field is empty
  3. Leave Password field empty
    - expect: Password field is empty
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: User cannot proceed with empty credentials

#### 1.5. TC-LOGIN-005 - Empty Username With Valid Password Shows Error

**File:** `tests/login/tc-login-005-empty-username.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Leave Username field empty
    - expect: Username field is empty
  3. Enter 'Password123' into Password field
    - expect: Password field accepts the input
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your username is invalid!' is displayed

#### 1.6. TC-LOGIN-006 - Valid Username With Empty Password Shows Error

**File:** `tests/login/tc-login-006-empty-password.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'student' into Username field
    - expect: Username field accepts the input
  3. Leave Password field empty
    - expect: Password field is empty
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your password is invalid!' is displayed

#### 1.7. TC-LOGIN-007 - Password Is Case Sensitive

**File:** `tests/login/tc-login-007-password-case-sensitive.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'student' into Username field
    - expect: Username field accepts the input
  3. Enter 'password123' (all lowercase) into Password field
    - expect: Password field accepts the input
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your password is invalid!' is displayed
    - expect: Login fails due to incorrect case (Password123 vs password123)

#### 1.8. TC-LOGIN-008 - Username With Leading And Trailing Spaces Shows Error

**File:** `tests/login/tc-login-008-username-with-spaces.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter ' student ' (with leading and trailing spaces) into Username field
    - expect: Username field accepts the input with spaces
  3. Enter 'Password123' into Password field
    - expect: Password field accepts the input
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: Login fails because spaces are not trimmed from username

#### 1.9. TC-LOGIN-009 - Login Form Elements Are Visible On Page Load

**File:** `tests/login/tc-login-009-form-elements-visible.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
    - expect: Page heading 'Test login' is displayed
    - expect: Username field is visible and enabled
    - expect: Username field has label 'Username'
    - expect: Password field is visible and enabled
    - expect: Password field has label 'Password'
    - expect: Submit button is visible and enabled
    - expect: Credential instructions are displayed ('Username: student', 'Password: Password123')
    - expect: Test case descriptions are visible on the page

#### 1.10. TC-LOGIN-010 - Success Page Has Link Back To Practice Page

**File:** `tests/login/tc-login-010-logout-link-navigation.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'student' into Username field
    - expect: Username field accepts the input
  3. Enter 'Password123' into Password field
    - expect: Password field accepts the input
  4. Click Submit button
    - expect: Success page loads with 'Logged In Successfully' heading
  5. Verify Log out link is present
    - expect: Log out link is visible
    - expect: Log out link has href 'https://practicetestautomation.com/practice-test-login/'
  6. Click Log out link
    - expect: User is navigated back to login page
    - expect: URL is 'https://practicetestautomation.com/practice-test-login/'
    - expect: Login form is displayed and ready for new login attempt

#### 1.11. TC-LOGIN-011 - Multiple Failed Login Attempts Are Allowed

**File:** `tests/login/tc-login-011-multiple-failed-attempts.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'wronguser' into Username field and 'Password123' into Password field
    - expect: Fields accept the input
  3. Click Submit button
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: User remains on login page
  4. Enter 'student' into Username field and 'wrongpass' into Password field
    - expect: Fields accept the new input
  5. Click Submit button
    - expect: Error message 'Your password is invalid!' is displayed
    - expect: User remains on login page
    - expect: No account lockout or rate limiting is enforced
  6. Enter 'student' into Username field and 'Password123' into Password field
    - expect: Fields accept the valid input
  7. Click Submit button
    - expect: Login succeeds
    - expect: User is navigated to success page

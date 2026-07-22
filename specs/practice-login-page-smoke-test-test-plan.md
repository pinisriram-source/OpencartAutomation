# Practice Login Page - Smoke Test Plan

## Application Overview

This test plan covers comprehensive testing of the practice login page at https://practicetestautomation.com/practice-test-login/. The page provides a simple login form for practicing test automation skills. The application validates user credentials and displays appropriate success or error messages based on the input provided.

## Test Scenarios

### 1. Login Functionality - Core Tests

**Seed:** `tests/seed.spec.ts`

#### 1.1. Successful login with valid credentials

**File:** `tests/login-functionality-core-tests/successful-login-with-valid-credentials.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: The page loads successfully
    - expect: Page title is 'Test Login | Practice Test Automation'
    - expect: Login form with Username and Password fields is visible
    - expect: Submit button is present
  2. Enter 'student' into the Username field
    - expect: Username field accepts the input
    - expect: Entered text is visible in the field
  3. Enter 'Password123' into the Password field
    - expect: Password field accepts the input
    - expect: Entered text is masked/hidden
  4. Click the Submit button
    - expect: Page navigates to a new URL
    - expect: New URL is https://practicetestautomation.com/logged-in-successfully/
    - expect: Page title changes to 'Logged In Successfully | Practice Test Automation'
    - expect: Page displays heading 'Logged In Successfully'
    - expect: Success message 'Congratulations student. You successfully logged in!' is displayed
    - expect: Log out link is visible and present on the page

#### 1.2. Invalid username displays error message

**File:** `tests/login-functionality-core-tests/invalid-username-displays-error-message.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: The page loads successfully
    - expect: Login form is visible
  2. Enter 'invalidUser' into the Username field
    - expect: Username field accepts the input
  3. Enter 'Password123' into the Password field
    - expect: Password field accepts the input
  4. Click the Submit button
    - expect: Page does NOT navigate to a new URL
    - expect: Current URL remains https://practicetestautomation.com/practice-test-login/
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: User remains on the login page
    - expect: Username and Password fields are still present

#### 1.3. Invalid password displays error message

**File:** `tests/login-functionality-core-tests/invalid-password-displays-error-message.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: The page loads successfully
    - expect: Login form is visible
  2. Enter 'student' into the Username field
    - expect: Username field accepts the input
  3. Enter 'wrongPassword' into the Password field
    - expect: Password field accepts the input
  4. Click the Submit button
    - expect: Page does NOT navigate to a new URL
    - expect: Current URL remains https://practicetestautomation.com/practice-test-login/
    - expect: Error message 'Your password is invalid!' is displayed
    - expect: User remains on the login page
    - expect: Username and Password fields are still present

### 2. Login Functionality - Negative Tests

**Seed:** `tests/seed.spec.ts`

#### 2.1. Empty username and password shows error

**File:** `tests/login-functionality-negative-tests/empty-username-and-password-shows-error.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: The page loads successfully
    - expect: Login form is visible
  2. Leave Username field empty (do not enter any text)
    - expect: Username field is empty
  3. Leave Password field empty (do not enter any text)
    - expect: Password field is empty
  4. Click the Submit button
    - expect: Page does NOT navigate to a new URL
    - expect: Current URL remains https://practicetestautomation.com/practice-test-login/
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: User remains on the login page

#### 2.2. Empty username with valid password shows error

**File:** `tests/login-functionality-negative-tests/empty-username-with-valid-password-shows-error.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: The page loads successfully
    - expect: Login form is visible
  2. Leave Username field empty (do not enter any text)
    - expect: Username field is empty
  3. Enter 'Password123' into the Password field
    - expect: Password field accepts the input
  4. Click the Submit button
    - expect: Page does NOT navigate to a new URL
    - expect: Current URL remains https://practicetestautomation.com/practice-test-login/
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: User remains on the login page

#### 2.3. Valid username with empty password shows error

**File:** `tests/login-functionality-negative-tests/valid-username-with-empty-password-shows-error.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: The page loads successfully
    - expect: Login form is visible
  2. Enter 'student' into the Username field
    - expect: Username field accepts the input
  3. Leave Password field empty (do not enter any text)
    - expect: Password field is empty
  4. Click the Submit button
    - expect: Page does NOT navigate to a new URL
    - expect: Current URL remains https://practicetestautomation.com/practice-test-login/
    - expect: Error message 'Your password is invalid!' is displayed
    - expect: User remains on the login page

#### 2.4. Both invalid username and password shows username error

**File:** `tests/login-functionality-negative-tests/both-invalid-username-and-password-shows-username-error.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: The page loads successfully
    - expect: Login form is visible
  2. Enter 'wrongUser' into the Username field
    - expect: Username field accepts the input
  3. Enter 'wrongPassword' into the Password field
    - expect: Password field accepts the input
  4. Click the Submit button
    - expect: Page does NOT navigate to a new URL
    - expect: Current URL remains https://practicetestautomation.com/practice-test-login/
    - expect: Error message 'Your username is invalid!' is displayed (username is validated first)
    - expect: User remains on the login page

### 3. Login Functionality - UI Verification

**Seed:** `tests/seed.spec.ts`

#### 3.1. Login page loads with all required elements

**File:** `tests/login-functionality-ui-verification/login-page-loads-with-all-required-elements.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Page loads successfully within 5 seconds
    - expect: Page title is 'Test Login | Practice Test Automation'
    - expect: Page heading 'Test login' is visible
    - expect: Username textbox is present and enabled
    - expect: Username label/text is visible
    - expect: Password textbox is present and enabled
    - expect: Password label/text is visible
    - expect: Submit button is present and enabled
    - expect: Instructions text about test credentials is visible on the page

#### 3.2. Password field masks input characters

**File:** `tests/login-functionality-ui-verification/password-field-masks-input-characters.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Page loads successfully
    - expect: Password field is visible
  2. Enter 'Password123' into the Password field
    - expect: Password field accepts the input
    - expect: Entered characters are masked (displayed as dots/asterisks)
    - expect: Actual password text is not visible in plain text

### 4. Login Functionality - Navigation Tests

**Seed:** `tests/seed.spec.ts`

#### 4.1. Logout link navigates back to login page

**File:** `tests/login-functionality-navigation-tests/logout-link-navigates-back-to-login-page.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Page loads successfully
  2. Enter 'student' into the Username field
    - expect: Username field accepts the input
  3. Enter 'Password123' into the Password field
    - expect: Password field accepts the input
  4. Click the Submit button
    - expect: User is successfully logged in
    - expect: Success page is displayed
    - expect: Log out link is visible
  5. Click the 'Log out' link
    - expect: Page navigates back to login page
    - expect: Current URL is https://practicetestautomation.com/practice-test-login/
    - expect: Login form is visible again
    - expect: Username and Password fields are empty/cleared
    - expect: No success message is displayed

#### 4.2. Success page displays all required elements

**File:** `tests/login-functionality-navigation-tests/success-page-displays-all-required-elements.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Page loads successfully
  2. Enter 'student' into the Username field and 'Password123' into the Password field
    - expect: Both fields accept the input
  3. Click the Submit button
    - expect: Page navigates to success page
    - expect: URL is https://practicetestautomation.com/logged-in-successfully/
    - expect: Page title is 'Logged In Successfully | Practice Test Automation'
    - expect: Heading 'Logged In Successfully' is displayed (h1 level)
    - expect: Success message contains 'Congratulations student. You successfully logged in!'
    - expect: Log out link is present and clickable
    - expect: Log out link href points to the login page

### 5. Login Functionality - Boundary and Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 5.1. Case sensitivity test for username

**File:** `tests/login-functionality-boundary-and-edge-cases/case-sensitivity-test-for-username.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Page loads successfully
  2. Enter 'STUDENT' (uppercase) into the Username field
    - expect: Username field accepts the input
  3. Enter 'Password123' into the Password field
    - expect: Password field accepts the input
  4. Click the Submit button
    - expect: Page behavior is tested (login may succeed or fail depending on case sensitivity)
    - expect: If case-sensitive: error message 'Your username is invalid!' is displayed
    - expect: If not case-sensitive: login succeeds and success page is displayed

#### 5.2. Case sensitivity test for password

**File:** `tests/login-functionality-boundary-and-edge-cases/case-sensitivity-test-for-password.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Page loads successfully
  2. Enter 'student' into the Username field
    - expect: Username field accepts the input
  3. Enter 'password123' (lowercase 'p') into the Password field
    - expect: Password field accepts the input
  4. Click the Submit button
    - expect: Error message 'Your password is invalid!' is displayed (password should be case-sensitive)
    - expect: User remains on the login page

#### 5.3. Username and password with leading and trailing spaces

**File:** `tests/login-functionality-boundary-and-edge-cases/username-and-password-with-leading-and-trailing-spaces.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Page loads successfully
  2. Enter ' student ' (with leading and trailing spaces) into the Username field
    - expect: Username field accepts the input with spaces
  3. Enter ' Password123 ' (with leading and trailing spaces) into the Password field
    - expect: Password field accepts the input with spaces
  4. Click the Submit button
    - expect: Page behavior is tested (spaces may or may not be trimmed)
    - expect: If spaces are not trimmed: error message is displayed
    - expect: If spaces are trimmed: login succeeds

#### 5.4. Very long username input

**File:** `tests/login-functionality-boundary-and-edge-cases/very-long-username-input.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Page loads successfully
  2. Enter a very long string (e.g., 1000 characters) into the Username field
    - expect: Username field accepts the input or shows appropriate limitation
    - expect: No page crash or error occurs
  3. Enter 'Password123' into the Password field
    - expect: Password field accepts the input
  4. Click the Submit button
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: Page handles long input gracefully without crashing
    - expect: User remains on the login page

#### 5.5. Special characters in username and password

**File:** `tests/login-functionality-boundary-and-edge-cases/special-characters-in-username-and-password.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Page loads successfully
  2. Enter 'student!@#$%' into the Username field
    - expect: Username field accepts the input with special characters
  3. Enter 'Pass@123!' into the Password field
    - expect: Password field accepts the input with special characters
  4. Click the Submit button
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: Special characters are handled properly without causing errors
    - expect: User remains on the login page

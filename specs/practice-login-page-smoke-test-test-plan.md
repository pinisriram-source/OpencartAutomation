# Practice Login Page Smoke Test

## Application Overview

This test plan covers the Practice Test Automation login page (https://practicetestautomation.com/practice-test-login/), a simple login form designed for test automation practice. The application provides basic authentication functionality with username and password fields, allowing students to test both positive (successful login) and negative (invalid credentials) scenarios. The page displays appropriate error messages for invalid inputs and navigates to a success page upon valid login.

## Test Scenarios

### 1. Happy Path - Valid Login

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-LOGIN-001-ValidCredentialsLoginSuccess

**File:** `tests/practice-login/TC-LOGIN-001-ValidCredentialsLoginSuccess.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
    - expect: Page title is 'Test Login | Practice Test Automation'
    - expect: Username field is visible
    - expect: Password field is visible
    - expect: Submit button is visible
  2. Enter 'student' into Username field
    - expect: Username field contains 'student'
  3. Enter 'Password123' into Password field
    - expect: Password field contains the entered password (masked)
  4. Click Submit button
    - expect: Page navigates to https://practicetestautomation.com/logged-in-successfully/
    - expect: Page title is 'Logged In Successfully | Practice Test Automation'
    - expect: Page displays heading 'Logged In Successfully'
    - expect: Page displays message 'Congratulations student. You successfully logged in!'
    - expect: Log out link is visible and clickable

#### 1.2. TC-LOGIN-002-LogoutFromSuccessPage

**File:** `tests/practice-login/TC-LOGIN-002-LogoutFromSuccessPage.spec.ts`

**Steps:**
  1. Complete valid login to reach the success page (prerequisite: TC-LOGIN-001)
    - expect: User is on logged-in-successfully page
  2. Click 'Log out' link
    - expect: Page navigates back to https://practicetestautomation.com/practice-test-login/
    - expect: Login form is displayed
    - expect: No user session persists

### 2. Negative Path - Invalid Username

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-LOGIN-003-InvalidUsernameError

**File:** `tests/practice-login/TC-LOGIN-003-InvalidUsernameError.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'invalidUser' into Username field
    - expect: Username field contains 'invalidUser'
  3. Enter 'Password123' into Password field
    - expect: Password field contains the entered password
  4. Click Submit button
    - expect: Page remains on https://practicetestautomation.com/practice-test-login/
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: Error message is visible to the user
    - expect: No navigation occurs

#### 2.2. TC-LOGIN-004-EmptyUsername

**File:** `tests/practice-login/TC-LOGIN-004-EmptyUsername.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Leave Username field empty (do not enter any value)
    - expect: Username field is empty
  3. Enter 'Password123' into Password field
    - expect: Password field contains the entered password
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: No navigation occurs

#### 2.3. TC-LOGIN-005-UsernameWithSpecialCharacters

**File:** `tests/practice-login/TC-LOGIN-005-UsernameWithSpecialCharacters.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'test@user#123' into Username field
    - expect: Username field contains 'test@user#123'
  3. Enter 'Password123' into Password field
    - expect: Password field contains the entered password
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your username is invalid!' is displayed

#### 2.4. TC-LOGIN-006-UsernameWithWhitespace

**File:** `tests/practice-login/TC-LOGIN-006-UsernameWithWhitespace.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter ' student ' (with leading and trailing spaces) into Username field
    - expect: Username field contains ' student '
  3. Enter 'Password123' into Password field
    - expect: Password field contains the entered password
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: System does not trim whitespace from username

#### 2.5. TC-LOGIN-007-UsernameCaseSensitivity

**File:** `tests/practice-login/TC-LOGIN-007-UsernameCaseSensitivity.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'STUDENT' (uppercase) into Username field
    - expect: Username field contains 'STUDENT'
  3. Enter 'Password123' into Password field
    - expect: Password field contains the entered password
  4. Click Submit button
    - expect: Page remains on login page OR successful login occurs
    - expect: If case-sensitive: error message 'Your username is invalid!' is displayed
    - expect: If case-insensitive: successful login to logged-in-successfully page

### 3. Negative Path - Invalid Password

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-LOGIN-008-InvalidPasswordError

**File:** `tests/practice-login/TC-LOGIN-008-InvalidPasswordError.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'student' into Username field
    - expect: Username field contains 'student'
  3. Enter 'wrongPassword' into Password field
    - expect: Password field contains the entered password
  4. Click Submit button
    - expect: Page remains on https://practicetestautomation.com/practice-test-login/
    - expect: Error message 'Your password is invalid!' is displayed
    - expect: Error message is visible to the user
    - expect: No navigation occurs

#### 3.2. TC-LOGIN-009-EmptyPassword

**File:** `tests/practice-login/TC-LOGIN-009-EmptyPassword.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'student' into Username field
    - expect: Username field contains 'student'
  3. Leave Password field empty (do not enter any value)
    - expect: Password field is empty
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your password is invalid!' is displayed
    - expect: No navigation occurs

#### 3.3. TC-LOGIN-010-PasswordCaseSensitivity

**File:** `tests/practice-login/TC-LOGIN-010-PasswordCaseSensitivity.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'student' into Username field
    - expect: Username field contains 'student'
  3. Enter 'password123' (lowercase 'p') into Password field
    - expect: Password field contains the entered password
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your password is invalid!' is displayed
    - expect: Password validation is case-sensitive

#### 3.4. TC-LOGIN-011-PasswordWithWhitespace

**File:** `tests/practice-login/TC-LOGIN-011-PasswordWithWhitespace.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'student' into Username field
    - expect: Username field contains 'student'
  3. Enter ' Password123 ' (with leading and trailing spaces) into Password field
    - expect: Password field contains ' Password123 '
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your password is invalid!' is displayed
    - expect: System does not trim whitespace from password

### 4. Negative Path - Both Fields Invalid

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-LOGIN-012-BothFieldsEmpty

**File:** `tests/practice-login/TC-LOGIN-012-BothFieldsEmpty.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Leave both Username and Password fields empty
    - expect: Both fields are empty
  3. Click Submit button
    - expect: Page remains on login page
    - expect: Error message is displayed (either 'Your username is invalid!' or appropriate validation message)
    - expect: No navigation occurs

#### 4.2. TC-LOGIN-013-BothFieldsInvalid

**File:** `tests/practice-login/TC-LOGIN-013-BothFieldsInvalid.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'invalidUser' into Username field
    - expect: Username field contains 'invalidUser'
  3. Enter 'wrongPassword' into Password field
    - expect: Password field contains 'wrongPassword'
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your username is invalid!' is displayed (username checked first)
    - expect: No navigation occurs

### 5. UI and Navigation Tests

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-LOGIN-014-PageElementsPresent

**File:** `tests/practice-login/TC-LOGIN-014-PageElementsPresent.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Verify all required page elements are present
    - expect: Page heading 'Test login' is displayed
    - expect: Description text explaining the page purpose is visible
    - expect: Credentials information (Username: student, Password: Password123) is displayed
    - expect: Username label and textbox are visible
    - expect: Password label and textbox are visible
    - expect: Submit button is visible and enabled
    - expect: Test case descriptions (Test case 1, 2, 3) are displayed on the page

#### 5.2. TC-LOGIN-015-SuccessPageElementsPresent

**File:** `tests/practice-login/TC-LOGIN-015-SuccessPageElementsPresent.spec.ts`

**Steps:**
  1. Complete valid login to reach the success page
    - expect: User is on logged-in-successfully page
  2. Verify all required success page elements are present
    - expect: Page heading 'Logged In Successfully' is displayed
    - expect: Congratulations message with username 'Congratulations student. You successfully logged in!' is displayed
    - expect: Log out link is visible
    - expect: Log out link is clickable
    - expect: Log out link has correct URL (https://practicetestautomation.com/practice-test-login/)

#### 5.3. TC-LOGIN-016-ErrorMessageVisibility

**File:** `tests/practice-login/TC-LOGIN-016-ErrorMessageVisibility.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
    - expect: Error message is not initially visible or displayed
  2. Enter invalid username 'wrongUser' and valid password 'Password123'
    - expect: Fields contain the entered values
  3. Click Submit button
    - expect: Error message 'Your username is invalid!' becomes visible
    - expect: Error message has appropriate styling (color, positioning)
    - expect: Error message remains visible until next interaction

#### 5.4. TC-LOGIN-017-FormFieldCharacteristics

**File:** `tests/practice-login/TC-LOGIN-017-FormFieldCharacteristics.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Inspect Username field characteristics
    - expect: Username field is a text input type
    - expect: Username field accepts alphanumeric characters
    - expect: Username field shows entered text in plain text
  3. Inspect Password field characteristics
    - expect: Password field is a text input type (note: may not be masked on this practice page)
    - expect: Password field accepts alphanumeric and special characters
  4. Verify Submit button behavior
    - expect: Submit button is clickable
    - expect: Submit button submits the form when clicked

### 6. Boundary and Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-LOGIN-018-VeryLongUsername

**File:** `tests/practice-login/TC-LOGIN-018-VeryLongUsername.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter a very long string (e.g., 500 characters) into Username field
    - expect: Username field accepts or truncates the input
    - expect: No UI breaking or overflow occurs
  3. Enter 'Password123' into Password field
    - expect: Password field contains the entered password
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: Application handles long input gracefully without errors

#### 6.2. TC-LOGIN-019-VeryLongPassword

**File:** `tests/practice-login/TC-LOGIN-019-VeryLongPassword.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter 'student' into Username field
    - expect: Username field contains 'student'
  3. Enter a very long string (e.g., 500 characters) into Password field
    - expect: Password field accepts or truncates the input
    - expect: No UI breaking or overflow occurs
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your password is invalid!' is displayed
    - expect: Application handles long input gracefully without errors

#### 6.3. TC-LOGIN-020-SQLInjectionAttemptUsername

**File:** `tests/practice-login/TC-LOGIN-020-SQLInjectionAttemptUsername.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter "' OR '1'='1" into Username field
    - expect: Username field contains the entered string
  3. Enter 'Password123' into Password field
    - expect: Password field contains the entered password
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: SQL injection attempt is treated as invalid username
    - expect: No successful login bypass occurs

#### 6.4. TC-LOGIN-021-XSSAttemptUsername

**File:** `tests/practice-login/TC-LOGIN-021-XSSAttemptUsername.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter "<script>alert('XSS')</script>" into Username field
    - expect: Username field contains the entered string
  3. Enter 'Password123' into Password field
    - expect: Password field contains the entered password
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: No JavaScript alert is executed
    - expect: XSS attempt is treated as plain text

#### 6.5. TC-LOGIN-022-UnicodeCharactersUsername

**File:** `tests/practice-login/TC-LOGIN-022-UnicodeCharactersUsername.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter Unicode characters (e.g., '学生', 'студент', '🧑‍💻') into Username field
    - expect: Username field accepts and displays Unicode characters
  3. Enter 'Password123' into Password field
    - expect: Password field contains the entered password
  4. Click Submit button
    - expect: Page remains on login page
    - expect: Error message 'Your username is invalid!' is displayed
    - expect: Application handles Unicode characters without crashing

#### 6.6. TC-LOGIN-023-MultipleConsecutiveLoginAttempts

**File:** `tests/practice-login/TC-LOGIN-023-MultipleConsecutiveLoginAttempts.spec.ts`

**Steps:**
  1. Navigate to https://practicetestautomation.com/practice-test-login/
    - expect: Login page loads successfully
  2. Enter invalid credentials and click Submit (repeat 5 times)
    - expect: Each attempt shows appropriate error message
    - expect: No account lockout mechanism is triggered (as this is a practice page)
    - expect: No rate limiting is applied
  3. Enter valid credentials (student/Password123) and click Submit
    - expect: Login succeeds despite previous failed attempts
    - expect: User navigates to logged-in-successfully page

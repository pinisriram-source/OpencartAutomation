# Single File Upload Flow Test Plan

## Application Overview

The File Upload application is a simple web interface that allows users to select and upload a single file from their local file system. The page displays a file input control with a "Choose File" button and an "Upload" button. When a user selects a file, the file input shows the chosen file's name. After clicking "Upload", the application navigates to a success page displaying "File Uploaded!" and the name of the uploaded file. The application uses a POST form submission with multipart/form-data encoding to handle the upload.

## Test Scenarios

### 1. Initial Page State

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-UPLOAD-001: Verify upload page loads with file input and upload button

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the file upload page at https://the-internet.herokuapp.com/upload
    - expect: Page loads successfully
    - expect: URL is https://the-internet.herokuapp.com/upload
    - expect: Page title is 'The Internet'
2. Inspect the page content
    - expect: Page heading 'File Uploader' is displayed
    - expect: Instruction text 'Choose a file on your system and then click upload. Or, drag and drop a file into the area below.' is visible
    - expect: File input control with id 'file-upload' is present
    - expect: 'Choose File' button is visible
    - expect: 'Upload' button with id 'file-submit' is visible

#### 1.2. TC-UPLOAD-002: Verify file input is empty on initial page load

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Inspect the file input control state
    - expect: File input value is empty
    - expect: File input has no files selected
    - expect: File count is 0

#### 1.3. TC-UPLOAD-003: Verify upload button is enabled on initial page load

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Inspect the Upload button state
    - expect: Upload button is visible
    - expect: Upload button is enabled (not disabled)
    - expect: Upload button type is 'submit'

#### 1.4. TC-UPLOAD-004: Verify form attributes are configured for file upload

**File:** `tests/single-file-upload-flow/initial-page-state.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Inspect the form element attributes
    - expect: Form element exists on the page
    - expect: Form action is 'https://the-internet.herokuapp.com/upload'
    - expect: Form method is 'post'
    - expect: Form enctype is 'multipart/form-data'
    - expect: File input name attribute is 'file'

### 2. File Selection Behavior

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-UPLOAD-005: Selecting a valid file populates the file input

**File:** `tests/single-file-upload-flow/file-selection-behavior.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
    - expect: File input is empty
2. Click the file input to open file chooser
    - expect: File chooser dialog is triggered
3. Select a valid file (e.g., 'upload-sample.txt') from the file chooser
    - expect: File chooser closes
    - expect: File input value contains the selected file name 'upload-sample.txt'
    - expect: File input files collection has exactly 1 file
    - expect: The first file's name is 'upload-sample.txt'

#### 2.2. TC-UPLOAD-006: Selecting a file with different extension (.json) populates the file input correctly

**File:** `tests/single-file-upload-flow/file-selection-behavior.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Click the file input and select 'package.json'
    - expect: File input value contains 'package.json'
    - expect: File input has 1 file selected
    - expect: File name exactly matches 'package.json' including the .json extension

#### 2.3. TC-UPLOAD-007: Selecting a file with .md extension populates the file input correctly

**File:** `tests/single-file-upload-flow/file-selection-behavior.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Click the file input and select 'CLAUDE.md'
    - expect: File input value contains 'CLAUDE.md'
    - expect: File input has 1 file selected
    - expect: File name exactly matches 'CLAUDE.md' including the .md extension

#### 2.4. TC-UPLOAD-008: Canceling file chooser leaves file input empty

**File:** `tests/single-file-upload-flow/file-selection-behavior.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
    - expect: File input is empty
2. Click the file input to open file chooser
    - expect: File chooser dialog is triggered
3. Cancel the file chooser without selecting a file
    - expect: File chooser closes
    - expect: File input value remains empty
    - expect: File input files count is still 0

#### 2.5. TC-UPLOAD-009: Selecting a second file replaces the first file in the input

**File:** `tests/single-file-upload-flow/file-selection-behavior.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select first file 'upload-sample.txt'
    - expect: File input shows 'upload-sample.txt'
    - expect: File count is 1
3. Click file input again and select a different file 'package.json'
    - expect: File input value changes to 'package.json'
    - expect: File count is still 1 (not 2)
    - expect: The first file in the files collection is 'package.json' (not 'upload-sample.txt')

### 3. Successful Upload Flow

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-UPLOAD-010: Successfully uploading a .txt file navigates to success page with correct file name

**File:** `tests/single-file-upload-flow/successful-upload-flow.spec.ts`

**Tier:** Smoke

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select 'upload-sample.txt' via file input
    - expect: File input shows 'upload-sample.txt'
3. Click the 'Upload' button
    - expect: Form is submitted
    - expect: Page navigates to the upload success page
    - expect: URL is https://the-internet.herokuapp.com/upload
    - expect: Page heading displays 'File Uploaded!'
    - expect: Uploaded file name 'upload-sample.txt' is displayed on the page
    - expect: Displayed file name exactly matches the selected file name with extension

#### 3.2. TC-UPLOAD-011: Successfully uploading a .json file shows correct file name on success page

**File:** `tests/single-file-upload-flow/successful-upload-flow.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select 'package.json' via file input
    - expect: File input shows 'package.json'
3. Click the 'Upload' button
    - expect: Page navigates to success page
    - expect: Heading displays 'File Uploaded!'
    - expect: Displayed file name is 'package.json'
    - expect: File extension .json is preserved and displayed correctly

#### 3.3. TC-UPLOAD-012: Successfully uploading a .md file shows correct file name on success page

**File:** `tests/single-file-upload-flow/successful-upload-flow.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select 'CLAUDE.md' via file input
    - expect: File input shows 'CLAUDE.md'
3. Click the 'Upload' button
    - expect: Page navigates to success page
    - expect: Heading displays 'File Uploaded!'
    - expect: Displayed file name is 'CLAUDE.md'
    - expect: File extension .md is preserved and displayed correctly

#### 3.4. TC-UPLOAD-013: Upload success page displays only the file name, not the full path

**File:** `tests/single-file-upload-flow/successful-upload-flow.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select any valid file
    - expect: File is selected
3. Click the 'Upload' button
    - expect: Page navigates to success page
    - expect: Displayed file name contains only the file name and extension
    - expect: Displayed text does not contain file system path separators (e.g., '/', '\', 'C:\')
    - expect: Displayed text does not contain 'fakepath' or other path artifacts

### 4. No File Selected Validation

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-UPLOAD-014: Clicking Upload without selecting a file shows server error

**File:** `tests/single-file-upload-flow/no-file-validation.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
    - expect: File input is empty
2. Click the 'Upload' button without selecting a file
    - expect: Form is submitted
    - expect: Page displays an error state
    - expect: Page heading shows 'Internal Server Error'
    - expect: User sees an error indication rather than a silent success

#### 4.2. TC-UPLOAD-015: File input does not have HTML5 required attribute

**File:** `tests/single-file-upload-flow/no-file-validation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Inspect the file input's 'required' attribute
    - expect: File input does not have the 'required' attribute
    - expect: Browser does not show HTML5 validation message when submitting without a file

#### 4.3. TC-UPLOAD-016: Upload button remains enabled when no file is selected

**File:** `tests/single-file-upload-flow/no-file-validation.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
    - expect: File input is empty
2. Observe the Upload button state without selecting a file
    - expect: Upload button is enabled (not disabled)
    - expect: Upload button can be clicked even with no file selected

### 5. Sequential Uploads

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-UPLOAD-017: Uploading a second file after a successful upload displays the new file name

**File:** `tests/single-file-upload-flow/sequential-uploads.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select and upload 'upload-sample.txt'
    - expect: Success page displays 'upload-sample.txt'
3. Navigate back to the upload page
    - expect: Upload form is displayed
    - expect: File input still shows 'upload-sample.txt' from previous selection
4. Select a different file 'package.json'
    - expect: File input updates to show 'package.json'
5. Click the 'Upload' button
    - expect: Success page displays 'package.json'
    - expect: Success page does NOT display 'upload-sample.txt'
    - expect: No stale file name from the previous upload is shown

#### 5.2. TC-UPLOAD-018: Three sequential uploads each display the correct current file name

**File:** `tests/single-file-upload-flow/sequential-uploads.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select and upload 'upload-sample.txt'
    - expect: Success page displays 'upload-sample.txt'
3. Navigate back, select and upload 'package.json'
    - expect: Success page displays 'package.json'
4. Navigate back, select and upload 'CLAUDE.md'
    - expect: Success page displays 'CLAUDE.md'
    - expect: No file names from previous uploads are shown

### 6. File Name Integrity

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-UPLOAD-019: File name on success page exactly matches selected file name including extension

**File:** `tests/single-file-upload-flow/file-name-integrity.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select file 'upload-sample.txt'
    - expect: File input shows 'upload-sample.txt'
3. Extract the exact file name from the file input
    - expect: File name stored in memory is 'upload-sample.txt'
4. Click Upload button
    - expect: Success page displays file name
    - expect: Displayed file name exactly matches the stored name 'upload-sample.txt'
    - expect: No characters are truncated
    - expect: Extension '.txt' is preserved

#### 6.2. TC-UPLOAD-020: File name with uppercase letters is preserved on success page

**File:** `tests/single-file-upload-flow/file-name-integrity.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select file 'CLAUDE.md' (contains uppercase letters)
    - expect: File input shows 'CLAUDE.md'
3. Click Upload button
    - expect: Success page displays 'CLAUDE.md'
    - expect: Uppercase letters 'CLAUDE' are preserved
    - expect: Case is not changed to lowercase or uppercase

#### 6.3. TC-UPLOAD-021: File name with dots and hyphens is preserved on success page

**File:** `tests/single-file-upload-flow/file-name-integrity.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select file 'upload-sample.txt' (contains hyphen)
    - expect: File input shows 'upload-sample.txt'
3. Click Upload button
    - expect: Success page displays 'upload-sample.txt'
    - expect: Hyphen character '-' is preserved
    - expect: Dot character '.' before extension is preserved

### 7. Navigation Back from Success Page

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-UPLOAD-022: Navigating back from success page returns to upload form

**File:** `tests/single-file-upload-flow/navigation-back.spec.ts`

**Tier:** Sanity

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select and upload a file
    - expect: Success page is displayed
3. Click browser back button
    - expect: Page navigates back to the upload form page
    - expect: URL is https://the-internet.herokuapp.com/upload
    - expect: Page heading is 'File Uploader'
    - expect: File input control is visible
    - expect: Upload button is visible

#### 7.2. TC-UPLOAD-023: File input retains selected file after navigating back from success page

**File:** `tests/single-file-upload-flow/navigation-back.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select file 'upload-sample.txt'
    - expect: File input shows 'upload-sample.txt'
3. Click Upload button
    - expect: Success page is displayed
4. Click browser back button
    - expect: Back on upload form page
    - expect: File input still shows 'upload-sample.txt'
    - expect: File count is 1
    - expect: User does not need to re-select the file

#### 7.3. TC-UPLOAD-024: Fresh page load after navigation back clears file selection

**File:** `tests/single-file-upload-flow/navigation-back.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select and upload a file
    - expect: Success page is displayed
3. Navigate to the upload page URL directly (fresh load, not back button)
    - expect: Upload form page loads
    - expect: File input is empty
    - expect: File count is 0
    - expect: No file from previous upload is retained

### 8. Negative and Boundary Tests

**Seed:** `tests/seed.spec.ts`

#### 8.1. TC-UPLOAD-025: Clicking Upload button multiple times with the same file does not cause errors

**File:** `tests/single-file-upload-flow/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select a file
    - expect: File is selected
3. Click Upload button
    - expect: Success page is displayed with correct file name
4. Navigate back and click Upload button again without re-selecting
    - expect: Success page is displayed again with same file name
    - expect: No error occurs
    - expect: Behavior is consistent with first upload

#### 8.2. TC-UPLOAD-026: File input only accepts single file selection, not multiple

**File:** `tests/single-file-upload-flow/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Inspect the file input's 'multiple' attribute
    - expect: File input does not have the 'multiple' attribute
    - expect: File chooser only allows selecting one file at a time
3. Select a file, then select another file
    - expect: Second file replaces the first
    - expect: Only one file is in the file input
    - expect: File count is 1, not 2

#### 8.3. TC-UPLOAD-027: Form submission works even without client-side JavaScript enabled

**File:** `tests/single-file-upload-flow/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Inspect form structure
    - expect: Form has action attribute pointing to '/upload'
    - expect: Form has method 'post'
    - expect: Form has enctype 'multipart/form-data'
    - expect: Upload button is a submit button inside the form
    - expect: Form can submit via traditional HTTP POST without JavaScript

#### 8.4. TC-UPLOAD-028: Navigating away and back to upload page resets to clean state

**File:** `tests/single-file-upload-flow/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select a file but do NOT upload
    - expect: File input shows selected file
3. Navigate to a different page (e.g., home page)
    - expect: Navigation succeeds
4. Navigate back to the upload page URL
    - expect: Upload page loads
    - expect: File input is empty
    - expect: No file from previous session is retained

#### 8.5. TC-UPLOAD-029: File input accept attribute is not restrictive (no file type filtering)

**File:** `tests/single-file-upload-flow/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Inspect the file input's 'accept' attribute
    - expect: File input does not have an 'accept' attribute, or it is null/empty
    - expect: File chooser allows selecting any file type (.txt, .json, .md, .png, etc.)
3. Select files with different extensions (.txt, .json, .md)
    - expect: All file types are accepted by the file input
    - expect: No file type restriction is enforced by the browser

#### 8.6. TC-UPLOAD-030: Success page does not have a form or upload controls

**File:** `tests/single-file-upload-flow/negative-boundary-tests.spec.ts`

**Tier:** Functional

**Steps:**
1. Navigate to the file upload page
    - expect: Page loads successfully
2. Select and upload a file
    - expect: Success page is displayed
3. Inspect the success page content
    - expect: Success page heading 'File Uploaded!' is displayed
    - expect: Uploaded file name is displayed
    - expect: No file input control is present on success page
    - expect: No Upload button is present on success page
    - expect: No form element is present on success page

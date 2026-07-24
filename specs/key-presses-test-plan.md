# Key Presses Test Plan

## Application Overview

The Key Presses page (https://the-internet.herokuapp.com/key_presses) is a single-page test application that demonstrates keyboard input detection. The page contains a text input field and displays real-time feedback showing which key was pressed. The application captures all keyboard events globally (whether the input is focused or not) and updates a result message displaying the standardized key name. The page uses a global keydown listener to detect key presses and displays only the most recent key pressed (no history accumulation).

## Test Scenarios

### 1. Initial Page State and Basic Key Detection

**Seed:** `tests/seed.spec.ts`

#### 1.1. Verify initial page state on load

**File:** `tests/key-presses/initial-state.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/key_presses
    - expect: Page loads successfully with title 'The Internet'
    - expect: URL is exactly https://the-internet.herokuapp.com/key_presses (no query string)
  2. Locate the text input field
    - expect: Input field is visible
    - expect: Input field is empty (contains no text)
  3. Locate the result message paragraph
    - expect: Result paragraph element exists below the input
    - expect: Result paragraph contains no text (no message displayed)

#### 1.2. Single lowercase letter key press displays uppercase key name

**File:** `tests/key-presses/letter-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus (active state)
  3. Press the lowercase letter 'a'
    - expect: Input field contains 'a'
    - expect: Result message displays 'You entered: A' (uppercase)
    - expect: URL remains https://the-internet.herokuapp.com/key_presses

#### 1.3. Multiple letter key presses show only the latest key

**File:** `tests/key-presses/letter-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press the letter 'a'
    - expect: Result message displays 'You entered: A'
  4. Press the letter 'b'
    - expect: Input field contains 'ab'
    - expect: Result message updates to 'You entered: B' (only latest key, not history)
    - expect: URL remains unchanged
  5. Press the letter 'c'
    - expect: Input field contains 'abc'
    - expect: Result message updates to 'You entered: C'

#### 1.4. Number key press displays the number

**File:** `tests/key-presses/number-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press the number key '5'
    - expect: Input field contains '5'
    - expect: Result message displays 'You entered: 5' (numbers are not uppercased)
    - expect: URL remains unchanged

#### 1.5. All number keys are detected correctly

**File:** `tests/key-presses/number-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page and focus the input
    - expect: Input is focused
  2. Press each number key from 0-9 sequentially
    - expect: Each key press displays 'You entered: [0-9]' respectively
    - expect: Result message updates to show only the most recent number pressed

### 2. Special Keys and Navigation Keys

**Seed:** `tests/seed.spec.ts`

#### 2.1. Enter key detection displays ENTER

**File:** `tests/key-presses/special-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press the Enter key
    - expect: Page performs a form submission
    - expect: URL changes to https://the-internet.herokuapp.com/key_presses? (query string added)
    - expect: Result message disappears (paragraph is empty)

#### 2.2. Space key detection displays SPACE

**File:** `tests/key-presses/special-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press the Space key
    - expect: Result message displays 'You entered: SPACE'
    - expect: Input field contains a space character
    - expect: URL remains unchanged

#### 2.3. Escape key detection displays ESCAPE

**File:** `tests/key-presses/special-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press the Escape key
    - expect: Result message displays 'You entered: ESCAPE'
    - expect: URL remains unchanged
    - expect: Page does not navigate away

#### 2.4. Tab key detection displays TAB and moves focus

**File:** `tests/key-presses/special-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press the Tab key
    - expect: Result message displays 'You entered: TAB'
    - expect: Focus moves to the next focusable element (Elemental Selenium link)
    - expect: URL remains unchanged

#### 2.5. Backspace key detection displays BACK_SPACE

**File:** `tests/key-presses/special-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field and type 'abc'
    - expect: Input field contains 'abc'
  3. Press the Backspace key
    - expect: Result message displays 'You entered: BACK_SPACE' (with underscore)
    - expect: Input field now contains 'ab' (last character deleted)
    - expect: URL remains unchanged

#### 2.6. Delete key detection displays DELETE

**File:** `tests/key-presses/special-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press the Delete key
    - expect: Result message displays 'You entered: DELETE'
    - expect: URL remains unchanged

#### 2.7. Arrow keys detection - Up arrow displays UP

**File:** `tests/key-presses/arrow-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press the ArrowUp key
    - expect: Result message displays 'You entered: UP'
    - expect: URL remains unchanged

#### 2.8. All arrow keys are detected correctly

**File:** `tests/key-presses/arrow-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page and focus the input
    - expect: Input is focused
  2. Press ArrowUp key
    - expect: Result message displays 'You entered: UP'
  3. Press ArrowDown key
    - expect: Result message displays 'You entered: DOWN'
  4. Press ArrowLeft key
    - expect: Result message displays 'You entered: LEFT'
  5. Press ArrowRight key
    - expect: Result message displays 'You entered: RIGHT'

#### 2.9. Home key detection displays HOME

**File:** `tests/key-presses/navigation-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Press the Home key (input not focused)
    - expect: Result message displays 'You entered: HOME'
    - expect: URL remains unchanged

#### 2.10. End key detection displays END

**File:** `tests/key-presses/navigation-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Press the End key
    - expect: Result message displays 'You entered: END'
    - expect: URL remains unchanged

#### 2.11. Page Down key detection displays PAGE_DOWN

**File:** `tests/key-presses/navigation-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Press the PageDown key
    - expect: Result message displays 'You entered: PAGE_DOWN' (with underscore)
    - expect: URL remains unchanged

#### 2.12. Page Up key detection displays PAGE_UP

**File:** `tests/key-presses/navigation-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Press the PageUp key
    - expect: Result message displays 'You entered: PAGE_UP' (with underscore)
    - expect: URL remains unchanged

### 3. Modifier Keys and Function Keys

**Seed:** `tests/seed.spec.ts`

#### 3.1. Shift modifier key detection displays SHIFT

**File:** `tests/key-presses/modifier-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press the Shift key alone (not in combination)
    - expect: Result message displays 'You entered: SHIFT'
    - expect: URL remains unchanged

#### 3.2. Control modifier key detection displays CONTROL

**File:** `tests/key-presses/modifier-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press the Control key alone
    - expect: Result message displays 'You entered: CONTROL'
    - expect: URL remains unchanged

#### 3.3. Alt modifier key detection displays ALT

**File:** `tests/key-presses/modifier-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press the Alt key alone
    - expect: Result message displays 'You entered: ALT'
    - expect: URL remains unchanged

#### 3.4. Function key F1 detection displays F1

**File:** `tests/key-presses/function-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press the F1 function key
    - expect: Result message displays 'You entered: F1'
    - expect: URL remains unchanged

#### 3.5. Multiple function keys are detected correctly

**File:** `tests/key-presses/function-keys.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page and focus the input
    - expect: Input is focused
  2. Press F1 through F12 keys sequentially
    - expect: Each function key displays 'You entered: F[1-12]' respectively
    - expect: URL remains unchanged for each key press
    - expect: No browser default actions are triggered (e.g., help menu, developer tools)

### 4. Global Key Detection and Focus Behavior

**Seed:** `tests/seed.spec.ts`

#### 4.1. Key press detected without input focus

**File:** `tests/key-presses/global-detection.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
    - expect: Input field is not focused (no active state)
  2. Press the letter 'x' without clicking on the input field
    - expect: Result message displays 'You entered: X'
    - expect: Input field remains unfocused
    - expect: Input field remains empty (key press detected globally but not typed into unfocused input)
    - expect: URL remains unchanged

#### 4.2. Special keys detected globally without focus

**File:** `tests/key-presses/global-detection.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
    - expect: Input field is not focused
  2. Press the Escape key without focusing the input
    - expect: Result message displays 'You entered: ESCAPE'
    - expect: URL remains https://the-internet.herokuapp.com/key_presses (no query string)
    - expect: Page does not navigate
  3. Press the Space key without focusing the input
    - expect: Result message displays 'You entered: SPACE'
    - expect: Input field remains empty
    - expect: Page does not scroll (default space bar behavior is prevented)

#### 4.3. Key detection after focus is moved away from input

**File:** `tests/key-presses/global-detection.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press the Tab key to move focus away
    - expect: Result message displays 'You entered: TAB'
    - expect: Focus moves to the next element (link)
  4. Press the letter 'z'
    - expect: Result message updates to 'You entered: Z'
    - expect: Input field remains empty (key press not typed because input is not focused)
    - expect: Global listener still captures the key press

### 5. URL Stability and Navigation Safety

**Seed:** `tests/seed.spec.ts`

#### 5.1. URL remains stable for most key presses

**File:** `tests/key-presses/url-stability.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/key_presses
    - expect: Page loads with URL exactly https://the-internet.herokuapp.com/key_presses
  2. Press Escape key
    - expect: URL remains https://the-internet.herokuapp.com/key_presses
  3. Press Space key
    - expect: URL remains unchanged
  4. Press Tab key
    - expect: URL remains unchanged
  5. Press any letter key
    - expect: URL remains unchanged
  6. Press any arrow key
    - expect: URL remains unchanged

#### 5.2. Enter key with focused input submits form and changes URL

**File:** `tests/key-presses/url-stability.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/key_presses
    - expect: Page loads with base URL
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press the Enter key
    - expect: URL changes to https://the-internet.herokuapp.com/key_presses? (query string '?' is added)
    - expect: Result message disappears (paragraph becomes empty)
    - expect: Page performs a form submission but stays on the same route

#### 5.3. Enter key without focused input does not change URL

**File:** `tests/key-presses/url-stability.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/key_presses
    - expect: Page loads with base URL
    - expect: Input is not focused
  2. Press the Enter key without clicking on the input
    - expect: Result message may or may not display (test and document actual behavior)
    - expect: URL should remain https://the-internet.herokuapp.com/key_presses without query string
    - expect: No form submission occurs

#### 5.4. Function keys do not trigger browser navigation

**File:** `tests/key-presses/url-stability.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Press F5 (typically refresh/reload)
    - expect: Page may refresh (browser default behavior) but returns to same URL
    - expect: After refresh, page returns to initial state
  3. Navigate back to the page and press F11 (typically fullscreen)
    - expect: Result message displays 'You entered: F11' if captured
    - expect: URL remains unchanged
    - expect: Page does not navigate away

### 6. Edge Cases and Boundary Conditions

**Seed:** `tests/seed.spec.ts`

#### 6.1. Rapid successive key presses update message correctly

**File:** `tests/key-presses/edge-cases.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press keys 'a', 'b', 'c' in rapid succession (minimal delay)
    - expect: Result message updates to show the most recent key pressed
    - expect: Final result message displays 'You entered: C'
    - expect: No race conditions or display errors occur
    - expect: URL remains unchanged

#### 6.2. Holding down a key continuously updates the message

**File:** `tests/key-presses/edge-cases.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on the input field to focus it
    - expect: Input field receives focus
  3. Press and hold the letter 'a' for several seconds
    - expect: Result message displays 'You entered: A'
    - expect: Input field may contain multiple 'a' characters (due to key repeat)
    - expect: Result message remains stable showing 'A'
    - expect: No performance issues or errors occur

#### 6.3. Mixed case letters all display as uppercase

**File:** `tests/key-presses/edge-cases.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page and focus the input
    - expect: Input is focused
  2. Press lowercase 'a'
    - expect: Result message displays 'You entered: A' (uppercase)
  3. Press Shift+A (uppercase A)
    - expect: Result message displays 'You entered: A' (same uppercase display)
    - expect: Input contains uppercase 'A' character

#### 6.4. Special characters and symbols detection

**File:** `tests/key-presses/edge-cases.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page and focus the input
    - expect: Input is focused
  2. Press period/dot key '.'
    - expect: Result message displays 'You entered: .' (or standardized key name)
    - expect: Input contains '.' character
  3. Press comma key ','
    - expect: Result message displays 'You entered: ,' (or standardized key name)
    - expect: Input contains ',' character
  4. Press semicolon key ';'
    - expect: Result message displays 'You entered: ;' (or standardized key name)
    - expect: Input contains ';' character

#### 6.5. Empty input field after form submission via Enter

**File:** `tests/key-presses/edge-cases.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page
    - expect: Page loads successfully
  2. Click on input and type 'test'
    - expect: Input contains 'test'
  3. Press Enter key
    - expect: Form submits
    - expect: URL changes to include query string '?'
    - expect: Result message disappears
    - expect: Input field is cleared (empty)

#### 6.6. Keyboard shortcut combinations are detected as individual keys

**File:** `tests/key-presses/edge-cases.spec.ts`

**Steps:**
  1. Navigate to the Key Presses page and focus the input
    - expect: Input is focused
  2. Press Ctrl+A (select all shortcut)
    - expect: Result message displays 'You entered: A' (only the A key, not the combination)
    - expect: Default browser behavior may occur (select all text in input)
    - expect: Alternative: test if Control is detected when pressed first
  3. Press Ctrl+C (copy shortcut)
    - expect: Result message displays 'You entered: C' (only the C key)
    - expect: Default copy behavior may occur if text is selected

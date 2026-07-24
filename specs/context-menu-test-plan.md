# Context Menu Test Plan

## Application Overview

The Context Menu page at https://the-internet.herokuapp.com/context_menu is a simple demonstration of custom JavaScript context menu handling. The page consists of a heading, instructional text, and a dashed-border box (div#hot-spot) that acts as an interactive hot spot. When a user right-clicks inside this hot spot box, a JavaScript alert dialog appears with the message "You selected a context menu". The page demonstrates browser event handling for the contextmenu event and shows how to trigger custom behavior on right-click actions. The hot spot is a 250px x 150px div with a 5px dashed border, positioned below the instructional text. No authentication or credentials are required to access or test this page.

## Test Scenarios

### 1. Initial Page State

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-CONTEXTMENU-001: Verify page loads with hot spot box visible and properly styled

**File:** `tests/context-menu/page-load-hot-spot-visible.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/context_menu
    - expect: The page loads successfully
    - expect: The URL is https://the-internet.herokuapp.com/context_menu
    - expect: The page title is 'The Internet'
  2. Verify the page heading
    - expect: The h3 heading displays 'Context Menu'
  3. Verify the instructional text
    - expect: The first paragraph reads 'Context menu items are custom additions that appear in the right-click menu.'
    - expect: The second paragraph reads 'Right-click in the box below to see one called 'the-internet'. When you click it, it will trigger a JavaScript alert.'
  4. Verify the hot spot box is present
    - expect: A div element with id='hot-spot' is visible on the page
    - expect: The hot spot has a dashed border style
    - expect: The hot spot has dimensions of 250px width and 150px height
    - expect: The hot spot is positioned below the instructional text

### 2. Right-Click Alert Behavior - Happy Path

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-CONTEXTMENU-002: Right-click inside hot spot triggers alert with exact message

**File:** `tests/context-menu/right-click-triggers-alert.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/context_menu
    - expect: The page loads successfully
  2. Right-click inside the hot spot box (div#hot-spot)
    - expect: A JavaScript alert dialog appears immediately
    - expect: The alert dialog type is 'alert' (not confirm or prompt)
    - expect: The alert message is exactly 'You selected a context menu' (case-sensitive, exact match)

#### 2.2. TC-CONTEXTMENU-003: Dismissing the alert leaves page in normal state with no navigation

**File:** `tests/context-menu/dismiss-alert-no-navigation.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/context_menu
    - expect: The page loads successfully
  2. Right-click inside the hot spot box to trigger the alert
    - expect: A JavaScript alert dialog appears with message 'You selected a context menu'
  3. Accept/dismiss the alert dialog
    - expect: The alert closes successfully
  4. Verify the page state after alert dismissal
    - expect: The URL remains https://the-internet.herokuapp.com/context_menu (no navigation occurred)
    - expect: The page title is still 'The Internet'
    - expect: The hot spot box is still visible and interactive
    - expect: The page heading 'Context Menu' is still present
    - expect: The instructional paragraphs are still present
    - expect: No page reload has occurred

#### 2.3. TC-CONTEXTMENU-004: Right-clicking hot spot repeatedly triggers alert each time (repeatable behavior)

**File:** `tests/context-menu/repeatable-alert-trigger.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/context_menu
    - expect: The page loads successfully
  2. Right-click inside the hot spot box (first time)
    - expect: A JavaScript alert appears with message 'You selected a context menu'
  3. Accept/dismiss the first alert
    - expect: The alert closes
  4. Right-click inside the hot spot box (second time)
    - expect: A JavaScript alert appears again with the same message 'You selected a context menu'
    - expect: The alert is triggered immediately without delay
  5. Accept/dismiss the second alert
    - expect: The alert closes
  6. Right-click inside the hot spot box (third time)
    - expect: A JavaScript alert appears again with the same message 'You selected a context menu'
    - expect: The behavior is consistent and repeatable

### 3. Negative Cases and Boundary Conditions

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-CONTEXTMENU-005: Right-clicking outside the hot spot does NOT trigger the alert

**File:** `tests/context-menu/right-click-outside-no-alert.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/context_menu
    - expect: The page loads successfully
  2. Right-click on an area of the page outside the hot spot box (e.g., on the heading or instructional text)
    - expect: No JavaScript alert dialog appears
    - expect: The browser's default context menu may appear (normal browser behavior)
    - expect: No custom alert is triggered
  3. Right-click on another area outside the hot spot (e.g., empty space to the right of the hot spot)
    - expect: No JavaScript alert dialog appears
    - expect: The page remains in its normal state

#### 3.2. TC-CONTEXTMENU-006: URL remains unchanged throughout all interactions

**File:** `tests/context-menu/url-persistence.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/context_menu
    - expect: The initial URL is https://the-internet.herokuapp.com/context_menu
  2. Right-click inside the hot spot to trigger the alert
    - expect: The URL remains https://the-internet.herokuapp.com/context_menu
  3. Dismiss the alert
    - expect: The URL remains https://the-internet.herokuapp.com/context_menu
  4. Right-click inside the hot spot again and dismiss the alert
    - expect: The URL remains https://the-internet.herokuapp.com/context_menu
  5. Right-click outside the hot spot
    - expect: The URL remains https://the-internet.herokuapp.com/context_menu
    - expect: No navigation occurs at any point during the test

#### 3.3. TC-CONTEXTMENU-007: Left-clicking inside the hot spot does NOT trigger the alert

**File:** `tests/context-menu/left-click-no-alert.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/context_menu
    - expect: The page loads successfully
  2. Left-click (normal click) inside the hot spot box
    - expect: No JavaScript alert dialog appears
    - expect: The hot spot does not respond to left-click
    - expect: The page remains in its normal state
  3. Double-click inside the hot spot box
    - expect: No JavaScript alert dialog appears
    - expect: Only right-click triggers the alert behavior

#### 3.4. TC-CONTEXTMENU-008: Page content remains intact after multiple alert dismiss cycles

**File:** `tests/context-menu/content-integrity-after-alerts.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/context_menu and capture initial page state
    - expect: The page heading is 'Context Menu'
    - expect: There are 2 instructional paragraphs
    - expect: The hot spot box exists with proper styling
  2. Right-click inside the hot spot and dismiss the alert (repeat 5 times)
    - expect: Each right-click triggers the alert successfully
    - expect: Each alert is dismissed successfully
  3. Verify the page content after multiple alert cycles
    - expect: The page heading is still 'Context Menu'
    - expect: The 2 instructional paragraphs are still present with unchanged text
    - expect: The hot spot box still exists with the same styling (dashed border, 250x150 dimensions)
    - expect: The hot spot is still interactive and responds to right-click
    - expect: The URL is still https://the-internet.herokuapp.com/context_menu
    - expect: No DOM elements have been added, removed, or modified

### 4. Edge Cases and Additional Validation

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-CONTEXTMENU-009: Right-click on the edge/border of the hot spot triggers the alert

**File:** `tests/context-menu/border-click-triggers-alert.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/context_menu
    - expect: The page loads successfully
  2. Right-click on the top border edge of the hot spot box
    - expect: A JavaScript alert appears with message 'You selected a context menu'
    - expect: Border clicks are treated as clicks inside the hot spot
  3. Dismiss the alert and right-click on the bottom border edge
    - expect: A JavaScript alert appears again
  4. Dismiss the alert and right-click on the left border edge
    - expect: A JavaScript alert appears again
  5. Dismiss the alert and right-click on the right border edge
    - expect: A JavaScript alert appears again

#### 4.2. TC-CONTEXTMENU-010: Alert message is exact and case-sensitive

**File:** `tests/context-menu/alert-message-exact-match.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/context_menu
    - expect: The page loads successfully
  2. Right-click inside the hot spot and capture the alert message
    - expect: The alert message is exactly 'You selected a context menu' (capital Y, lowercase rest)
    - expect: The message has no leading or trailing whitespace
    - expect: The message has no extra punctuation beyond the period (if any)
    - expect: The message matches the expected string character-by-character

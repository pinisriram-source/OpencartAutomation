# Dynamic Loading - Hidden and Rendered Elements Test Plan

## Application Overview

The Dynamic Loading feature at https://the-internet.herokuapp.com/dynamic_loading demonstrates two distinct approaches to dynamically displaying content on a web page. The landing page provides links to two examples: Example 1 shows an element that exists in the DOM but is initially hidden (display: none), while Example 2 shows an element that is completely absent from the DOM and is added dynamically. Both examples share the same user-facing behavior: clicking a "Start" button triggers a loading indicator (with "Loading..." text and a spinner image) that displays for approximately 5 seconds, after which the loading indicator disappears and a "Hello World!" heading becomes visible. The key difference is the technical implementation: Example 1 uses CSS visibility toggling, while Example 2 uses DOM manipulation to add the element. This feature tests an application's ability to handle asynchronous content loading and proper state management during transitions.

## Test Scenarios

### 1. Landing Page

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-DYNLOAD-001: Landing page displays feature overview and links to both examples

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/landing-page.spec.ts`

**Tier:** Sanity

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading
    - expect: Page title is 'The Internet'
    - expect: Page displays heading 'Dynamically Loaded Page Elements'
    - expect: Page displays explanatory text about dynamic content loading
    - expect: Link 'Example 1: Element on page that is hidden' is visible
    - expect: Link 'Example 2: Element rendered after the fact' is visible
  2. Click on 'Example 1: Element on page that is hidden' link
    - expect: Browser navigates to /dynamic_loading/1
    - expect: Page displays heading 'Example 1: Element on page that is hidden'
  3. Navigate back to landing page
    - expect: Landing page is displayed again
  4. Click on 'Example 2: Element rendered after the fact' link
    - expect: Browser navigates to /dynamic_loading/2
    - expect: Page displays heading 'Example 2: Element rendered after the fact'

### 2. Example 1 - Initial State

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-DYNLOAD-002: Example 1 initial state shows Start button with no visible message or loading indicator

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/example-1-initial-state.spec.ts`

**Tier:** Smoke

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1
    - expect: Page displays heading 'Example 1: Element on page that is hidden'
    - expect: Start button is visible
    - expect: Start button is enabled
    - expect: No 'Hello World!' message is visible
    - expect: No 'Loading...' text is visible
    - expect: No loading spinner image is visible

#### 2.2. TC-DYNLOAD-003: Example 1 has Hello World element in DOM but hidden

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/example-1-initial-state.spec.ts`

**Tier:** Sanity

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1
    - expect: Start button is visible
  2. Check the DOM for #finish element
    - expect: Element with id 'finish' exists in the DOM
    - expect: Element has CSS display: none
    - expect: Element contains 'Hello World!' heading in its innerHTML

### 3. Example 1 - Loading Sequence

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-DYNLOAD-004: Example 1 clicking Start shows loading indicator immediately

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/example-1-loading-sequence.spec.ts`

**Tier:** Sanity

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1
    - expect: Start button is visible
  2. Click the Start button
    - expect: Start button is no longer visible
    - expect: 'Loading...' text is visible
    - expect: Loading spinner image is visible
    - expect: 'Hello World!' message is not visible

#### 3.2. TC-DYNLOAD-005: Example 1 displays Hello World message after loading completes

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/example-1-loading-sequence.spec.ts`

**Tier:** Smoke

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1
    - expect: Start button is visible
  2. Click the Start button
    - expect: Loading indicator appears
  3. Wait for loading to complete (up to 10 seconds)
    - expect: 'Hello World!' heading is visible
    - expect: Loading indicator ('Loading...' text) is no longer visible
    - expect: Loading spinner image is no longer visible
    - expect: Start button is not visible

#### 3.3. TC-DYNLOAD-006: Example 1 complete sequence from start to finish

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/example-1-loading-sequence.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1
    - expect: Start button is visible
    - expect: Loading indicator is not visible
    - expect: 'Hello World!' message is not visible
  2. Click the Start button
    - expect: Start button disappears immediately
    - expect: Loading indicator appears immediately
  3. Wait for loading to complete
    - expect: Loading indicator disappears
    - expect: 'Hello World!' heading becomes visible

### 4. Example 2 - Initial State

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-DYNLOAD-007: Example 2 initial state shows Start button with no visible message or loading indicator

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/example-2-initial-state.spec.ts`

**Tier:** Sanity

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2
    - expect: Page displays heading 'Example 2: Element rendered after the fact'
    - expect: Start button is visible
    - expect: Start button is enabled
    - expect: No 'Hello World!' message is visible
    - expect: No 'Loading...' text is visible
    - expect: No loading spinner image is visible

#### 4.2. TC-DYNLOAD-008: Example 2 has no Hello World element in DOM initially

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/example-2-initial-state.spec.ts`

**Tier:** Sanity

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2
    - expect: Start button is visible
  2. Check the DOM for #finish element
    - expect: Element with id 'finish' does not exist in the DOM
    - expect: No 'Hello World!' text can be found anywhere in the page source

### 5. Example 2 - Loading Sequence

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-DYNLOAD-009: Example 2 clicking Start shows loading indicator immediately

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/example-2-loading-sequence.spec.ts`

**Tier:** Sanity

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2
    - expect: Start button is visible
  2. Click the Start button
    - expect: Start button is no longer visible
    - expect: 'Loading...' text is visible
    - expect: Loading spinner image is visible
    - expect: 'Hello World!' message is not visible

#### 5.2. TC-DYNLOAD-010: Example 2 renders Hello World element after loading completes

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/example-2-loading-sequence.spec.ts`

**Tier:** Smoke

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2
    - expect: Start button is visible
  2. Click the Start button
    - expect: Loading indicator appears
  3. Wait for loading to complete (up to 10 seconds)
    - expect: 'Hello World!' heading is visible
    - expect: Loading indicator ('Loading...' text) is no longer visible
    - expect: Loading spinner image is no longer visible
    - expect: Start button is not visible
  4. Check the DOM for #finish element
    - expect: Element with id 'finish' now exists in the DOM
    - expect: Element is visible (not display: none)
    - expect: Element contains 'Hello World!' heading

#### 5.3. TC-DYNLOAD-011: Example 2 complete sequence from start to finish

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/example-2-loading-sequence.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2
    - expect: Start button is visible
    - expect: Loading indicator is not visible
    - expect: 'Hello World!' message is not visible
  2. Click the Start button
    - expect: Start button disappears immediately
    - expect: Loading indicator appears immediately
  3. Wait for loading to complete
    - expect: Loading indicator disappears
    - expect: 'Hello World!' heading becomes visible
    - expect: Element was added to the DOM, not just unhidden

### 6. Mutual Exclusivity - State Transitions

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-DYNLOAD-012: Example 1 shows exactly one state at any moment - Start OR Loading OR Message

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/mutual-exclusivity.spec.ts`

**Tier:** Sanity

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1
    - expect: Start button is visible
    - expect: Loading indicator is not visible
    - expect: 'Hello World!' message is not visible
  2. Click the Start button
    - expect: Start button is not visible
    - expect: Loading indicator is visible
    - expect: 'Hello World!' message is not visible
  3. Wait for loading to complete
    - expect: Start button is not visible
    - expect: Loading indicator is not visible
    - expect: 'Hello World!' message is visible

#### 6.2. TC-DYNLOAD-013: Example 2 shows exactly one state at any moment - Start OR Loading OR Message

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/mutual-exclusivity.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2
    - expect: Start button is visible
    - expect: Loading indicator is not visible
    - expect: 'Hello World!' message is not visible
  2. Click the Start button
    - expect: Start button is not visible
    - expect: Loading indicator is visible
    - expect: 'Hello World!' message is not visible
  3. Wait for loading to complete
    - expect: Start button is not visible
    - expect: Loading indicator is not visible
    - expect: 'Hello World!' message is visible

#### 6.3. TC-DYNLOAD-014: Loading indicator and Hello World message are never visible simultaneously on Example 1

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/mutual-exclusivity.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1 and click Start
    - expect: Loading indicator becomes visible
  2. Poll element visibility every 100ms during loading
    - expect: At no point are both 'Loading...' text and 'Hello World!' heading visible at the same time

#### 6.4. TC-DYNLOAD-015: Loading indicator and Hello World message are never visible simultaneously on Example 2

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/mutual-exclusivity.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2 and click Start
    - expect: Loading indicator becomes visible
  2. Poll element visibility every 100ms during loading
    - expect: At no point are both 'Loading...' text and 'Hello World!' heading visible at the same time

### 7. Page Reload Reset

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-DYNLOAD-016: Example 1 reloading after completion resets to initial Start button state

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/page-reload-reset.spec.ts`

**Tier:** Sanity

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1
    - expect: Start button is visible
  2. Click Start and wait for 'Hello World!' message to appear
    - expect: 'Hello World!' heading is visible
    - expect: Start button is not visible
    - expect: Loading indicator is not visible
  3. Reload the page (browser refresh)
    - expect: Page returns to initial state
    - expect: Start button is visible
    - expect: 'Hello World!' message is not visible
    - expect: Loading indicator is not visible

#### 7.2. TC-DYNLOAD-017: Example 2 reloading after completion resets to initial Start button state

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/page-reload-reset.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2
    - expect: Start button is visible
  2. Click Start and wait for 'Hello World!' message to appear
    - expect: 'Hello World!' heading is visible
    - expect: Start button is not visible
    - expect: Loading indicator is not visible
  3. Reload the page (browser refresh)
    - expect: Page returns to initial state
    - expect: Start button is visible
    - expect: 'Hello World!' message is not visible (and not in DOM)
    - expect: Loading indicator is not visible

#### 7.3. TC-DYNLOAD-018: Example 1 reloading during loading resets to initial state

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/page-reload-reset.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1
    - expect: Start button is visible
  2. Click Start button
    - expect: Loading indicator appears
  3. Reload the page while loading indicator is still showing
    - expect: Page returns to initial state
    - expect: Start button is visible
    - expect: 'Hello World!' message is not visible
    - expect: Loading indicator is not visible

#### 7.4. TC-DYNLOAD-019: Example 2 reloading during loading resets to initial state

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/page-reload-reset.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2
    - expect: Start button is visible
  2. Click Start button
    - expect: Loading indicator appears
  3. Reload the page while loading indicator is still showing
    - expect: Page returns to initial state
    - expect: Start button is visible
    - expect: 'Hello World!' message is not visible
    - expect: Loading indicator is not visible

### 8. No Double-Start Protection

**Seed:** `tests/seed.spec.ts`

#### 8.1. TC-DYNLOAD-020: Example 1 Start button is not clickable during loading

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/no-double-start.spec.ts`

**Tier:** Sanity

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1
    - expect: Start button is visible and enabled
  2. Click the Start button
    - expect: Start button disappears
    - expect: Loading indicator appears
  3. Attempt to locate and click the Start button during loading
    - expect: Start button is not present in the DOM or not clickable
    - expect: No error occurs from attempting to interact with hidden element
    - expect: Loading sequence continues normally

#### 8.2. TC-DYNLOAD-021: Example 2 Start button is not clickable during loading

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/no-double-start.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2
    - expect: Start button is visible and enabled
  2. Click the Start button
    - expect: Start button disappears
    - expect: Loading indicator appears
  3. Attempt to locate and click the Start button during loading
    - expect: Start button is not present in the DOM or not clickable
    - expect: No error occurs from attempting to interact with hidden element
    - expect: Loading sequence continues normally

#### 8.3. TC-DYNLOAD-022: Example 1 rapid clicks on Start button only trigger loading once

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/no-double-start.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1
    - expect: Start button is visible
  2. Click the Start button rapidly multiple times in succession
    - expect: Loading indicator appears only once
    - expect: After loading completes, only one 'Hello World!' message is shown
    - expect: No duplicate loading indicators or messages appear

#### 8.4. TC-DYNLOAD-023: Example 2 rapid clicks on Start button only trigger loading once

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/no-double-start.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2
    - expect: Start button is visible
  2. Click the Start button rapidly multiple times in succession
    - expect: Loading indicator appears only once
    - expect: After loading completes, only one 'Hello World!' message is shown
    - expect: No duplicate loading indicators or messages appear

### 9. Cross-Example Consistency

**Seed:** `tests/seed.spec.ts`

#### 9.1. TC-DYNLOAD-024: Both examples produce identical Hello World message text and styling

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/cross-example-consistency.spec.ts`

**Tier:** Sanity

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1, click Start, and wait for completion
    - expect: 'Hello World!' heading is visible
  2. Capture the text content, element type, and computed styles of the Hello World element
    - expect: Text is exactly 'Hello World!'
    - expect: Element is an h4 heading
  3. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2, click Start, and wait for completion
    - expect: 'Hello World!' heading is visible
  4. Capture the text content, element type, and computed styles of the Hello World element
    - expect: Text is exactly 'Hello World!'
    - expect: Element is an h4 heading
    - expect: Styles match those from Example 1

#### 9.2. TC-DYNLOAD-025: Both examples show identical loading indicator during loading phase

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/cross-example-consistency.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1 and click Start
    - expect: Loading indicator with 'Loading...' text and spinner image is visible
  2. Capture the loading indicator structure and content
    - expect: Container has 'Loading...' text
    - expect: Container has an img element (spinner)
  3. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2 and click Start
    - expect: Loading indicator with 'Loading...' text and spinner image is visible
  4. Capture the loading indicator structure and content
    - expect: Loading indicator structure is identical to Example 1
    - expect: Same 'Loading...' text
    - expect: Same spinner image element

#### 9.3. TC-DYNLOAD-026: Both examples have approximately same loading duration

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/cross-example-consistency.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1
    - expect: Start button is visible
  2. Click Start and measure time from click until Hello World appears
    - expect: Loading duration is approximately 5 seconds (±1 second)
  3. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2
    - expect: Start button is visible
  4. Click Start and measure time from click until Hello World appears
    - expect: Loading duration is approximately 5 seconds (±1 second)
    - expect: Duration is within 1 second of Example 1 duration

#### 9.4. TC-DYNLOAD-027: Both examples use the same Start button text and styling

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/cross-example-consistency.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1
    - expect: Start button is visible with text 'Start'
  2. Capture button element type and properties
    - expect: Element is a button
    - expect: Button text is 'Start'
  3. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2
    - expect: Start button is visible with text 'Start'
  4. Capture button element type and properties
    - expect: Element is a button
    - expect: Button text is 'Start'
    - expect: Button properties match Example 1

### 10. Edge Cases and Error Conditions

**Seed:** `tests/seed.spec.ts`

#### 10.1. TC-DYNLOAD-028: Example 1 can be successfully run multiple times in succession

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1
    - expect: Start button is visible
  2. Click Start and wait for Hello World to appear
    - expect: 'Hello World!' message is visible
  3. Reload the page
    - expect: Start button is visible again
  4. Click Start and wait for Hello World to appear
    - expect: 'Hello World!' message is visible
    - expect: Second run completes successfully just like the first

#### 10.2. TC-DYNLOAD-029: Example 2 can be successfully run multiple times in succession

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2
    - expect: Start button is visible
  2. Click Start and wait for Hello World to appear
    - expect: 'Hello World!' message is visible
  3. Reload the page
    - expect: Start button is visible again
  4. Click Start and wait for Hello World to appear
    - expect: 'Hello World!' message is visible
    - expect: Second run completes successfully just like the first

#### 10.3. TC-DYNLOAD-030: Example 1 handles browser back navigation correctly

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/1
    - expect: Start button is visible
  2. Click Start and wait for Hello World to appear
    - expect: 'Hello World!' message is visible
  3. Navigate to the landing page (/dynamic_loading)
    - expect: Landing page is displayed
  4. Use browser back button to return to Example 1
    - expect: Page shows initial state with Start button visible
    - expect: No Hello World message is visible
    - expect: State was reset, not preserved

#### 10.4. TC-DYNLOAD-031: Example 2 handles browser back navigation correctly

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_loading/2
    - expect: Start button is visible
  2. Click Start and wait for Hello World to appear
    - expect: 'Hello World!' message is visible
  3. Navigate to the landing page (/dynamic_loading)
    - expect: Landing page is displayed
  4. Use browser back button to return to Example 2
    - expect: Page shows initial state with Start button visible
    - expect: No Hello World message is visible
    - expect: State was reset, not preserved

#### 10.5. TC-DYNLOAD-032: Direct URL access to examples works correctly

**File:** `tests/dynamic-loading-hidden-and-rendered-elements/edge-cases.spec.ts`

**Tier:** Functional

**Steps:**
  1. Navigate directly to https://the-internet.herokuapp.com/dynamic_loading/1 without visiting landing page first
    - expect: Example 1 page loads successfully
    - expect: Start button is visible
    - expect: Page heading shows 'Example 1: Element on page that is hidden'
  2. Navigate directly to https://the-internet.herokuapp.com/dynamic_loading/2 without visiting landing page first
    - expect: Example 2 page loads successfully
    - expect: Start button is visible
    - expect: Page heading shows 'Example 2: Element rendered after the fact'

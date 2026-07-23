# Add/Remove Elements Test Plan

## Application Overview

The Add/Remove Elements page is a simple interactive application that allows users to dynamically add and remove button elements from the DOM. The page features a single "Add Element" button that, when clicked, creates a "Delete" button. Each "Delete" button removes itself when clicked. The page does not reload or navigate during any interactions, maintaining its state purely through JavaScript DOM manipulation. This test plan covers functional validation of the add/remove operations, boundary conditions, and UI state consistency.

## Test Scenarios

### 1. Add/Remove Elements Core Functionality

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-ADDREMOVE-001: Initial Page Load State

**File:** `tests/add-remove-elements/initial-page-load.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/add_remove_elements/
    - expect: Page loads successfully
    - expect: Page title is 'The Internet'
    - expect: Page URL is exactly 'https://the-internet.herokuapp.com/add_remove_elements/'
  2. Verify the presence of the 'Add Element' button
    - expect: The 'Add Element' button is visible
    - expect: The 'Add Element' button is enabled and clickable
  3. Verify the absence of any 'Delete' buttons
    - expect: No 'Delete' buttons are present on the page
    - expect: The Delete button container exists but is empty
  4. Verify the page heading
    - expect: The heading 'Add/Remove Elements' is visible

#### 1.2. TC-ADDREMOVE-002: Add Single Element

**File:** `tests/add-remove-elements/add-single-element.spec.ts`

**Steps:**
  1. Navigate to the application URL
    - expect: Page loads with no Delete buttons present
  2. Click the 'Add Element' button once
    - expect: Exactly one 'Delete' button appears on the page
    - expect: The 'Delete' button is visible and clickable
    - expect: The 'Add Element' button remains visible and clickable
  3. Verify the page URL
    - expect: The URL remains 'https://the-internet.herokuapp.com/add_remove_elements/'
    - expect: The page has not reloaded or navigated

#### 1.3. TC-ADDREMOVE-003: Add Multiple Elements Sequentially

**File:** `tests/add-remove-elements/add-multiple-elements.spec.ts`

**Steps:**
  1. Navigate to the application URL
    - expect: Page loads with no Delete buttons present
  2. Click the 'Add Element' button 5 times
    - expect: Exactly 5 'Delete' buttons appear on the page
    - expect: All 5 'Delete' buttons are visible and clickable
    - expect: The 'Add Element' button remains functional after each click
  3. Count the number of Delete buttons
    - expect: The count equals exactly 5
    - expect: Each button is independently clickable
  4. Verify the page state
    - expect: The URL remains unchanged
    - expect: The page has not reloaded

#### 1.4. TC-ADDREMOVE-004: Delete Single Element from Middle Position

**File:** `tests/add-remove-elements/delete-single-element.spec.ts`

**Steps:**
  1. Navigate to the application URL and add 5 Delete buttons
    - expect: 5 Delete buttons are present
  2. Click the 3rd Delete button (middle position)
    - expect: Only the clicked Delete button is removed
    - expect: Exactly 4 Delete buttons remain visible
    - expect: The remaining buttons maintain their relative order
  3. Verify other buttons remain functional
    - expect: The first Delete button is still clickable
    - expect: The last Delete button is still clickable
    - expect: The 'Add Element' button remains functional
  4. Verify the page URL
    - expect: The URL remains unchanged

#### 1.5. TC-ADDREMOVE-005: Delete All Elements Sequentially

**File:** `tests/add-remove-elements/delete-all-elements.spec.ts`

**Steps:**
  1. Navigate to the application URL and add 5 Delete buttons
    - expect: 5 Delete buttons are present
  2. Click each Delete button one by one until all are removed
    - expect: Each click removes exactly one Delete button
    - expect: The count decreases by 1 after each deletion: 5→4→3→2→1→0
  3. Verify final state after all deletions
    - expect: Zero Delete buttons are present
    - expect: Only the 'Add Element' button remains visible
    - expect: The page has returned to its initial state
  4. Verify the 'Add Element' button still functions
    - expect: Clicking 'Add Element' successfully adds a new Delete button
  5. Verify the page URL
    - expect: The URL remains unchanged throughout all operations

#### 1.6. TC-ADDREMOVE-006: URL Stability During All Operations

**File:** `tests/add-remove-elements/url-stability.spec.ts`

**Steps:**
  1. Navigate to the application URL
    - expect: Initial URL is 'https://the-internet.herokuapp.com/add_remove_elements/'
  2. Add 3 Delete buttons
    - expect: URL remains 'https://the-internet.herokuapp.com/add_remove_elements/'
    - expect: Page has not reloaded (navigation type is not reload)
  3. Delete 1 button
    - expect: URL remains unchanged
    - expect: Page has not navigated away
  4. Add 2 more buttons
    - expect: URL remains unchanged
  5. Delete all remaining buttons
    - expect: URL remains 'https://the-internet.herokuapp.com/add_remove_elements/'
    - expect: The pathname is exactly '/add_remove_elements/'
    - expect: No query parameters or hash fragments have been added

### 2. Add/Remove Elements Edge Cases and Boundary Conditions

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-ADDREMOVE-007: Rapid Clicking Add Element Button

**File:** `tests/add-remove-elements/rapid-click-add.spec.ts`

**Steps:**
  1. Navigate to the application URL
    - expect: Page loads successfully
  2. Rapidly click the 'Add Element' button 10 times in quick succession (< 1 second total)
    - expect: Exactly 10 Delete buttons are created
    - expect: No buttons are lost or duplicated
    - expect: All buttons are visible and functional
  3. Verify DOM integrity
    - expect: Each Delete button has proper onclick handler
    - expect: The button container structure is intact

#### 2.2. TC-ADDREMOVE-008: Rapid Clicking Delete Buttons

**File:** `tests/add-remove-elements/rapid-click-delete.spec.ts`

**Steps:**
  1. Navigate to the application URL and add 10 Delete buttons
    - expect: 10 Delete buttons are present
  2. Rapidly click multiple Delete buttons in quick succession
    - expect: Each clicked button is removed immediately
    - expect: No race condition causes extra or missing deletions
    - expect: Remaining buttons stay functional
  3. Verify final count matches expected deletions
    - expect: Button count is accurate
    - expect: No orphaned or ghost buttons remain in the DOM

#### 2.3. TC-ADDREMOVE-009: Add Large Number of Elements

**File:** `tests/add-remove-elements/add-large-number.spec.ts`

**Steps:**
  1. Navigate to the application URL
    - expect: Page loads successfully
  2. Add 100 Delete buttons using JavaScript click loop
    - expect: Exactly 100 Delete buttons are created
    - expect: The page does not crash or become unresponsive
    - expect: All buttons are present in the DOM
  3. Verify a sample of buttons remains clickable
    - expect: The first Delete button is clickable
    - expect: A middle Delete button (e.g., 50th) is clickable
    - expect: The last Delete button is clickable
  4. Delete all 100 buttons
    - expect: All buttons can be successfully removed
    - expect: The page returns to initial state with zero Delete buttons

#### 2.4. TC-ADDREMOVE-010: Delete in Non-Sequential Order

**File:** `tests/add-remove-elements/delete-non-sequential.spec.ts`

**Steps:**
  1. Navigate to the application URL and add 10 Delete buttons
    - expect: 10 Delete buttons are present
  2. Delete the 8th button
    - expect: Only the 8th button is removed
    - expect: 9 buttons remain
  3. Delete the 1st button
    - expect: Only the 1st button is removed
    - expect: 8 buttons remain
  4. Delete the last button
    - expect: Only the last button is removed
    - expect: 7 buttons remain
  5. Delete the 3rd button from the remaining set
    - expect: Only that button is removed
    - expect: 6 buttons remain
    - expect: All remaining buttons are still functional
  6. Verify button indices remain stable
    - expect: Each remaining button can still be independently clicked and removed
    - expect: No index confusion or incorrect targeting occurs

#### 2.5. TC-ADDREMOVE-011: Add After Delete Operations

**File:** `tests/add-remove-elements/add-after-delete.spec.ts`

**Steps:**
  1. Navigate to the application URL and add 5 Delete buttons
    - expect: 5 Delete buttons are present
  2. Delete 3 buttons (any selection)
    - expect: 2 Delete buttons remain
  3. Click 'Add Element' button 4 times
    - expect: 4 new Delete buttons are added
    - expect: Total Delete button count is now 6 (2 + 4)
    - expect: All 6 buttons are functional
  4. Delete 2 of the original buttons
    - expect: 4 Delete buttons remain (all from the second add operation)
  5. Add 1 more button
    - expect: Total count is 5
    - expect: 'Add Element' button continues to work correctly after mixed operations

#### 2.6. TC-ADDREMOVE-012: Delete First Button Multiple Times

**File:** `tests/add-remove-elements/delete-first-repeatedly.spec.ts`

**Steps:**
  1. Navigate to the application URL and add 10 Delete buttons
    - expect: 10 Delete buttons are present
  2. Repeatedly click the first Delete button 5 times
    - expect: Each click removes the current first button
    - expect: Button count decreases: 10→9→8→7→6→5
    - expect: After 5 deletions, exactly 5 buttons remain
  3. Verify remaining buttons
    - expect: The 5 remaining buttons are the original 6th through 10th buttons
    - expect: All remaining buttons are functional

#### 2.7. TC-ADDREMOVE-013: Delete Last Button Multiple Times

**File:** `tests/add-remove-elements/delete-last-repeatedly.spec.ts`

**Steps:**
  1. Navigate to the application URL and add 10 Delete buttons
    - expect: 10 Delete buttons are present
  2. Repeatedly click the last Delete button 5 times
    - expect: Each click removes the current last button
    - expect: Button count decreases: 10→9→8→7→6→5
    - expect: After 5 deletions, exactly 5 buttons remain
  3. Verify remaining buttons
    - expect: The 5 remaining buttons are the original 1st through 5th buttons
    - expect: All remaining buttons are functional

#### 2.8. TC-ADDREMOVE-014: Alternating Add and Delete Operations

**File:** `tests/add-remove-elements/alternating-add-delete.spec.ts`

**Steps:**
  1. Navigate to the application URL
    - expect: Page loads with 0 Delete buttons
  2. Add 1 button, delete 1 button, add 1 button, delete 1 button (repeat 5 times)
    - expect: After each add, count is 1
    - expect: After each delete, count is 0
    - expect: Pattern repeats successfully without errors
  3. Perform a final add operation
    - expect: Exactly 1 Delete button remains
    - expect: The button is functional
  4. Verify page state
    - expect: 'Add Element' button remains functional throughout
    - expect: URL has never changed

#### 2.9. TC-ADDREMOVE-015: Delete All Then Verify Clean State

**File:** `tests/add-remove-elements/delete-all-clean-state.spec.ts`

**Steps:**
  1. Navigate to the application URL and add 20 Delete buttons
    - expect: 20 Delete buttons are present
  2. Delete all 20 buttons using any deletion pattern
    - expect: All buttons are successfully removed
    - expect: Button count reaches 0
  3. Verify the page has returned to initial state
    - expect: No Delete buttons are visible in the UI
    - expect: No Delete button elements exist in the DOM
    - expect: The Delete button container is empty
    - expect: Only the 'Add Element' button is present
  4. Add a new Delete button
    - expect: The new button appears correctly
    - expect: 'Add Element' functionality is fully restored

### 3. Add/Remove Elements Negative and Validation Tests

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-ADDREMOVE-016: Double-Click Delete Button

**File:** `tests/add-remove-elements/double-click-delete.spec.ts`

**Steps:**
  1. Navigate to the application URL and add 5 Delete buttons
    - expect: 5 Delete buttons are present
  2. Double-click the 3rd Delete button rapidly
    - expect: The button is removed after the first click
    - expect: The second click does not cause errors
    - expect: Only 1 button is removed (not 2)
    - expect: 4 Delete buttons remain
  3. Verify no unintended side effects
    - expect: No JavaScript errors in console
    - expect: Remaining buttons are all functional

#### 3.2. TC-ADDREMOVE-017: Click Delete Button Container Instead of Button

**File:** `tests/add-remove-elements/click-container.spec.ts`

**Steps:**
  1. Navigate to the application URL and add 3 Delete buttons
    - expect: 3 Delete buttons are present
  2. Click the container area between or around Delete buttons (not the buttons themselves)
    - expect: No buttons are removed
    - expect: Button count remains 3
    - expect: No errors occur
  3. Click a Delete button to verify functionality
    - expect: The clicked button is removed successfully
    - expect: 2 buttons remain

#### 3.3. TC-ADDREMOVE-018: Add Zero Elements Then Delete

**File:** `tests/add-remove-elements/no-add-then-delete.spec.ts`

**Steps:**
  1. Navigate to the application URL
    - expect: No Delete buttons are present
  2. Attempt to locate and click a Delete button using selector
    - expect: No Delete button is found
    - expect: No action is performed
    - expect: No errors occur
  3. Verify page state remains stable
    - expect: 'Add Element' button is still functional
    - expect: Page is in initial state

#### 3.4. TC-ADDREMOVE-019: Verify No Maximum Limit on Add Operations

**File:** `tests/add-remove-elements/no-maximum-limit.spec.ts`

**Steps:**
  1. Navigate to the application URL
    - expect: Page loads successfully
  2. Add 500 Delete buttons using automated clicking
    - expect: Exactly 500 Delete buttons are created
    - expect: The page does not impose a hard limit on button count
    - expect: The page remains responsive (or gracefully handles the load)
  3. Verify a sample of buttons is functional
    - expect: Random buttons from the set can be clicked and removed
    - expect: No JavaScript errors occur
  4. Clean up by deleting all buttons
    - expect: All 500 buttons can be removed
    - expect: Page returns to initial state

#### 3.5. TC-ADDREMOVE-020: Browser Back Button Does Not Affect State

**File:** `tests/add-remove-elements/browser-back-button.spec.ts`

**Steps:**
  1. Navigate to the application URL and add 5 Delete buttons
    - expect: 5 Delete buttons are present
  2. Navigate to a different page (e.g., https://the-internet.herokuapp.com/)
    - expect: Navigation is successful
  3. Click the browser back button to return to /add_remove_elements/
    - expect: The page reloads to its initial state
    - expect: No Delete buttons are present (state is not persisted)
    - expect: Only the 'Add Element' button is visible
  4. Verify functionality after back navigation
    - expect: 'Add Element' button works correctly
    - expect: Delete buttons can be added and removed normally

#### 3.6. TC-ADDREMOVE-021: Page Refresh Resets State

**File:** `tests/add-remove-elements/page-refresh-reset.spec.ts`

**Steps:**
  1. Navigate to the application URL and add 10 Delete buttons
    - expect: 10 Delete buttons are present
  2. Refresh the page (F5 or browser reload)
    - expect: The page reloads to its initial state
    - expect: All previously added Delete buttons are gone
    - expect: No Delete buttons are present
    - expect: Only the 'Add Element' button remains
  3. Verify functionality after refresh
    - expect: 'Add Element' button functions correctly
    - expect: New Delete buttons can be added and removed

#### 3.7. TC-ADDREMOVE-022: No JavaScript Errors in Console

**File:** `tests/add-remove-elements/no-console-errors.spec.ts`

**Steps:**
  1. Navigate to the application URL with console monitoring enabled
    - expect: Page loads successfully
  2. Perform a series of mixed operations: add 10 buttons, delete 5, add 3, delete all
    - expect: All operations complete successfully
  3. Check the browser console for JavaScript errors
    - expect: No critical JavaScript errors are logged (ignore unrelated third-party warnings)
    - expect: No exceptions are thrown during add/delete operations

#### 3.8. TC-ADDREMOVE-023: Verify Button Rendering and CSS

**File:** `tests/add-remove-elements/button-rendering.spec.ts`

**Steps:**
  1. Navigate to the application URL and add 3 Delete buttons
    - expect: 3 Delete buttons are present
  2. Verify each Delete button has correct visual properties
    - expect: Each button displays the text 'Delete'
    - expect: Each button is styled consistently
    - expect: Each button has a visible clickable area
    - expect: Buttons are vertically or horizontally aligned in a consistent layout
  3. Verify 'Add Element' button styling
    - expect: The 'Add Element' button is visually distinct or similarly styled
    - expect: The button is clearly labeled and accessible

#### 3.9. TC-ADDREMOVE-024: Keyboard Accessibility for Add Element Button

**File:** `tests/add-remove-elements/keyboard-add-element.spec.ts`

**Steps:**
  1. Navigate to the application URL
    - expect: Page loads successfully
  2. Tab to focus on the 'Add Element' button
    - expect: The 'Add Element' button receives keyboard focus
    - expect: Focus indicator is visible
  3. Press Enter or Space key while 'Add Element' is focused
    - expect: A Delete button is added
    - expect: Keyboard interaction works identically to mouse click
  4. Repeat key press 2 more times
    - expect: Total of 3 Delete buttons are added via keyboard

#### 3.10. TC-ADDREMOVE-025: Keyboard Accessibility for Delete Buttons

**File:** `tests/add-remove-elements/keyboard-delete-button.spec.ts`

**Steps:**
  1. Navigate to the application URL and add 5 Delete buttons
    - expect: 5 Delete buttons are present
  2. Tab to focus on the first Delete button
    - expect: The first Delete button receives keyboard focus
    - expect: Focus indicator is visible
  3. Press Enter or Space key while Delete button is focused
    - expect: The focused Delete button is removed
    - expect: 4 Delete buttons remain
  4. Tab to another Delete button and press Enter
    - expect: That button is removed
    - expect: 3 Delete buttons remain
    - expect: Keyboard navigation and deletion work correctly

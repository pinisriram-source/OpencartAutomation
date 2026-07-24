# Checkboxes Test Plan

## Application Overview

This test plan covers the Checkboxes page at https://the-internet.herokuapp.com/checkboxes. The page contains two checkboxes with different initial states: checkbox 1 starts unchecked and checkbox 2 starts checked. The plan validates initial page state, checkbox toggling behavior, independence of checkbox states, URL persistence, and edge cases including rapid toggling.

## Test Scenarios

### 1. Initial Page State

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-CHECKBOXES-001: Verify page loads with correct heading and checkboxes visible

**File:** `tests/checkboxes/page-load-elements-visible.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: The page loads successfully
    - expect: The URL is https://the-internet.herokuapp.com/checkboxes
    - expect: The page title is 'The Internet'
  2. Verify the page heading
    - expect: The h3 heading displays 'Checkboxes'
  3. Verify checkbox elements are present
    - expect: Two checkbox elements are visible on the page
    - expect: Text 'checkbox 1' appears after the first checkbox
    - expect: Text 'checkbox 2' appears after the second checkbox

#### 1.2. TC-CHECKBOXES-002: Verify checkbox 1 is unchecked by default

**File:** `tests/checkboxes/checkbox-1-default-unchecked.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: The page loads successfully
  2. Verify the state of checkbox 1
    - expect: Checkbox 1 is present
    - expect: Checkbox 1 is unchecked (not selected)
    - expect: Checkbox 1 does not have the 'checked' attribute

#### 1.3. TC-CHECKBOXES-003: Verify checkbox 2 is checked by default

**File:** `tests/checkboxes/checkbox-2-default-checked.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: The page loads successfully
  2. Verify the state of checkbox 2
    - expect: Checkbox 2 is present
    - expect: Checkbox 2 is checked (selected)
    - expect: Checkbox 2 has the 'checked' attribute

### 2. Checkbox Toggle Functionality

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-CHECKBOXES-004: Verify clicking checkbox 1 checks it

**File:** `tests/checkboxes/checkbox-1-click-to-check.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: The page loads successfully
    - expect: Checkbox 1 is initially unchecked
  2. Click on checkbox 1
    - expect: Checkbox 1 becomes checked
    - expect: Checkbox 1 has the 'checked' attribute

#### 2.2. TC-CHECKBOXES-005: Verify clicking checked checkbox 1 unchecks it

**File:** `tests/checkboxes/checkbox-1-click-to-uncheck.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: The page loads successfully
  2. Click on checkbox 1 to check it
    - expect: Checkbox 1 becomes checked
  3. Click on checkbox 1 again
    - expect: Checkbox 1 becomes unchecked
    - expect: Checkbox 1 does not have the 'checked' attribute

#### 2.3. TC-CHECKBOXES-006: Verify clicking checkbox 2 unchecks it

**File:** `tests/checkboxes/checkbox-2-click-to-uncheck.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: The page loads successfully
    - expect: Checkbox 2 is initially checked
  2. Click on checkbox 2
    - expect: Checkbox 2 becomes unchecked
    - expect: Checkbox 2 does not have the 'checked' attribute

#### 2.4. TC-CHECKBOXES-007: Verify clicking unchecked checkbox 2 checks it

**File:** `tests/checkboxes/checkbox-2-click-to-check.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: The page loads successfully
  2. Click on checkbox 2 to uncheck it
    - expect: Checkbox 2 becomes unchecked
  3. Click on checkbox 2 again
    - expect: Checkbox 2 becomes checked
    - expect: Checkbox 2 has the 'checked' attribute

#### 2.5. TC-CHECKBOXES-008: Verify multiple toggles of checkbox 1 work correctly

**File:** `tests/checkboxes/checkbox-1-multiple-toggles.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: Checkbox 1 is initially unchecked
  2. Click checkbox 1 (first time)
    - expect: Checkbox 1 is checked
  3. Click checkbox 1 (second time)
    - expect: Checkbox 1 is unchecked
  4. Click checkbox 1 (third time)
    - expect: Checkbox 1 is checked
  5. Click checkbox 1 (fourth time)
    - expect: Checkbox 1 is unchecked

#### 2.6. TC-CHECKBOXES-009: Verify multiple toggles of checkbox 2 work correctly

**File:** `tests/checkboxes/checkbox-2-multiple-toggles.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: Checkbox 2 is initially checked
  2. Click checkbox 2 (first time)
    - expect: Checkbox 2 is unchecked
  3. Click checkbox 2 (second time)
    - expect: Checkbox 2 is checked
  4. Click checkbox 2 (third time)
    - expect: Checkbox 2 is unchecked
  5. Click checkbox 2 (fourth time)
    - expect: Checkbox 2 is checked

### 3. Checkbox Independence

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-CHECKBOXES-010: Verify checking checkbox 1 does not affect checkbox 2

**File:** `tests/checkboxes/checkbox-1-independence-from-2.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: Checkbox 1 is unchecked
    - expect: Checkbox 2 is checked
  2. Click checkbox 1 to check it
    - expect: Checkbox 1 is checked
    - expect: Checkbox 2 remains checked (unchanged)

#### 3.2. TC-CHECKBOXES-011: Verify unchecking checkbox 2 does not affect checkbox 1

**File:** `tests/checkboxes/checkbox-2-independence-from-1.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: Checkbox 1 is unchecked
    - expect: Checkbox 2 is checked
  2. Click checkbox 2 to uncheck it
    - expect: Checkbox 2 is unchecked
    - expect: Checkbox 1 remains unchecked (unchanged)

#### 3.3. TC-CHECKBOXES-012: Verify both checkboxes can be checked simultaneously

**File:** `tests/checkboxes/both-checkboxes-checked.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: Checkbox 1 is unchecked
    - expect: Checkbox 2 is checked
  2. Click checkbox 1 to check it
    - expect: Checkbox 1 is checked
    - expect: Checkbox 2 is checked
    - expect: Both checkboxes are now checked

#### 3.4. TC-CHECKBOXES-013: Verify both checkboxes can be unchecked simultaneously

**File:** `tests/checkboxes/both-checkboxes-unchecked.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: Checkbox 1 is unchecked
    - expect: Checkbox 2 is checked
  2. Click checkbox 2 to uncheck it
    - expect: Checkbox 1 is unchecked
    - expect: Checkbox 2 is unchecked
    - expect: Both checkboxes are now unchecked

#### 3.5. TC-CHECKBOXES-014: Verify alternating checkbox toggles maintain independence

**File:** `tests/checkboxes/alternating-toggle-independence.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: Checkbox 1 is unchecked
    - expect: Checkbox 2 is checked
  2. Click checkbox 1
    - expect: Checkbox 1 is checked
    - expect: Checkbox 2 is checked
  3. Click checkbox 2
    - expect: Checkbox 1 is checked
    - expect: Checkbox 2 is unchecked
  4. Click checkbox 1
    - expect: Checkbox 1 is unchecked
    - expect: Checkbox 2 is unchecked
  5. Click checkbox 2
    - expect: Checkbox 1 is unchecked
    - expect: Checkbox 2 is checked

### 4. URL and Page Stability

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-CHECKBOXES-015: Verify URL remains unchanged after clicking checkbox 1

**File:** `tests/checkboxes/url-persistence-checkbox-1.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: The URL is https://the-internet.herokuapp.com/checkboxes
  2. Click checkbox 1
    - expect: The URL remains https://the-internet.herokuapp.com/checkboxes
    - expect: No navigation or page reload occurs

#### 4.2. TC-CHECKBOXES-016: Verify URL remains unchanged after clicking checkbox 2

**File:** `tests/checkboxes/url-persistence-checkbox-2.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: The URL is https://the-internet.herokuapp.com/checkboxes
  2. Click checkbox 2
    - expect: The URL remains https://the-internet.herokuapp.com/checkboxes
    - expect: No navigation or page reload occurs

#### 4.3. TC-CHECKBOXES-017: Verify URL remains unchanged after multiple checkbox clicks

**File:** `tests/checkboxes/url-persistence-multiple-clicks.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: The URL is https://the-internet.herokuapp.com/checkboxes
  2. Click checkbox 1
    - expect: The URL remains https://the-internet.herokuapp.com/checkboxes
  3. Click checkbox 2
    - expect: The URL remains https://the-internet.herokuapp.com/checkboxes
  4. Click checkbox 1 again
    - expect: The URL remains https://the-internet.herokuapp.com/checkboxes
  5. Click checkbox 2 again
    - expect: The URL remains https://the-internet.herokuapp.com/checkboxes

#### 4.4. TC-CHECKBOXES-018: Verify page does not reload when toggling checkboxes

**File:** `tests/checkboxes/no-page-reload.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: The page loads successfully
  2. Record a unique identifier or timestamp in the page context
    - expect: The identifier is captured
  3. Click checkbox 1
    - expect: The page identifier remains unchanged
    - expect: No page reload occurred
  4. Click checkbox 2
    - expect: The page identifier remains unchanged
    - expect: No page reload occurred

### 5. Edge Cases and Boundary Conditions

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-CHECKBOXES-019: Verify rapid clicking on checkbox 1 toggles state correctly

**File:** `tests/checkboxes/rapid-clicking-checkbox-1.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: Checkbox 1 is unchecked
  2. Rapidly click checkbox 1 ten times in succession
    - expect: Checkbox 1 ends in the checked state (even number of clicks)
    - expect: Each click is properly registered
    - expect: No errors or unexpected behavior occurs

#### 5.2. TC-CHECKBOXES-020: Verify rapid clicking on checkbox 2 toggles state correctly

**File:** `tests/checkboxes/rapid-clicking-checkbox-2.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: Checkbox 2 is checked
  2. Rapidly click checkbox 2 ten times in succession
    - expect: Checkbox 2 ends in the unchecked state (even number of clicks from checked)
    - expect: Each click is properly registered
    - expect: No errors or unexpected behavior occurs

#### 5.3. TC-CHECKBOXES-021: Verify checkbox state persists after clicking the page heading

**File:** `tests/checkboxes/state-persists-after-other-click.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: Checkbox 1 is unchecked
    - expect: Checkbox 2 is checked
  2. Click checkbox 1 to check it
    - expect: Checkbox 1 is checked
  3. Click on the page heading 'Checkboxes'
    - expect: Checkbox 1 remains checked
    - expect: Checkbox 2 remains checked
    - expect: No checkbox state changes

#### 5.4. TC-CHECKBOXES-022: Verify checkbox state after page refresh

**File:** `tests/checkboxes/state-after-page-refresh.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: Checkbox 1 is unchecked
    - expect: Checkbox 2 is checked
  2. Click checkbox 1 to check it
    - expect: Checkbox 1 is checked
  3. Click checkbox 2 to uncheck it
    - expect: Checkbox 2 is unchecked
  4. Refresh the page
    - expect: The page reloads
    - expect: Checkbox 1 returns to its default state (unchecked)
    - expect: Checkbox 2 returns to its default state (checked)
    - expect: Checkbox states are not persisted across page refresh

#### 5.5. TC-CHECKBOXES-023: Verify checkbox interaction using keyboard (Space key)

**File:** `tests/checkboxes/keyboard-space-toggle.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: Checkbox 1 is unchecked
  2. Focus on checkbox 1 using Tab key
    - expect: Checkbox 1 receives focus
  3. Press Space key
    - expect: Checkbox 1 becomes checked
  4. Press Space key again
    - expect: Checkbox 1 becomes unchecked

#### 5.6. TC-CHECKBOXES-024: Verify both checkboxes are focusable and accessible

**File:** `tests/checkboxes/keyboard-accessibility.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/checkboxes
    - expect: The page loads successfully
  2. Press Tab key to navigate through page elements
    - expect: Checkbox 1 can receive focus via Tab key
    - expect: Checkbox 2 can receive focus via Tab key
    - expect: Both checkboxes are accessible via keyboard navigation

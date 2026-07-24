# Dropdown Smoke Test Plan

## Application Overview

This test plan validates the dropdown functionality on The Internet's dropdown page (https://the-internet.herokuapp.com/dropdown). The page contains a single select dropdown with a disabled placeholder option and two selectable options. This test plan covers initial state verification, option selection, option switching, disabled placeholder behavior, and page state stability.

## Test Scenarios

### 1. Dropdown Functionality

**Seed:** `N/A - No authentication or special setup required`

#### 1.1. Verify initial page load state

**File:** `tests/dropdown/TC-DROPDOWN-001-InitialState.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: Page loads successfully
    - expect: Page title is 'The Internet'
    - expect: Heading 'Dropdown List' is visible
  2. Locate the dropdown element on the page
    - expect: Dropdown is visible
    - expect: Dropdown has id 'dropdown'
  3. Verify the dropdown's selected value
    - expect: Placeholder 'Please select an option' is selected
    - expect: Selected index is 0
    - expect: Selected value is empty string
  4. Verify no option other than placeholder is selected
    - expect: Option 1 is not selected
    - expect: Option 2 is not selected

#### 1.2. Verify placeholder option is disabled

**File:** `tests/dropdown/TC-DROPDOWN-002-PlaceholderDisabled.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: Page loads successfully
  2. Inspect the first option in the dropdown (placeholder)
    - expect: Placeholder option text is 'Please select an option'
    - expect: Placeholder option value is empty string
    - expect: Placeholder option has 'disabled' attribute set to true
  3. Verify placeholder option properties
    - expect: Placeholder option index is 0
    - expect: Placeholder is marked as disabled in the DOM

#### 1.3. Select Option 1 successfully

**File:** `tests/dropdown/TC-DROPDOWN-003-SelectOption1.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: Page loads with placeholder selected
  2. Select 'Option 1' from the dropdown
    - expect: Dropdown value changes to '1'
    - expect: Selected text is 'Option 1'
    - expect: Selected index is 1
  3. Verify the selection persists
    - expect: Option 1 remains selected
    - expect: Placeholder is no longer selected

#### 1.4. Select Option 2 successfully

**File:** `tests/dropdown/TC-DROPDOWN-004-SelectOption2.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: Page loads with placeholder selected
  2. Select 'Option 2' from the dropdown
    - expect: Dropdown value changes to '2'
    - expect: Selected text is 'Option 2'
    - expect: Selected index is 2
  3. Verify the selection persists
    - expect: Option 2 remains selected
    - expect: Placeholder is no longer selected

#### 1.5. Switch from Option 1 to Option 2 directly

**File:** `tests/dropdown/TC-DROPDOWN-005-SwitchOption1ToOption2.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: Page loads with placeholder selected
  2. Select 'Option 1' from the dropdown
    - expect: Option 1 is selected
    - expect: Dropdown value is '1'
  3. Select 'Option 2' from the dropdown without reselecting placeholder
    - expect: Dropdown value changes to '2'
    - expect: Selected text is 'Option 2'
    - expect: Selected index is 2
    - expect: Placeholder is not selected
  4. Verify the final state
    - expect: Option 2 is selected
    - expect: Option 1 is no longer selected

#### 1.6. Switch from Option 2 to Option 1 directly

**File:** `tests/dropdown/TC-DROPDOWN-006-SwitchOption2ToOption1.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: Page loads with placeholder selected
  2. Select 'Option 2' from the dropdown
    - expect: Option 2 is selected
    - expect: Dropdown value is '2'
  3. Select 'Option 1' from the dropdown without reselecting placeholder
    - expect: Dropdown value changes to '1'
    - expect: Selected text is 'Option 1'
    - expect: Selected index is 1
    - expect: Placeholder is not selected
  4. Verify the final state
    - expect: Option 1 is selected
    - expect: Option 2 is no longer selected

#### 1.7. Verify dropdown has exactly 3 options in correct order

**File:** `tests/dropdown/TC-DROPDOWN-007-OptionCountAndOrder.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: Page loads successfully
  2. Count the total number of options in the dropdown
    - expect: Dropdown contains exactly 3 options
  3. Verify option at index 0
    - expect: Index 0 text is 'Please select an option'
    - expect: Index 0 value is empty string
    - expect: Index 0 is disabled
  4. Verify option at index 1
    - expect: Index 1 text is 'Option 1'
    - expect: Index 1 value is '1'
    - expect: Index 1 is not disabled
  5. Verify option at index 2
    - expect: Index 2 text is 'Option 2'
    - expect: Index 2 value is '2'
    - expect: Index 2 is not disabled

#### 1.8. Verify page never navigates when selecting options

**File:** `tests/dropdown/TC-DROPDOWN-008-NoNavigationOnSelection.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: Page URL is 'https://the-internet.herokuapp.com/dropdown'
  2. Select 'Option 1' from the dropdown
    - expect: Option 1 is selected
    - expect: Page URL remains 'https://the-internet.herokuapp.com/dropdown'
    - expect: Page does not reload
  3. Select 'Option 2' from the dropdown
    - expect: Option 2 is selected
    - expect: Page URL remains 'https://the-internet.herokuapp.com/dropdown'
    - expect: Page does not reload
  4. Select 'Option 1' again
    - expect: Option 1 is selected
    - expect: Page URL remains 'https://the-internet.herokuapp.com/dropdown'
    - expect: Page does not reload

#### 1.9. Verify placeholder cannot be selected via user interaction after initial load

**File:** `tests/dropdown/TC-DROPDOWN-009-PlaceholderNotSelectableViaUI.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: Page loads with placeholder selected
  2. Select 'Option 1' from the dropdown
    - expect: Option 1 is selected
  3. Attempt to select the placeholder option via the UI
    - expect: Placeholder cannot be selected
    - expect: Option 1 remains selected
    - expect: User cannot choose the disabled placeholder from the dropdown list

#### 1.10. Verify dropdown has no form submission behavior

**File:** `tests/dropdown/TC-DROPDOWN-010-NoFormSubmission.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: Page loads successfully
  2. Inspect the dropdown element's parent hierarchy
    - expect: Dropdown is not contained within a <form> element
    - expect: No submit button exists on the page
  3. Select 'Option 1' and verify no form submission occurs
    - expect: No form submission event is triggered
    - expect: Page does not navigate away
  4. Verify dropdown element attributes
    - expect: Dropdown has no 'onchange' handler that navigates
    - expect: Dropdown has id='dropdown'
    - expect: Dropdown has no name attribute

#### 1.11. Verify dropdown state persists during same-session navigation

**File:** `tests/dropdown/TC-DROPDOWN-011-StatePersistence.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: Page loads with placeholder selected
  2. Select 'Option 2' from the dropdown
    - expect: Option 2 is selected
  3. Note the selected value
    - expect: Selected value is '2'
  4. Reload the page (refresh)
    - expect: Page loads with placeholder selected (state does not persist across reload)
    - expect: Dropdown resets to initial state

#### 1.12. Verify selecting same option multiple times

**File:** `tests/dropdown/TC-DROPDOWN-012-SelectSameOptionRepeatedly.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: Page loads with placeholder selected
  2. Select 'Option 1' from the dropdown
    - expect: Option 1 is selected
    - expect: Dropdown value is '1'
  3. Select 'Option 1' again (re-select same option)
    - expect: Option 1 remains selected
    - expect: Dropdown value is still '1'
    - expect: No error occurs
  4. Select 'Option 1' a third time
    - expect: Option 1 remains selected
    - expect: Behavior is consistent

#### 1.13. Verify dropdown accessibility attributes

**File:** `tests/dropdown/TC-DROPDOWN-013-AccessibilityAttributes.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: Page loads successfully
  2. Inspect dropdown element for accessibility role
    - expect: Dropdown is a <select> element
    - expect: Element role is 'combobox' or native select
  3. Verify options are properly structured
    - expect: Each option is an <option> element
    - expect: Disabled option has 'disabled' attribute
    - expect: Options have text content
  4. Verify keyboard accessibility (Tab to dropdown)
    - expect: Dropdown can receive focus via Tab key
    - expect: Dropdown can be operated with arrow keys

#### 1.14. Verify dropdown visibility and layout

**File:** `tests/dropdown/TC-DROPDOWN-014-VisibilityAndLayout.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: Page loads successfully
  2. Verify dropdown is visible on page load
    - expect: Dropdown element is visible (not hidden)
    - expect: Dropdown is rendered in the viewport
    - expect: Dropdown has non-zero dimensions
  3. Verify page heading is present
    - expect: Heading 'Dropdown List' is visible above the dropdown
    - expect: Heading is an h3 element
  4. Verify dropdown placement
    - expect: Dropdown appears below the heading
    - expect: Dropdown is the primary interactive element on the page

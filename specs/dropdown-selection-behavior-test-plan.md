# Dropdown Selection Behavior

## Application Overview

This test plan validates the dropdown selection behavior on the Internet Heroku App dropdown page (https://the-internet.herokuapp.com/dropdown). The page contains a single select element with three options: a disabled placeholder ("Please select an option"), "Option 1" (value="1"), and "Option 2" (value="2"). The dropdown element has an id="dropdown" and includes a change listener. Testing focuses on initial state, selection behavior, disabled option handling, direct switching between options, option count validation, persistence behavior after page reload, and URL stability throughout interactions.

## Test Scenarios

### 1. Initial State and Visibility

**Seed:** `N/A - Direct navigation to page`

#### 1.1. TC-DROPDOWN-001: Verify dropdown is visible and displays default placeholder on initial page load

**File:** `tests/dropdown/initial-state.spec.ts`

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: The page loads successfully with title 'The Internet'
    - expect: The heading 'Dropdown List' is visible
    - expect: The dropdown element with id='dropdown' is visible on the page
2. Inspect the dropdown's selected value
    - expect: The dropdown's selected index is 0
    - expect: The dropdown's selected text is 'Please select an option'
    - expect: The dropdown's selected value is an empty string ''
    - expect: No real option (Option 1 or Option 2) is selected by default

#### 1.2. TC-DROPDOWN-002: Verify the dropdown contains exactly 3 options in the correct order

**File:** `tests/dropdown/option-count-and-order.spec.ts`

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: The page loads successfully
2. Retrieve all options from the dropdown element
    - expect: The dropdown contains exactly 3 options (no more, no fewer)
    - expect: Option at index 0 has text 'Please select an option', value='', disabled=true
    - expect: Option at index 1 has text 'Option 1', value='1', disabled=false
    - expect: Option at index 2 has text 'Option 2', value='2', disabled=false
    - expect: The options appear in this exact order: placeholder, Option 1, Option 2

### 2. Placeholder Disabled Behavior

**Seed:** `N/A - Direct navigation to page`

#### 2.1. TC-DROPDOWN-003: Verify the placeholder option is disabled and cannot be selected by user via UI

**File:** `tests/dropdown/placeholder-disabled.spec.ts`

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: The page loads successfully
2. Inspect the placeholder option (index 0) for the disabled attribute
    - expect: The placeholder option has disabled=true
    - expect: The placeholder option has the HTML disabled attribute present
    - expect: The disabled attribute prevents the placeholder from being clickable in the browser UI
3. Attempt to select the placeholder option via automated UI interaction (click simulation)
    - expect: The dropdown does not allow selection of the disabled placeholder via UI interaction
    - expect: If a valid option was previously selected, it remains selected (disabled option cannot override it via UI)

### 3. Single Option Selection

**Seed:** `N/A - Direct navigation to page`

#### 3.1. TC-DROPDOWN-004: Verify selecting Option 1 updates the dropdown's selected value to Option 1

**File:** `tests/dropdown/select-option-1.spec.ts`

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: The page loads successfully
    - expect: The placeholder 'Please select an option' is displayed by default
2. Select 'Option 1' from the dropdown (value='1')
    - expect: The dropdown's selected index changes to 1
    - expect: The dropdown's selected value changes to '1'
    - expect: The dropdown's selected text changes to 'Option 1'
    - expect: The dropdown visually displays 'Option 1' as the selected option
3. Verify the page URL
    - expect: The page URL remains https://the-internet.herokuapp.com/dropdown
    - expect: No navigation or page reload has occurred

#### 3.2. TC-DROPDOWN-005: Verify selecting Option 2 updates the dropdown's selected value to Option 2

**File:** `tests/dropdown/select-option-2.spec.ts`

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: The page loads successfully
    - expect: The placeholder 'Please select an option' is displayed by default
2. Select 'Option 2' from the dropdown (value='2')
    - expect: The dropdown's selected index changes to 2
    - expect: The dropdown's selected value changes to '2'
    - expect: The dropdown's selected text changes to 'Option 2'
    - expect: The dropdown visually displays 'Option 2' as the selected option
3. Verify the page URL
    - expect: The page URL remains https://the-internet.herokuapp.com/dropdown
    - expect: No navigation or page reload has occurred

### 4. Switching Between Options

**Seed:** `N/A - Direct navigation to page`

#### 4.1. TC-DROPDOWN-006: Verify switching directly from Option 1 to Option 2 updates the value correctly with no intermediate state

**File:** `tests/dropdown/switch-option-1-to-option-2.spec.ts`

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: The page loads successfully
2. Select 'Option 1' from the dropdown (value='1')
    - expect: The dropdown's selected value is '1'
    - expect: The dropdown's selected text is 'Option 1'
3. Without reselecting the placeholder, directly select 'Option 2' from the dropdown (value='2')
    - expect: The dropdown's selected index changes immediately to 2
    - expect: The dropdown's selected value changes immediately to '2'
    - expect: The dropdown's selected text changes immediately to 'Option 2'
    - expect: No stale or intermediate state (such as placeholder or Option 1) is shown during or after the transition
    - expect: The dropdown reflects the new selection cleanly
4. Verify the page URL
    - expect: The page URL remains https://the-internet.herokuapp.com/dropdown
    - expect: No navigation or page reload has occurred during the switch

#### 4.2. TC-DROPDOWN-007: Verify switching directly from Option 2 to Option 1 updates the value correctly with no intermediate state

**File:** `tests/dropdown/switch-option-2-to-option-1.spec.ts`

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: The page loads successfully
2. Select 'Option 2' from the dropdown (value='2')
    - expect: The dropdown's selected value is '2'
    - expect: The dropdown's selected text is 'Option 2'
3. Without reselecting the placeholder, directly select 'Option 1' from the dropdown (value='1')
    - expect: The dropdown's selected index changes immediately to 1
    - expect: The dropdown's selected value changes immediately to '1'
    - expect: The dropdown's selected text changes immediately to 'Option 1'
    - expect: No stale or intermediate state is shown during or after the transition
    - expect: The dropdown reflects the new selection cleanly
4. Verify the page URL
    - expect: The page URL remains https://the-internet.herokuapp.com/dropdown
    - expect: No navigation or page reload has occurred during the switch

### 5. Page Reload and Persistence

**Seed:** `N/A - Direct navigation to page`

#### 5.1. TC-DROPDOWN-008: Verify selected value does NOT persist after page reload and resets to default placeholder

**File:** `tests/dropdown/no-persistence-after-reload.spec.ts`

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: The page loads successfully
2. Select 'Option 2' from the dropdown (value='2')
    - expect: The dropdown's selected value is '2'
    - expect: The dropdown's selected text is 'Option 2'
3. Reload the page (navigate to https://the-internet.herokuapp.com/dropdown again or use browser refresh)
    - expect: The page reloads successfully
    - expect: The page URL is still https://the-internet.herokuapp.com/dropdown
4. Inspect the dropdown's selected value after reload
    - expect: The dropdown's selected index is 0
    - expect: The dropdown's selected value is an empty string ''
    - expect: The dropdown's selected text is 'Please select an option'
    - expect: The previously selected 'Option 2' is NOT retained
    - expect: The dropdown has reset to the default placeholder state

### 6. URL Stability

**Seed:** `N/A - Direct navigation to page`

#### 6.1. TC-DROPDOWN-009: Verify no dropdown interaction triggers page navigation or URL change

**File:** `tests/dropdown/url-stability.spec.ts`

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: The page loads successfully
    - expect: The current URL is https://the-internet.herokuapp.com/dropdown
2. Select 'Option 1' from the dropdown
    - expect: The dropdown's selected value changes to '1'
    - expect: The page URL remains https://the-internet.herokuapp.com/dropdown (no query params, no hash, no navigation)
3. Select 'Option 2' from the dropdown
    - expect: The dropdown's selected value changes to '2'
    - expect: The page URL remains https://the-internet.herokuapp.com/dropdown
4. Select 'Option 1' again
    - expect: The dropdown's selected value changes to '1'
    - expect: The page URL remains https://the-internet.herokuapp.com/dropdown
5. Verify no page reload occurred during any of the above interactions
    - expect: The page title remains 'The Internet' throughout
    - expect: The DOM is not refreshed (no full page reload)
    - expect: Only the dropdown's selected state changes in-place
    - expect: The URL is stable at https://the-internet.herokuapp.com/dropdown for all interactions

### 7. Boundary and Negative Cases

**Seed:** `N/A - Direct navigation to page`

#### 7.1. TC-DROPDOWN-010: Verify dropdown behavior when attempting rapid successive selections

**File:** `tests/dropdown/rapid-successive-selections.spec.ts`

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: The page loads successfully
2. Rapidly select 'Option 1', then immediately 'Option 2', then immediately 'Option 1' again in quick succession
    - expect: Each selection is registered correctly
    - expect: The final selected value is 'Option 1' (the last selection)
    - expect: No intermediate state is left hanging
    - expect: No JavaScript errors occur in the console
    - expect: The dropdown state is consistent and reflects the last selection

#### 7.2. TC-DROPDOWN-011: Verify dropdown does not accept invalid or out-of-range option values

**File:** `tests/dropdown/invalid-option-value.spec.ts`

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: The page loads successfully
2. Attempt to programmatically set the dropdown value to an invalid value (e.g., '3', 'invalid', 'Option 3') that does not exist in the option list
    - expect: The dropdown does not change its selected value to the invalid value
    - expect: The dropdown retains its previous valid state (placeholder if no selection was made)
    - expect: No JavaScript error is thrown
    - expect: The dropdown remains functional for subsequent valid selections

#### 7.3. TC-DROPDOWN-012: Verify dropdown contains no extra or missing options beyond the expected 3

**File:** `tests/dropdown/option-count-boundary.spec.ts`

**Steps:**
1. Navigate to https://the-internet.herokuapp.com/dropdown
    - expect: The page loads successfully
2. Retrieve the total count of options in the dropdown
    - expect: The dropdown has exactly 3 options
    - expect: The count is neither 2 (missing an option) nor 4 or more (extra options)
    - expect: Any deviation from exactly 3 options is treated as a failure

# Dynamic Controls Test Plan

## Application Overview

This test plan covers the Dynamic Controls page at https://the-internet.herokuapp.com/dynamic_controls. The page contains two independent interactive widgets that demonstrate asynchronous DOM manipulation:

1. **Checkbox Widget (Remove/Add)**: A checkbox that can be removed from and added back to the DOM via a button, with loading indicators during transitions.
2. **Text Input Widget (Enable/Disable)**: A text input field that can be enabled/disabled via a button, with loading indicators during transitions.

Both widgets operate independently and include loading spinners to simulate asynchronous operations. The test plan covers functional validation, state transitions, loading behavior, boundary cases, and independence verification.

## Test Scenarios

### 1. Dynamic Controls - Initial State

**Seed:** `N/A`

#### 1.1. TC-DYNCTRL-001-VerifyCheckboxWidgetInitialState

**File:** `tests/dynamic-controls/initial-state.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_controls
    - expect: Page loads successfully
    - expect: Page title is 'The Internet'
    - expect: Main heading 'Dynamic Controls' is visible
  2. Locate the checkbox widget section under 'Remove/add' heading
    - expect: Section heading 'Remove/add' is visible
    - expect: A checkbox labeled 'A checkbox' is present and visible
    - expect: The checkbox is not checked by default
    - expect: A button labeled 'Remove' is visible and enabled
  3. Verify no loading indicator is shown on initial load
    - expect: No loading spinner or 'Wait for it...' message is displayed in the checkbox widget section

#### 1.2. TC-DYNCTRL-002-VerifyTextInputWidgetInitialState

**File:** `tests/dynamic-controls/initial-state.spec.ts`

**Steps:**
  1. Navigate to https://the-internet.herokuapp.com/dynamic_controls
    - expect: Page loads successfully
  2. Locate the text input widget section under 'Enable/disable' heading
    - expect: Section heading 'Enable/disable' is visible
    - expect: A text input field is present and visible
    - expect: The text input field is disabled (not editable)
    - expect: A button labeled 'Enable' is visible and enabled
  3. Verify no loading indicator is shown on initial load
    - expect: No loading spinner or 'Wait for it...' message is displayed in the text input widget section

### 2. Dynamic Controls - Checkbox Widget Functionality

**Seed:** `N/A`

#### 2.1. TC-DYNCTRL-003-RemoveCheckboxSuccessfully

**File:** `tests/dynamic-controls/checkbox-widget.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Checkbox is visible with 'Remove' button
  2. Click the 'Remove' button
    - expect: Loading spinner appears immediately
    - expect: Text 'Wait for it...' is displayed
  3. Wait for the asynchronous operation to complete
    - expect: Loading spinner disappears
    - expect: Checkbox element is removed from the DOM
    - expect: Button label changes to 'Add'
    - expect: Success message 'It's gone!' appears
  4. Verify the checkbox is no longer in the DOM
    - expect: Checkbox element cannot be found
    - expect: Only the 'Add' button and success message remain

#### 2.2. TC-DYNCTRL-004-AddCheckboxBackSuccessfully

**File:** `tests/dynamic-controls/checkbox-widget.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Page loads successfully
  2. Click the 'Remove' button and wait for completion
    - expect: Checkbox is removed
    - expect: 'Add' button is visible
  3. Click the 'Add' button
    - expect: Loading spinner appears immediately
    - expect: Text 'Wait for it...' is displayed
  4. Wait for the asynchronous operation to complete
    - expect: Loading spinner disappears
    - expect: Checkbox is restored to the DOM
    - expect: Button label changes back to 'Remove'
    - expect: Success message 'It's back!' appears
  5. Verify the checkbox state
    - expect: Checkbox is visible and unchecked
    - expect: Checkbox is clickable

#### 2.3. TC-DYNCTRL-005-CheckboxTogglingWhenPresent

**File:** `tests/dynamic-controls/checkbox-widget.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Checkbox is visible and unchecked
  2. Click the checkbox to check it
    - expect: Checkbox becomes checked immediately
    - expect: No loading spinner appears
    - expect: No page reload occurs
    - expect: Button remains 'Remove'
  3. Click the checkbox again to uncheck it
    - expect: Checkbox becomes unchecked immediately
    - expect: No loading spinner appears
    - expect: Button remains 'Remove'

#### 2.4. TC-DYNCTRL-006-RemoveAddCycleMultipleTimes

**File:** `tests/dynamic-controls/checkbox-widget.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Checkbox is visible
  2. Click 'Remove' and wait for completion
    - expect: Checkbox removed
    - expect: 'Add' button shown
  3. Click 'Add' and wait for completion
    - expect: Checkbox restored
    - expect: 'Remove' button shown
  4. Click 'Remove' again and wait for completion
    - expect: Checkbox removed again
    - expect: 'Add' button shown
  5. Click 'Add' again and wait for completion
    - expect: Checkbox restored again
    - expect: 'Remove' button shown
    - expect: Widget remains functional after multiple cycles

#### 2.5. TC-DYNCTRL-007-CheckboxStatePersistsAfterRemoveAdd

**File:** `tests/dynamic-controls/checkbox-widget.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Checkbox is visible and unchecked
  2. Check the checkbox
    - expect: Checkbox is checked
  3. Click 'Remove' and wait for completion
    - expect: Checkbox removed from DOM
  4. Click 'Add' and wait for completion
    - expect: Checkbox restored to DOM
    - expect: Checkbox is in the default unchecked state (state does not persist across removal)

### 3. Dynamic Controls - Text Input Widget Functionality

**Seed:** `N/A`

#### 3.1. TC-DYNCTRL-008-EnableTextInputSuccessfully

**File:** `tests/dynamic-controls/text-input-widget.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Text input is visible and disabled
    - expect: 'Enable' button is visible
  2. Click the 'Enable' button
    - expect: Loading spinner appears immediately
    - expect: Text 'Wait for it...' is displayed
  3. Wait for the asynchronous operation to complete
    - expect: Loading spinner disappears
    - expect: Text input becomes enabled (editable)
    - expect: Button label changes to 'Disable'
    - expect: Success message 'It's enabled!' appears
  4. Type text into the enabled input field
    - expect: Text input accepts keyboard input
    - expect: Typed text appears in the field

#### 3.2. TC-DYNCTRL-009-DisableTextInputSuccessfully

**File:** `tests/dynamic-controls/text-input-widget.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Text input is disabled
  2. Click 'Enable' and wait for completion
    - expect: Text input is enabled
    - expect: 'Disable' button is visible
  3. Type some text into the input field
    - expect: Text is entered successfully
  4. Click the 'Disable' button
    - expect: Loading spinner appears immediately
    - expect: Text 'Wait for it...' is displayed
  5. Wait for the asynchronous operation to complete
    - expect: Loading spinner disappears
    - expect: Text input becomes disabled again
    - expect: Button label changes back to 'Enable'
    - expect: Success message 'It's disabled!' appears
    - expect: Previously entered text remains visible in the disabled field

#### 3.3. TC-DYNCTRL-010-EnableDisableCycleMultipleTimes

**File:** `tests/dynamic-controls/text-input-widget.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Text input is disabled
  2. Click 'Enable' and wait for completion
    - expect: Text input enabled
    - expect: 'Disable' button shown
  3. Click 'Disable' and wait for completion
    - expect: Text input disabled
    - expect: 'Enable' button shown
  4. Click 'Enable' again and wait for completion
    - expect: Text input enabled again
    - expect: 'Disable' button shown
  5. Click 'Disable' again and wait for completion
    - expect: Text input disabled again
    - expect: 'Enable' button shown
    - expect: Widget remains functional after multiple cycles

#### 3.4. TC-DYNCTRL-011-TextInputContentPersistsAcrossEnableDisable

**File:** `tests/dynamic-controls/text-input-widget.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Text input is disabled and empty
  2. Click 'Enable' and wait for completion
    - expect: Text input is enabled
  3. Type 'Test content' into the input field
    - expect: Text 'Test content' is displayed in the field
  4. Click 'Disable' and wait for completion
    - expect: Text input is disabled
    - expect: Text 'Test content' is still visible in the disabled field
  5. Click 'Enable' and wait for completion
    - expect: Text input is enabled
    - expect: Text 'Test content' is still present and editable

#### 3.5. TC-DYNCTRL-012-CannotTypeWhenDisabled

**File:** `tests/dynamic-controls/text-input-widget.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Text input is disabled
  2. Attempt to click on the disabled text input
    - expect: Input field does not gain focus
  3. Attempt to type text using keyboard
    - expect: No text is entered into the disabled field
    - expect: Field remains empty and disabled

### 4. Dynamic Controls - Widget Independence

**Seed:** `N/A`

#### 4.1. TC-DYNCTRL-013-CheckboxWidgetDoesNotAffectTextInput

**File:** `tests/dynamic-controls/widget-independence.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Both widgets are in initial state
  2. Verify initial state of text input
    - expect: Text input is disabled
    - expect: 'Enable' button is shown
  3. Click 'Remove' on the checkbox widget and wait for completion
    - expect: Checkbox is removed
  4. Check the text input widget state
    - expect: Text input is still disabled
    - expect: 'Enable' button is still shown
    - expect: Text input widget state unchanged
  5. Click 'Add' on the checkbox widget and wait for completion
    - expect: Checkbox is restored
  6. Check the text input widget state again
    - expect: Text input is still disabled
    - expect: 'Enable' button is still shown
    - expect: Text input widget state remains unchanged

#### 4.2. TC-DYNCTRL-014-TextInputWidgetDoesNotAffectCheckbox

**File:** `tests/dynamic-controls/widget-independence.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Both widgets are in initial state
  2. Check the checkbox
    - expect: Checkbox is checked
  3. Click 'Enable' on the text input widget and wait for completion
    - expect: Text input is enabled
  4. Check the checkbox widget state
    - expect: Checkbox is still present and checked
    - expect: 'Remove' button is still shown
    - expect: Checkbox widget state unchanged
  5. Click 'Disable' on the text input widget and wait for completion
    - expect: Text input is disabled
  6. Check the checkbox widget state again
    - expect: Checkbox is still present and checked
    - expect: 'Remove' button is still shown
    - expect: Checkbox widget state remains unchanged

#### 4.3. TC-DYNCTRL-015-SimultaneousOperationsOnBothWidgets

**File:** `tests/dynamic-controls/widget-independence.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Both widgets are in initial state
  2. Click 'Remove' on checkbox widget and immediately click 'Enable' on text input widget
    - expect: Both loading spinners appear independently
    - expect: Both operations complete successfully
  3. Verify final state
    - expect: Checkbox is removed with 'Add' button shown
    - expect: Text input is enabled with 'Disable' button shown
    - expect: Both widgets operated independently and correctly

### 5. Dynamic Controls - Loading Indicators

**Seed:** `N/A`

#### 5.1. TC-DYNCTRL-016-LoadingSpinnerAppearsOnCheckboxRemove

**File:** `tests/dynamic-controls/loading-indicators.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: No loading spinner visible
  2. Click the 'Remove' button on checkbox widget
    - expect: Loading spinner appears immediately
    - expect: Text 'Wait for it...' is visible
    - expect: Loading image/icon is displayed
  3. Wait for operation to complete
    - expect: Loading spinner disappears
    - expect: 'Wait for it...' message is removed from DOM

#### 5.2. TC-DYNCTRL-017-LoadingSpinnerAppearsOnCheckboxAdd

**File:** `tests/dynamic-controls/loading-indicators.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Checkbox visible
  2. Remove the checkbox and wait for completion
    - expect: Checkbox removed
  3. Click the 'Add' button
    - expect: Loading spinner appears immediately
    - expect: Text 'Wait for it...' is visible
    - expect: Loading image/icon is displayed
  4. Wait for operation to complete
    - expect: Loading spinner disappears
    - expect: 'Wait for it...' message is removed from DOM

#### 5.3. TC-DYNCTRL-018-LoadingSpinnerAppearsOnTextInputEnable

**File:** `tests/dynamic-controls/loading-indicators.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: No loading spinner visible in text input section
  2. Click the 'Enable' button on text input widget
    - expect: Loading spinner appears immediately
    - expect: Text 'Wait for it...' is visible
    - expect: Loading image/icon is displayed
  3. Wait for operation to complete
    - expect: Loading spinner disappears
    - expect: 'Wait for it...' message is removed from DOM

#### 5.4. TC-DYNCTRL-019-LoadingSpinnerAppearsOnTextInputDisable

**File:** `tests/dynamic-controls/loading-indicators.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Text input disabled
  2. Enable the text input and wait for completion
    - expect: Text input enabled
  3. Click the 'Disable' button
    - expect: Loading spinner appears immediately
    - expect: Text 'Wait for it...' is visible
    - expect: Loading image/icon is displayed
  4. Wait for operation to complete
    - expect: Loading spinner disappears
    - expect: 'Wait for it...' message is removed from DOM

### 6. Dynamic Controls - Boundary and Edge Cases

**Seed:** `N/A`

#### 6.1. TC-DYNCTRL-020-RapidClickingRemoveButton

**File:** `tests/dynamic-controls/boundary-cases.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Checkbox visible with 'Remove' button
  2. Click the 'Remove' button multiple times in rapid succession
    - expect: Only one loading operation is triggered
    - expect: Subsequent clicks during loading are ignored or queued appropriately
    - expect: No errors occur
  3. Wait for operation to complete
    - expect: Checkbox is removed successfully
    - expect: Widget state is consistent

#### 6.2. TC-DYNCTRL-021-RapidClickingEnableButton

**File:** `tests/dynamic-controls/boundary-cases.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Text input disabled with 'Enable' button
  2. Click the 'Enable' button multiple times in rapid succession
    - expect: Only one loading operation is triggered
    - expect: Subsequent clicks during loading are ignored or queued appropriately
    - expect: No errors occur
  3. Wait for operation to complete
    - expect: Text input is enabled successfully
    - expect: Widget state is consistent

#### 6.3. TC-DYNCTRL-022-CheckboxInteractionDuringRemoval

**File:** `tests/dynamic-controls/boundary-cases.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Checkbox visible and unchecked
  2. Click the 'Remove' button
    - expect: Loading spinner appears
  3. Immediately attempt to click the checkbox while removal is in progress
    - expect: Checkbox click is ignored or checkbox is already being removed
    - expect: No errors occur
    - expect: Removal operation completes successfully

#### 6.4. TC-DYNCTRL-023-TypeInTextInputDuringDisable

**File:** `tests/dynamic-controls/boundary-cases.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page and enable the text input
    - expect: Text input is enabled
  2. Type some text in the input field
    - expect: Text appears in field
  3. Click the 'Disable' button
    - expect: Loading spinner appears
  4. Immediately attempt to continue typing while disable is in progress
    - expect: Text input becomes disabled or is already disabled
    - expect: No additional text is entered after disabling begins
    - expect: Disable operation completes successfully

#### 6.5. TC-DYNCTRL-024-PageRefreshPreservesNoState

**File:** `tests/dynamic-controls/boundary-cases.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Initial state loaded
  2. Check the checkbox
    - expect: Checkbox is checked
  3. Enable the text input and type 'Test'
    - expect: Text input enabled with 'Test' content
  4. Refresh the page
    - expect: Page reloads to initial state
    - expect: Checkbox is present and unchecked
    - expect: Text input is disabled and empty
    - expect: No state is preserved from before refresh

#### 6.6. TC-DYNCTRL-025-VerifyNoJavaScriptErrors

**File:** `tests/dynamic-controls/boundary-cases.spec.ts`

**Steps:**
  1. Navigate to the Dynamic Controls page
    - expect: Page loads
  2. Open browser console and monitor for errors
    - expect: No JavaScript errors in console on initial load
  3. Perform all widget operations: remove/add checkbox, enable/disable input, check checkbox
    - expect: No JavaScript errors occur during any operation
    - expect: All operations complete successfully

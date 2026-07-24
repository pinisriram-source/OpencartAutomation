# Hovers Test Plan

## Application Overview

The Hovers feature demonstrates hover-based interactivity on a web page. The page displays three user avatar images arranged horizontally. Each avatar has an associated caption overlay that contains the user's name (formatted as "name: user1", "name: user2", or "name: user3") and a "View profile" link. These caption overlays are hidden by default and only become visible when the user hovers their mouse cursor over the corresponding avatar image. When the mouse moves away from an image (either by hovering over a different image or moving off all images entirely), the caption overlay for that image automatically hides again. Clicking the "View profile" link while hovering navigates to the user's profile page at the URL pattern /users/[1-3]. The page should never navigate or reload from hovering alone—only from an explicit click on a profile link.

## Test Scenarios

### 1. Initial Page State

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-HOVERS-001: Verify page load shows three avatar images with no visible captions

**File:** `tests/hovers/initial-page-state.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
    - expect: URL is https://the-internet.herokuapp.com/hovers
  2. Inspect the page content
    - expect: Exactly 3 avatar images are present on the page
    - expect: No caption overlay is visible for any avatar
    - expect: No 'View profile' link is visible for any avatar
    - expect: Page heading 'Hovers' is displayed
    - expect: Instruction text 'Hover over the image for additional information' is displayed

#### 1.2. TC-HOVERS-002: Verify all three avatar images are rendered correctly

**File:** `tests/hovers/initial-page-state.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Locate all avatar images on the page
    - expect: First avatar image is visible
    - expect: Second avatar image is visible
    - expect: Third avatar image is visible
    - expect: All three images have alt text 'User Avatar'

### 2. Single Image Hover - First Avatar

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-HOVERS-003: Hovering over first avatar reveals user1 caption and link

**File:** `tests/hovers/first-avatar-hover.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover mouse cursor over the first avatar image
    - expect: Caption overlay becomes visible for the first avatar
    - expect: Caption displays 'name: user1'
    - expect: 'View profile' link becomes visible
    - expect: 'View profile' link href points to /users/1
    - expect: Second avatar caption remains hidden
    - expect: Third avatar caption remains hidden

#### 2.2. TC-HOVERS-004: Moving mouse away from first avatar hides its caption

**File:** `tests/hovers/first-avatar-hover.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover mouse cursor over the first avatar image
    - expect: Caption for user1 becomes visible
  3. Move mouse cursor away from the first avatar (hover over page heading)
    - expect: Caption overlay for user1 is no longer visible
    - expect: 'View profile' link for user1 is no longer visible
    - expect: All avatar captions are hidden

### 3. Single Image Hover - Second Avatar

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-HOVERS-005: Hovering over second avatar reveals user2 caption and link

**File:** `tests/hovers/second-avatar-hover.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover mouse cursor over the second avatar image
    - expect: Caption overlay becomes visible for the second avatar
    - expect: Caption displays 'name: user2'
    - expect: 'View profile' link becomes visible
    - expect: 'View profile' link href points to /users/2
    - expect: First avatar caption remains hidden
    - expect: Third avatar caption remains hidden

#### 3.2. TC-HOVERS-006: Moving mouse away from second avatar hides its caption

**File:** `tests/hovers/second-avatar-hover.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover mouse cursor over the second avatar image
    - expect: Caption for user2 becomes visible
  3. Move mouse cursor away from the second avatar (hover over page heading)
    - expect: Caption overlay for user2 is no longer visible
    - expect: 'View profile' link for user2 is no longer visible
    - expect: All avatar captions are hidden

### 4. Single Image Hover - Third Avatar

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-HOVERS-007: Hovering over third avatar reveals user3 caption and link

**File:** `tests/hovers/third-avatar-hover.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover mouse cursor over the third avatar image
    - expect: Caption overlay becomes visible for the third avatar
    - expect: Caption displays 'name: user3'
    - expect: 'View profile' link becomes visible
    - expect: 'View profile' link href points to /users/3
    - expect: First avatar caption remains hidden
    - expect: Second avatar caption remains hidden

#### 4.2. TC-HOVERS-008: Moving mouse away from third avatar hides its caption

**File:** `tests/hovers/third-avatar-hover.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover mouse cursor over the third avatar image
    - expect: Caption for user3 becomes visible
  3. Move mouse cursor away from the third avatar (hover over page heading)
    - expect: Caption overlay for user3 is no longer visible
    - expect: 'View profile' link for user3 is no longer visible
    - expect: All avatar captions are hidden

### 5. Sequential Hover Behavior

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-HOVERS-009: Hovering from first to second avatar hides first caption and shows second

**File:** `tests/hovers/sequential-hover-behavior.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover mouse cursor over the first avatar image
    - expect: Caption for user1 becomes visible
    - expect: Captions for user2 and user3 remain hidden
  3. Move mouse cursor to hover over the second avatar image
    - expect: Caption for user1 is now hidden
    - expect: Caption for user2 becomes visible
    - expect: Caption for user3 remains hidden
    - expect: Only one caption is visible at a time

#### 5.2. TC-HOVERS-010: Hovering from second to third avatar hides second caption and shows third

**File:** `tests/hovers/sequential-hover-behavior.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover mouse cursor over the second avatar image
    - expect: Caption for user2 becomes visible
    - expect: Captions for user1 and user3 remain hidden
  3. Move mouse cursor to hover over the third avatar image
    - expect: Caption for user2 is now hidden
    - expect: Caption for user3 becomes visible
    - expect: Caption for user1 remains hidden
    - expect: Only one caption is visible at a time

#### 5.3. TC-HOVERS-011: Hovering from third to first avatar hides third caption and shows first

**File:** `tests/hovers/sequential-hover-behavior.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover mouse cursor over the third avatar image
    - expect: Caption for user3 becomes visible
    - expect: Captions for user1 and user2 remain hidden
  3. Move mouse cursor to hover over the first avatar image
    - expect: Caption for user3 is now hidden
    - expect: Caption for user1 becomes visible
    - expect: Caption for user2 remains hidden
    - expect: Only one caption is visible at a time

#### 5.4. TC-HOVERS-012: Hovering all three avatars in sequence shows only one caption at a time

**File:** `tests/hovers/sequential-hover-behavior.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
    - expect: No captions are visible
  2. Hover over first avatar
    - expect: Only user1 caption is visible
  3. Hover over second avatar
    - expect: Only user2 caption is visible
  4. Hover over third avatar
    - expect: Only user3 caption is visible
  5. Move mouse away from all avatars
    - expect: No captions are visible

### 6. Navigation via View Profile Links

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-HOVERS-013: Clicking View profile link for user1 navigates to /users/1

**File:** `tests/hovers/view-profile-navigation.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover mouse cursor over the first avatar image
    - expect: Caption for user1 becomes visible
    - expect: 'View profile' link is visible
  3. Click the 'View profile' link for user1
    - expect: Browser navigates to https://the-internet.herokuapp.com/users/1
    - expect: URL changes from /hovers to /users/1
    - expect: Navigation completes successfully

#### 6.2. TC-HOVERS-014: Clicking View profile link for user2 navigates to /users/2

**File:** `tests/hovers/view-profile-navigation.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover mouse cursor over the second avatar image
    - expect: Caption for user2 becomes visible
    - expect: 'View profile' link is visible
  3. Click the 'View profile' link for user2
    - expect: Browser navigates to https://the-internet.herokuapp.com/users/2
    - expect: URL changes from /hovers to /users/2
    - expect: Navigation completes successfully

#### 6.3. TC-HOVERS-015: Clicking View profile link for user3 navigates to /users/3

**File:** `tests/hovers/view-profile-navigation.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover mouse cursor over the third avatar image
    - expect: Caption for user3 becomes visible
    - expect: 'View profile' link is visible
  3. Click the 'View profile' link for user3
    - expect: Browser navigates to https://the-internet.herokuapp.com/users/3
    - expect: URL changes from /hovers to /users/3
    - expect: Navigation completes successfully

### 7. Negative and Boundary Tests

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-HOVERS-016: Hovering over page does not trigger navigation

**File:** `tests/hovers/negative-boundary-tests.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
    - expect: URL is https://the-internet.herokuapp.com/hovers
  2. Hover over the first avatar image
    - expect: Caption becomes visible
  3. Wait 2 seconds while hovering
    - expect: Page does not navigate
    - expect: URL remains https://the-internet.herokuapp.com/hovers
    - expect: No page reload occurs
  4. Hover over the second avatar image
    - expect: Page does not navigate
    - expect: URL remains https://the-internet.herokuapp.com/hovers
  5. Hover over the third avatar image
    - expect: Page does not navigate
    - expect: URL remains https://the-internet.herokuapp.com/hovers

#### 7.2. TC-HOVERS-017: Caption remains hidden when hovering outside avatar area

**File:** `tests/hovers/negative-boundary-tests.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover over the page heading 'Hovers'
    - expect: No caption overlays are visible
  3. Hover over the instruction text
    - expect: No caption overlays are visible
  4. Hover over the area between the first and second avatar
    - expect: No caption overlays are visible
  5. Hover over the footer area
    - expect: No caption overlays are visible

#### 7.3. TC-HOVERS-018: Rapid hover changes show correct caption without delay

**File:** `tests/hovers/negative-boundary-tests.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Rapidly hover over first avatar then second avatar then third avatar in quick succession
    - expect: Each caption appears correctly when its avatar is hovered
    - expect: Previous caption hides when moving to next avatar
    - expect: No captions overlap or display incorrectly
    - expect: Final hover on third avatar shows user3 caption

#### 7.4. TC-HOVERS-019: Caption hides correctly when mouse leaves page viewport while hovering

**File:** `tests/hovers/negative-boundary-tests.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover over the first avatar image
    - expect: Caption for user1 becomes visible
  3. Move mouse cursor outside the browser viewport
    - expect: Caption for user1 hides
    - expect: No captions remain visible

#### 7.5. TC-HOVERS-020: View profile link is not clickable when caption is hidden

**File:** `tests/hovers/negative-boundary-tests.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
    - expect: No captions are visible
  2. Attempt to locate the 'View profile' link for user1 in the DOM
    - expect: Link element exists in DOM but is not visible
    - expect: Link is not interactable in its hidden state
  3. Verify attempting to click the hidden link area has no effect
    - expect: Page does not navigate
    - expect: No error occurs

### 8. Caption Content Verification

**Seed:** `tests/seed.spec.ts`

#### 8.1. TC-HOVERS-021: First avatar caption displays correct user name format

**File:** `tests/hovers/caption-content-verification.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover over the first avatar image
    - expect: Caption is visible
  3. Verify the caption text content
    - expect: Caption text exactly matches 'name: user1'
    - expect: Text format uses lowercase for 'name:' and 'user1'
    - expect: Heading level is h5
    - expect: 'View profile' link text is exactly 'View profile'

#### 8.2. TC-HOVERS-022: Second avatar caption displays correct user name format

**File:** `tests/hovers/caption-content-verification.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover over the second avatar image
    - expect: Caption is visible
  3. Verify the caption text content
    - expect: Caption text exactly matches 'name: user2'
    - expect: Text format uses lowercase for 'name:' and 'user2'
    - expect: Heading level is h5
    - expect: 'View profile' link text is exactly 'View profile'

#### 8.3. TC-HOVERS-023: Third avatar caption displays correct user name format

**File:** `tests/hovers/caption-content-verification.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover over the third avatar image
    - expect: Caption is visible
  3. Verify the caption text content
    - expect: Caption text exactly matches 'name: user3'
    - expect: Text format uses lowercase for 'name:' and 'user3'
    - expect: Heading level is h5
    - expect: 'View profile' link text is exactly 'View profile'

#### 8.4. TC-HOVERS-024: All View profile links have correct href attributes

**File:** `tests/hovers/caption-content-verification.spec.ts`

**Steps:**
  1. Navigate to the Hovers page
    - expect: Page loads successfully
  2. Hover over first avatar and verify link href
    - expect: 'View profile' link href is '/users/1'
  3. Hover over second avatar and verify link href
    - expect: 'View profile' link href is '/users/2'
  4. Hover over third avatar and verify link href
    - expect: 'View profile' link href is '/users/3'

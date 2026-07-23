// spec: Add/Remove Elements Negative and Validation Tests
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { AddRemoveElementsPage } from './page-objects/add-remove-elements.page';

test.describe('Add/Remove Elements Negative and Validation Tests', () => {
  test('TC-ADDREMOVE-023: Verify Button Rendering and CSS', async ({ page }) => {
    const addRemovePage = new AddRemoveElementsPage(page);

    // 1. Navigate to the application URL and add 3 Delete buttons
    await addRemovePage.navigate();
    await addRemovePage.addElements(3);

    // expect: 3 Delete buttons are present
    const deleteButtonCount = await addRemovePage.getDeleteButtonCount();
    expect(deleteButtonCount).toBeGreaterThanOrEqual(3);

    // 2. Verify each Delete button has correct visual properties
    const deleteButtons = addRemovePage.deleteButtons;

    // expect: Each button displays the text 'Delete'
    const first3Buttons = await deleteButtons.all();
    for (let i = 0; i < Math.min(3, first3Buttons.length); i++) {
      await expect(first3Buttons[i]).toHaveText('Delete');
    }

    // expect: Each button is styled consistently (same class 'added-manually')
    for (let i = 0; i < Math.min(3, first3Buttons.length); i++) {
      await expect(first3Buttons[i]).toHaveClass('added-manually');
    }

    // expect: Each button has a visible clickable area (bounding box width > 0, height > 0)
    for (let i = 0; i < Math.min(3, first3Buttons.length); i++) {
      const boundingBox = await first3Buttons[i].boundingBox();
      expect(boundingBox).not.toBeNull();
      expect(boundingBox!.width).toBeGreaterThan(0);
      expect(boundingBox!.height).toBeGreaterThan(0);
    }

    // expect: Buttons are vertically or horizontally aligned in a consistent layout
    const boundingBoxes = await Promise.all(
      first3Buttons.slice(0, 3).map(btn => btn.boundingBox())
    );

    // Check if buttons are horizontally aligned (same y position)
    const yPositions = boundingBoxes.map(box => box?.y).filter(y => y !== undefined);
    const horizontallyAligned = yPositions.every(y => Math.abs(y! - yPositions[0]!) < 1);

    // Check if buttons are vertically aligned (same x position) if not horizontal
    const xPositions = boundingBoxes.map(box => box?.x).filter(x => x !== undefined);
    const verticallyAligned = xPositions.every(x => Math.abs(x! - xPositions[0]!) < 1);

    expect(horizontallyAligned || verticallyAligned).toBe(true);

    // 3. Verify 'Add Element' button styling
    const addButton = addRemovePage.addElementButton;

    // expect: The 'Add Element' button is visually distinct or similarly styled
    const addButtonBox = await addButton.boundingBox();
    expect(addButtonBox).not.toBeNull();
    expect(addButtonBox!.width).toBeGreaterThan(0);
    expect(addButtonBox!.height).toBeGreaterThan(0);

    // expect: The button is clearly labeled and accessible (has text content)
    await expect(addButton).toHaveText('Add Element');
    await expect(addButton).toBeVisible();
  });
});

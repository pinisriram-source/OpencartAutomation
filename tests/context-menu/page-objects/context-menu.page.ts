import { Page, Locator } from '@playwright/test';

export class ContextMenuPage {
  readonly page: Page;
  readonly url = 'https://the-internet.herokuapp.com/context_menu';

  readonly pageHeading: Locator;
  readonly paragraphs: Locator;
  readonly hotSpot: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole('heading', { name: 'Context Menu' });
    this.paragraphs = page.locator('#content p');
    this.hotSpot = page.locator('#hot-spot');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  async rightClickHotSpot(): Promise<void> {
    await this.hotSpot.click({ button: 'right' });
  }

  async rightClickHotSpotEdge(position: 'top' | 'bottom' | 'left' | 'right'): Promise<void> {
    const box = await this.hotSpot.boundingBox();
    if (!box) throw new Error('Hot spot bounding box not found');

    let x: number;
    let y: number;

    switch (position) {
      case 'top':
        x = box.x + box.width / 2;
        y = box.y + 2;
        break;
      case 'bottom':
        x = box.x + box.width / 2;
        y = box.y + box.height - 2;
        break;
      case 'left':
        x = box.x + 2;
        y = box.y + box.height / 2;
        break;
      case 'right':
        x = box.x + box.width - 2;
        y = box.y + box.height / 2;
        break;
    }

    await this.page.mouse.click(x, y, { button: 'right' });
  }

  async leftClickHotSpot(): Promise<void> {
    await this.hotSpot.click();
  }

  async doubleClickHotSpot(): Promise<void> {
    await this.hotSpot.dblclick();
  }

  async rightClickOutside(): Promise<void> {
    await this.pageHeading.click({ button: 'right' });
  }
}

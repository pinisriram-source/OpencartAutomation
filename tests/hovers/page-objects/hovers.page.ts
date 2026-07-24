import { Page, Locator } from '@playwright/test';

export class HoversPage {
  readonly page: Page;
  readonly url = 'https://the-internet.herokuapp.com/hovers';

  readonly pageHeading: Locator;
  readonly instructionText: Locator;
  readonly avatarFigures: Locator;
  readonly avatarImages: Locator;
  readonly captionOverlays: Locator;
  readonly viewProfileLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole('heading', { name: 'Hovers' });
    this.instructionText = page.locator('.example p');
    this.avatarFigures = page.locator('.figure');
    this.avatarImages = page.locator('.figure img');
    this.captionOverlays = page.locator('.figcaption');
    this.viewProfileLinks = page.locator('.figcaption a');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  async hoverAvatar(index: number): Promise<void> {
    await this.avatarImages.nth(index).hover();
  }

  async hoverAway(): Promise<void> {
    await this.pageHeading.hover();
  }

  getCaptionOverlay(index: number): Locator {
    return this.captionOverlays.nth(index);
  }

  getCaptionHeading(index: number): Locator {
    return this.avatarFigures.nth(index).locator('h5');
  }

  getViewProfileLink(index: number): Locator {
    return this.viewProfileLinks.nth(index);
  }

  getAvatarImage(index: number): Locator {
    return this.avatarImages.nth(index);
  }
}

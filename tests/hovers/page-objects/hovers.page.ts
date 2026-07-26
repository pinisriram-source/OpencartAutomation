import { Locator } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class HoversPage extends BasePage {
  private readonly url = 'https://the-internet.herokuapp.com/hovers';

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Hovers' });
  }

  get instructionText(): Locator {
    return this.page.getByText('Hover over the image for additional information');
  }

  get avatarImages(): Locator {
    return this.page.getByRole('img', { name: 'User Avatar' });
  }

  // Each avatar renders as an otherwise-identical ".figure" block with no
  // distinguishing role/testid/text besides position, so this structural
  // container is the only way to scope to "the Nth avatar" -- getByRole
  // locates the actual interactive content inside it.
  private figure(index: number): Locator {
    return this.page.locator('.figure').nth(index);
  }

  async navigate(): Promise<void> {
    await this.open(this.url);
  }

  async hoverAvatar(index: number): Promise<void> {
    await this.avatarImages.nth(index).hover();
  }

  async hoverAway(): Promise<void> {
    await this.pageHeading.hover();
  }

  getAvatarImage(index: number): Locator {
    return this.avatarImages.nth(index);
  }

  // The caption wrapper itself carries no role, so this stays a scoped CSS
  // locator -- it's the only way to assert the *wrapper's* hidden/visible
  // state as distinct from the heading/link inside it.
  getCaptionOverlay(index: number): Locator {
    return this.figure(index).locator('.figcaption');
  }

  getCaptionHeading(index: number): Locator {
    return this.figure(index).getByRole('heading', { level: 5 });
  }

  // Scoped CSS, not getByRole: when the caption is hidden this anchor is
  // removed from the accessibility tree entirely, so a role-based locator
  // resolves to zero elements and can't back a toBeAttached()-while-hidden
  // assertion (see negative-boundary-tests.spec.ts TC-HOVERS-020) -- CSS is
  // the only strategy that still finds the (hidden) element in the DOM.
  getViewProfileLink(index: number): Locator {
    return this.figure(index).locator('.figcaption a');
  }
}

import { Locator } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class DynamicLoadingLandingPage extends BasePage {
  private readonly url = 'https://the-internet.herokuapp.com/dynamic_loading';

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Dynamically Loaded Page Elements' });
  }

  get explanatoryText(): Locator {
    return this.page.getByText('It\'s common');
  }

  get example1Link(): Locator {
    return this.page.getByRole('link', { name: 'Example 1: Element on page that is hidden' });
  }

  get example2Link(): Locator {
    return this.page.getByRole('link', { name: 'Example 2: Element rendered after the fact' });
  }

  async navigate(): Promise<void> {
    await this.open(this.url);
  }
}

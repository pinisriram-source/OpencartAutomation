import { Locator } from '@playwright/test';
import { BasePage } from '../../_shared/base-page';

export class DynamicLoadingExamplePage extends BasePage {
  private readonly url: string;

  constructor(page: ConstructorParameters<typeof BasePage>[0], exampleNumber: 1 | 2) {
    super(page);
    this.url = `https://the-internet.herokuapp.com/dynamic_loading/${exampleNumber}`;
  }

  get pageHeading(): Locator {
    return this.page.locator('#content h4').first();
  }

  get startButton(): Locator {
    return this.page.getByRole('button', { name: 'Start' });
  }

  get loadingText(): Locator {
    return this.page.getByText('Loading...');
  }

  get loadingSpinner(): Locator {
    return this.page.locator('#loading img');
  }

  // CSS locator: the #loading container needs to be asserted as hidden/visible
  // at the wrapper level — getByRole/getByText cannot represent a container's
  // visibility state distinct from its children.
  get loadingContainer(): Locator {
    return this.page.locator('#loading');
  }

  get helloWorldHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Hello World!' });
  }

  // CSS locator: the #finish element must be asserted when hidden
  // (display: none in Example 1) or absent from DOM (Example 2) — getByRole
  // excludes hidden elements from the accessibility tree, so it can't back
  // toBeAttached()/toBeHidden() assertions.
  get finishContainer(): Locator {
    return this.page.locator('#finish');
  }

  async navigate(): Promise<void> {
    await this.open(this.url);
  }

  async clickStart(): Promise<void> {
    await this.startButton.click();
  }

  async waitForHelloWorld(): Promise<void> {
    await this.helloWorldHeading.waitFor({ state: 'visible', timeout: 15000 });
  }
}

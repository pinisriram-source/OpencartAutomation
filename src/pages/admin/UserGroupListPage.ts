import { AdminBasePage } from './AdminBasePage';

export class UserGroupListPage extends AdminBasePage {
  async open(): Promise<void> {
    await this.gotoAdminRoute('user/user_group');
  }

  async addNew(): Promise<void> {
    await this.page.locator('a[data-original-title="Add New"]').click();
  }
}

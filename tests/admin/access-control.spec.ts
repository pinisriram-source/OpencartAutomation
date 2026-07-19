import { test } from '../../src/fixtures/pages.fixture';

// See docs/test-cases/admin/TC-ADMIN-MARKETING.md (TC-ADMIN-ACL-006) and
// CLAUDE.md Workflow 10. UserGroupListPage (src/pages/admin/) is scaffolded
// but unverified — needs a restricted User Group + a second admin user
// fixture to log in as, then assert on AdminBasePage.permissionDenied.

test.fixme('TC-ADMIN-ACL-006 a restricted User Group cannot access a disallowed admin menu', async () => {});

# Test Cases — Admin Customers

Module: Admin / Customers (Customer CRUD, Groups, Approvals)

---

```
Test Case ID:      TC-ADMIN-CUST-001
Title:              Admin can view a customer created via storefront registration
Module:             Admin / Customers
Priority:           High
Type:               Functional
Preconditions:      A customer registered via the storefront in this run
Test Data:          Uniquely generated customer email
Steps:              1. Navigate to Customers → Customers.
                     2. Filter/search by the generated email.
Expected Result:    Customer row appears with matching name, email, and
                     "Enabled" status.
Postconditions:     None
Traceability:       Workflow 2 (Registration → checkout)
```

```
Test Case ID:      TC-ADMIN-CUST-002
Title:              Admin can create a new customer directly
Module:             Admin / Customers
Priority:           Medium
Type:               Functional
Preconditions:      Logged in as admin
Test Data:          Unique name/email, Customer Group: Default, password
Steps:              1. Navigate to Customers → Customers → Add New.
                     2. Fill required fields; save.
Expected Result:    Success alert; new customer appears in the list and
                     can log in on the storefront with the set credentials.
Postconditions:     Delete the test customer.
Traceability:       CLAUDE.md Admin Test Scenarios — Customer Management
```

```
Test Case ID:      TC-ADMIN-CUST-003
Title:              Disabling a customer account prevents storefront login
Module:             Admin / Customers
Priority:           High
Type:               Negative
Preconditions:      Test customer exists and is Enabled
Test Data:          Test customer's credentials
Steps:              1. Edit the test customer; set Status to Disabled;
                        save.
                     2. Attempt to log in on the storefront with that
                        customer's credentials.
Expected Result:    Storefront login fails / account is inactive.
Postconditions:     Re-enable or delete the test customer.
Traceability:       CLAUDE.md Admin Test Scenarios — Customer Management
```

```
Test Case ID:      TC-ADMIN-CUST-004
Title:              Admin can assign a customer to a different Customer Group
Module:             Admin / Customers
Priority:           Low
Type:               Functional
Preconditions:      A non-default Customer Group exists
Test Data:          Test customer, target group
Steps:              1. Edit the test customer.
                     2. Change Customer Group.
                     3. Save.
Expected Result:    Change persists; reflected on next edit-page load.
Postconditions:     Revert group.
Traceability:       CLAUDE.md Admin Test Scenarios — Customer Management
```

```
Test Case ID:      TC-ADMIN-CUST-005
Title:              Admin can delete a customer
Module:             Admin / Customers
Priority:           Low
Type:               Functional
Preconditions:      Test customer exists, no orders tied to it
Test Data:          Test customer
Steps:              1. Select the test customer's checkbox in the list.
                     2. Click Delete; confirm.
Expected Result:    Customer removed from the list.
Postconditions:     None
Traceability:       CLAUDE.md Admin Test Scenarios — Customer Management
```

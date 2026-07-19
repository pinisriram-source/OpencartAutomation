# Test Cases — Admin Sales / Orders / Returns

Module: Admin / Sales (Orders, Returns, Order Status)

---

```
Test Case ID:      TC-ADMIN-ORD-001
Title:              A storefront-placed order appears correctly in the admin order list
Module:             Admin / Sales / Orders
Priority:           Critical
Type:               Smoke
Preconditions:      An order was just placed on the storefront (guest or
                     registered checkout)
Test Data:          Order placed by a uniquely-named/emailed customer
Steps:              1. Log in to Admin.
                     2. Navigate to Sales → Orders.
                     3. Locate the order by the unique customer
                        name/email.
Expected Result:    Order row shows matching customer name, total, and an
                     initial status (e.g., "Pending").
Postconditions:     None
Traceability:       Workflow 1 (Guest checkout), Workflow 6 (Order lifecycle)
```

```
Test Case ID:      TC-ADMIN-ORD-002
Title:              Updating order status transitions the order and logs history
Module:             Admin / Sales / Orders
Priority:           Critical
Type:               Functional
Preconditions:      An order exists in "Pending" status
Test Data:          New status: "Processing"
Steps:              1. Open the order's detail/info page.
                     2. In the History section, select "Processing" as the
                        new order status.
                     3. Add an optional comment; click "Add History".
Expected Result:    Order status updates to "Processing"; a new row appears
                     in the order's history log with the comment and
                     timestamp.
Postconditions:     None
Traceability:       Workflow 6 (Admin order lifecycle)
```

```
Test Case ID:      TC-ADMIN-ORD-003
Title:              Order status change is visible to the customer in their Order History
Module:             Admin / Sales / Orders ↔ Storefront / Account
Priority:           High
Type:               Functional
Preconditions:      Order belongs to a registered (logged-in) customer;
                     status changed in TC-ADMIN-ORD-002
Test Data:          Same order as TC-ADMIN-ORD-002
Steps:              1. Log in to the storefront as the customer who placed
                        the order.
                     2. Navigate to Account → Order History → view the
                        order.
Expected Result:    Order detail page shows the updated status
                     ("Processing") and the full status history.
Postconditions:     None
Traceability:       Workflow 6 (Admin order lifecycle)
```

```
Test Case ID:      TC-ADMIN-ORD-004
Title:              Order product line shows selected options exactly as chosen by the customer
Module:             Admin / Sales / Orders
Priority:           High
Type:               Functional
Preconditions:      Order was placed for a product with options (e.g.,
                     Apple Cinema 30")
Test Data:          Same options chosen during checkout
Steps:              1. Open the order detail page for the relevant order.
Expected Result:    Product line item lists each chosen option (radio/
                     checkbox/select/text) with the same values entered at
                     checkout, and the line total includes option price
                     deltas.
Postconditions:     None
Traceability:       Workflow 3 (Product options → cart pricing → admin order detail)
```

```
Test Case ID:      TC-ADMIN-ORD-005
Title:              Order detail shows the applied coupon discount
Module:             Admin / Sales / Orders
Priority:           High
Type:               Functional
Preconditions:      Order placed with a coupon applied at checkout
Test Data:          Coupon used at checkout
Steps:              1. Open the order detail page.
Expected Result:    Order totals breakdown includes a "Coupon" line
                     matching the discount amount applied on the
                     storefront.
Postconditions:     None
Traceability:       Workflow 4 (Coupon/voucher checkout)
```

```
Test Case ID:      TC-ADMIN-ORD-006
Title:              Filtering the order list by status returns only matching orders
Module:             Admin / Sales / Orders
Priority:           Medium
Type:               Functional
Preconditions:      Orders exist in at least two different statuses
Test Data:          Filter: Order Status = "Processing"
Steps:              1. On the Orders list, set the Order Status filter to
                        "Processing".
                     2. Apply the filter.
Expected Result:    All rows returned have status "Processing"; orders in
                     other statuses are excluded.
Postconditions:     None
Traceability:       CLAUDE.md Admin Test Scenarios — Order Management
```

```
Test Case ID:      TC-ADMIN-RET-007
Title:              Return request submitted by a customer appears in Admin Returns
Module:             Admin / Sales / Returns
Priority:           Medium
Type:               Functional
Preconditions:      Customer submitted a return request (TC-ACCOUNT-012)
Test Data:          Same return request
Steps:              1. Navigate to Sales → Returns.
                     2. Locate the return by order ID/customer.
Expected Result:    Return appears with matching product, quantity, and
                     reason; default status "Awaiting Approval" (or
                     equivalent).
Postconditions:     None
Traceability:       Workflow 7 (Return request) — documented only, not
                     automated in this pass
```

```
Test Case ID:      TC-ADMIN-RET-008
Title:              Admin can update a return's status
Module:             Admin / Sales / Returns
Priority:           Low
Type:               Functional
Preconditions:      A return request exists
Test Data:          New return status: "Complete"
Steps:              1. Open the return's detail page.
                     2. Change its status to "Complete"; add a comment.
                     3. Save.
Expected Result:    Return status updates and a history entry is recorded.
Postconditions:     None
Traceability:       Workflow 7 (Return request) — documented only, not
                     automated in this pass
```

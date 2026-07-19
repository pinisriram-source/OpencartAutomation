# Test Cases — Customer Account

Module: Storefront / Account (Registration, Login, Profile, Address Book,
Order History, Newsletter)

---

```
Test Case ID:      TC-REGISTER-001
Title:              New customer can register with valid details
Module:             Storefront / Account / Registration
Priority:           Critical
Type:               Smoke
Preconditions:      Email address not already registered
Test Data:          Unique generated email; valid firstname/lastname/
                     telephone/password; agree to Privacy Policy checked
Steps:              1. Navigate to Register.
                     2. Fill all required fields.
                     3. Check the Privacy Policy agreement checkbox.
                     4. Click Continue.
Expected Result:    Account created; success page shown; customer is
                     logged in.
Postconditions:     None
Traceability:       Workflow 2 (Registration → checkout)
```

```
Test Case ID:      TC-REGISTER-002-DuplicateEmail
Title:              Registration rejects an email already in use
Module:             Storefront / Account / Registration
Priority:           High
Type:               Negative
Preconditions:      A customer account already exists with the given email
Test Data:          Existing account's email
Steps:              1. Navigate to Register.
                     2. Fill the form using an already-registered email.
                     3. Submit.
Expected Result:    Validation error: "E-Mail Address is already registered!";
                     account is not created.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Account Management
```

```
Test Case ID:      TC-REGISTER-003-PasswordMismatch
Title:              Registration rejects mismatched password/confirm fields
Module:             Storefront / Account / Registration
Priority:           Medium
Type:               Negative
Preconditions:      None
Test Data:          Password: "Passw0rd!", Confirm: "Different1!"
Steps:              1. Fill the registration form with mismatched password
                        and confirm-password values.
                     2. Submit.
Expected Result:    Validation error indicating passwords do not match;
                     account not created.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Account Management
```

```
Test Case ID:      TC-REGISTER-004-AgreeRequired
Title:              Registration is blocked without agreeing to the Privacy Policy
Module:             Storefront / Account / Registration
Priority:           Medium
Type:               Negative
Preconditions:      None
Test Data:          Valid form data, agreement checkbox left unchecked
Steps:              1. Fill all fields correctly.
                     2. Leave the agreement checkbox unchecked.
                     3. Submit.
Expected Result:    Warning requiring agreement to the Privacy Policy;
                     account not created.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Account Management
```

```
Test Case ID:      TC-LOGIN-005
Title:              Registered customer can log in with valid credentials
Module:             Storefront / Account / Login
Priority:           Critical
Type:               Smoke
Preconditions:      Account exists
Test Data:          Valid email + password
Steps:              1. Navigate to Login.
                     2. Enter valid credentials.
                     3. Submit.
Expected Result:    Redirected to the Account dashboard; header shows
                     account is authenticated (e.g., "Logout" available).
Postconditions:     Log out.
Traceability:       Workflow 2 (Registration → checkout)
```

```
Test Case ID:      TC-LOGIN-006-InvalidCredentials
Title:              Login rejects incorrect password
Module:             Storefront / Account / Login
Priority:           High
Type:               Negative
Preconditions:      Account exists
Test Data:          Valid email, wrong password
Steps:              1. Navigate to Login.
                     2. Enter the correct email with an incorrect password.
                     3. Submit.
Expected Result:    Error message ("No match for E-Mail Address and/or
                     Password."); user remains logged out.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Account Management
```

```
Test Case ID:      TC-ACCOUNT-007
Title:              Customer can edit their profile details
Module:             Storefront / Account / Edit
Priority:           Medium
Type:               Functional
Preconditions:      Logged in
Test Data:          Updated last name
Steps:              1. Navigate to Account → Edit Account.
                     2. Change the Last Name field.
                     3. Save.
Expected Result:    Success message shown; reloading the edit page shows
                     the updated last name.
Postconditions:     Revert last name if needed.
Traceability:       Workflow 9 (Account maintenance)
```

```
Test Case ID:      TC-ACCOUNT-008
Title:              Customer can change their password
Module:             Storefront / Account / Password
Priority:           Medium
Type:               Functional
Preconditions:      Logged in
Test Data:          New password meeting minimum length
Steps:              1. Navigate to Account → Password.
                     2. Enter and confirm a new password.
                     3. Save.
                     4. Log out and log back in with the new password.
Expected Result:    Password change succeeds; login with the new password
                     succeeds.
Postconditions:     None
Traceability:       Workflow 9 (Account maintenance)
```

```
Test Case ID:      TC-ACCOUNT-009
Title:              Customer can add a new address book entry and set it as default
Module:             Storefront / Account / Address Book
Priority:           High
Type:               Functional
Preconditions:      Logged in
Test Data:          Valid new address
Steps:              1. Navigate to Account → Address Book.
                     2. Click "New Address"; fill required fields; save.
                     3. Mark the new address as default.
Expected Result:    Address appears in the address list; is flagged as
                     default; persists after logout/login.
Postconditions:     Delete the test address.
Traceability:       Workflow 9 (Account maintenance)
```

```
Test Case ID:      TC-ACCOUNT-010
Title:              Customer can delete a non-default address book entry
Module:             Storefront / Account / Address Book
Priority:           Low
Type:               Functional
Preconditions:      2+ addresses exist, one non-default
Test Data:          Non-default address
Steps:              1. Navigate to Address Book.
                     2. Click Delete on the non-default entry; confirm.
Expected Result:    Entry no longer appears in the address list.
Postconditions:     None
Traceability:       Workflow 9 (Account maintenance)
```

```
Test Case ID:      TC-ACCOUNT-011
Title:              Newsletter subscription toggle persists across sessions
Module:             Storefront / Account / Newsletter
Priority:           Low
Type:               Functional
Preconditions:      Logged in
Test Data:          Toggle: Yes
Steps:              1. Navigate to Account → Newsletter.
                     2. Set subscription to "Yes"; save.
                     3. Log out, log back in, and revisit the Newsletter
                        page.
Expected Result:    Subscription still shows "Yes" after re-login.
Postconditions:     Reset to prior state if needed.
Traceability:       Workflow 9 (Account maintenance)
```

```
Test Case ID:      TC-ACCOUNT-012
Title:              Return request submission is accepted with required fields
Module:             Storefront / Account / Returns
Priority:           Medium
Type:               Functional
Preconditions:      Customer has a prior order eligible for return
Test Data:          Order ID, product, quantity 1, reason: "Damaged"
Steps:              1. Navigate to Account → Returns → New Return (or
                        footer "Returns" link).
                     2. Fill in order/product/reason details.
                     3. Submit.
Expected Result:    Confirmation page shown; return request appears in
                     Admin → Sales → Returns.
Postconditions:     None
Traceability:       Workflow 7 (Return request) — documented only, not
                     automated in this pass
```

```
Test Case ID:      TC-ACCOUNT-013
Title:              Wishlist requires authentication for a guest
Module:             Storefront / Account / Wishlist
Priority:           Medium
Type:               Negative
Preconditions:      Not logged in
Test Data:          N/A
Steps:              1. As a guest, navigate directly to Account → Wish List.
Expected Result:    Redirected to the Login page rather than shown the
                     wishlist.
Postconditions:     None
Traceability:       Workflow 8 (Wishlist/Compare → cart)
```

```
Test Case ID:      TC-LOGIN-014-EmptyCredentials
Title:              Login submitted with both fields empty is rejected
Module:             Storefront / Account / Login
Priority:           Medium
Type:               Negative
Preconditions:      None
Test Data:          Email: "", Password: ""
Steps:              1. Navigate to Login.
                     2. Leave E-Mail Address and Password blank.
                     3. Submit.
Expected Result:    Same error as invalid credentials: "Warning: No match
                     for E-Mail Address and/or Password." (fields are
                     type="text"/"password" with no client-side "required"
                     validation, so the request reaches the server); user
                     remains on the Login page, logged out.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Account Management
```

```
Test Case ID:      TC-LOGIN-015-Logout
Title:              Logout ends the customer session
Module:             Storefront / Account / Logout
Priority:           High
Type:               Functional
Preconditions:      Logged in
Test Data:          N/A
Steps:              1. While logged in, navigate to Account → Logout.
                     2. Attempt to navigate directly to Account → My
                        Account.
Expected Result:    Logout page shows "Account Logout" confirmation;
                     subsequent direct navigation to a protected account
                     page (e.g. account/account) redirects to Login instead
                     of showing the page.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Account Management
```

```
Test Case ID:      TC-FORGOT-016
Title:              Forgotten Password accepts a registered email
Module:             Storefront / Account / Forgotten Password
Priority:           High
Type:               Functional
Preconditions:      Account exists; not logged in
Test Data:          Registered account's email
Steps:              1. Navigate to Login → Forgotten Password.
                     2. Enter the registered email address.
                     3. Submit.
Expected Result:    Redirected to Login; success message: "An email with a
                     confirmation link has been sent your email address."
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Account Management
```

```
Test Case ID:      TC-FORGOT-017-UnregisteredEmail
Title:              Forgotten Password rejects an email with no matching account
Module:             Storefront / Account / Forgotten Password
Priority:           Medium
Type:               Negative
Preconditions:      Not logged in
Test Data:          An email address with no matching account (including
                     the empty string)
Steps:              1. Navigate to Login → Forgotten Password.
                     2. Enter an unregistered (or blank) email address.
                     3. Submit.
Expected Result:    Error message: "Warning: The E-Mail Address was not
                     found in our records, please try again!"; remains on
                     the Forgotten Password page.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Account Management
```

```
Test Case ID:      TC-FORGOT-018-RedirectsWhenAuthenticated
Title:              Forgotten Password page is inaccessible while logged in
Module:             Storefront / Account / Forgotten Password
Priority:           Low
Type:               Boundary
Preconditions:      Logged in
Test Data:          N/A
Steps:              1. While logged in, navigate directly to
                        account/forgotten.
Expected Result:    Redirected away to the My Account dashboard rather than
                     shown the Forgotten Password form.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Account Management
```

---
description: Application-specific knowledge for TutorialsNinja OpenCart
  demo used for QA analysis, test scenario generation, test case
  generation, and Playwright automation.
name: tutorialsninja-app-knowledge
---

# TutorialsNinja Application Knowledge

## Application Overview

-   Demo eCommerce application based on OpenCart.
-   Supports guest and registered customer shopping.
-   Reference application for end-to-end eCommerce QA.

## Primary Business Modules

-   Home
-   Authentication
-   Registration
-   My Account
-   Product Catalog
-   Categories
-   Product Details
-   Search
-   Shopping Cart
-   Wishlist
-   Product Comparison
-   Checkout
-   Orders
-   Downloads
-   Returns
-   Contact Us

## Customer Journey

Home → Browse → Search → Product Details → Add to Cart → Checkout →
Payment → Order Success

## User Roles

### Guest

-   Browse products
-   Search products
-   Compare products
-   Add to Cart

### Registered Customer

-   Guest capabilities
-   Wishlist
-   Checkout
-   Order History
-   Downloads
-   Returns
-   Address Book
-   Password Management

### Administrator

-   Product Management
-   Customer Management
-   Order Management

## Business Rule Guidelines

Always verify: - Email must be unique. - Mandatory fields cannot be
empty. - Out-of-stock products cannot be purchased. - Wishlist requires
login. - Customer can access only their own orders. - Cart totals update
immediately. - Order created only after successful payment. - Inventory
updates after successful purchase. - Coupon eligibility rules are
enforced.

## Validation Guidelines

Always validate: - Mandatory fields - Email format - Duplicate email -
Password policy - Invalid phone number - Empty form submission - Invalid
quantity - Invalid coupon - Invalid search keyword - SQL Injection -
Cross-Site Scripting (XSS)

## Boundary Value Guidelines

### Quantity

  Value               Expected Behaviour
  ------------------- --------------------
  -1                  Reject
  0                   Reject
  1                   Accept
  Maximum Stock       Accept
  Maximum Stock + 1   Reject

### Search

  Value                Expected Behaviour
  -------------------- ------------------------
  Empty                Default behavior
  1 Character          Accept
  Maximum Length       Accept
  Maximum + 1          Handle gracefully
  Special Characters   No application failure

### Registration Fields

Always verify: - Empty - Minimum length - Maximum length - Maximum + 1 -
Invalid characters - Unicode characters

## Concurrency Guidelines

Always verify: - Simultaneous Add-to-Cart - Duplicate checkout
submission - Inventory consistency - Multiple coupon requests -
Duplicate order prevention

## Security Validation

-   SQL Injection
-   XSS
-   CSRF
-   Session Management
-   Broken Access Control
-   Direct URL Access

## Performance Validation

-   Home page load
-   Search response
-   Product page load
-   Cart update
-   Checkout response
-   Large cart handling

## Common Test Data

Customers: - Valid user - Invalid user - Existing user - New user

Products: - In Stock - Out of Stock - Multiple Categories

Search: - Exact keyword - Partial keyword - Invalid keyword - Empty
keyword

## Automation Notes

Prefer Playwright for: - Login - Registration - Search - Product
Navigation - Cart - Checkout - Orders - My Account

Always verify: - URL - Page Title - Success Message - Validation
Message - Cart Count - Price Calculation - Order Confirmation

## Test Scenario Generation Rules

For every module generate: - Positive scenarios - Negative scenarios -
Boundary scenarios - Validation scenarios - Business rule scenarios -
Security scenarios - Concurrency scenarios - UI scenarios -
Accessibility scenarios - Automation candidates

## Test Case Output Format

TC-ID

Title

Module

Priority (High/Medium/Low)

Category

Preconditions

Test Steps

Test Data (Exact Values)

Expected Result

Automation (Yes/No/Partial)

## Expected Result Guidelines

Never write: - Should work correctly - Should display successfully -
Should complete successfully

Always specify: - Exact UI message - Exact validation message - Expected
navigation - Expected calculation - Expected order status - Expected
cart total

## Claude Instructions

-   Understand complete customer workflow.
-   Reuse generic eCommerce domain knowledge.
-   Focus on TutorialsNinja-specific behavior.
-   Recommend Playwright automation wherever appropriate.
-   Use the standard QA test case format.
-   Cover positive, negative, boundary, validation, security,
    concurrency and UI scenarios.

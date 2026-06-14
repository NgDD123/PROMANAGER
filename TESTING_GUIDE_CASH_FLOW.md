# Testing Guide - Professional Cash Flow System

## Pre-Test Setup

### 1. Configure Company Settings
```
Navigate to: http://localhost:3000/stock/company-settings

Add Bank Account:
  - Bank Name: "Primary Bank"
  - Account Number: "1001234567"
  - Currency: "USD"
  - Opening Investment: "10000"
  - Status: "Active"

Save Settings ✓
```

### 2. Verify Accounts Created
The system automatically creates these accounts from company settings:
```
1010 - Primary Bank Account (Asset)
     Opening Balance: $10,000

3100 - Investment Capital - Primary Bank (Equity)
     Opening Balance: $10,000
```

---

## Test Scenarios

### TEST 1: Check Bank Balance API
**Goal:** Verify balance calculation from journal entries

**Steps:**
```
1. Open browser console or API tool
2. Call: GET /api/stock/payments/check-balance?accountId=1010&amount=5000

Expected Response:
{
  "accountId": "1010",
  "availableBalance": 10000,
  "requestedAmount": 5000,
  "canPay": true,
  "message": "Sufficient balance available"
}
```

**Verification:**
- ✓ Returns current balance: $10,000 (opening investment)
- ✓ Payment of $5,000 is allowed
- ✓ canPay = true

---

### TEST 2: Purchase Creation (No Cash Impact)
**Goal:** Verify purchases create liabilities, NOT reduce bank balance

**Steps:**
```
1. Navigate to: http://localhost:3000/stock/purchases
2. Click "Add Purchase"
3. Fill form:
   - Supplier: Select or create "Acme Supplies"
   - Invoice Number: "SUP-001"
   - Items:
     * Product: Widget
     * Quantity: 100
     * Unit Price: $50
     * Tax: 10%
   - Total: $5,500

4. Click "Confirm & Create" ✓
```

**Check Bank Balance (Should NOT Change):**
```
GET /api/stock/payments/check-balance?accountId=1010&amount=1000

Expected Response:
{
  "availableBalance": 10000,  ← SAME as before!
  "canPay": true
}
```

**Verification:**
- ✓ Bank balance: $10,000 (UNCHANGED)
- ✓ Journal entry created with:
  - Debit: Inventory $5,000
  - Debit: VAT Input $500
  - Credit: Accounts Payable $5,500

---

### TEST 3: Payment Confirmation Dialog
**Goal:** Verify payment dialog checks balance

**Steps:**
```
1. From purchases list, find SUP-001
2. Click "Pay" or "Make Payment"
3. Payment dialog opens:

   - Shows "Invoice: #SUP-001"
   - Shows "Supplier: Acme Supplies"
   - Shows "Total Amount: $5,500"
   
   - Automatically checks balance
   - Shows: "Bank Balance: $10,000" (Green)
   - "Confirm Payment" button: ENABLED
```

**Verification:**
- ✓ Balance checking spinner shows briefly
- ✓ Green alert with available balance
- ✓ Confirm button is enabled
- ✓ Can proceed with payment

---

### TEST 4: Process Payment (Bank Balance Reduces)
**Goal:** Verify payment reduces bank balance through journal entry

**Steps:**
```
1. In payment dialog:
   - Payment Method: Bank Transfer
   - Account: Primary Bank Account
   - Reference: "WIRE-001"
   - Date: Today
   - Confirm items: CHECK ✓

2. Click "Confirm Payment & Store"
3. Success message appears
```

**Check Bank Balance After Payment:**
```
GET /api/stock/payments/check-balance?accountId=1010&amount=1000

Expected Response:
{
  "availableBalance": 4500,  ← REDUCED by $5,500!
  "canPay": true
}
```

**Verification:**
- ✓ Bank balance: $4,500 (10,000 - 5,500)
- ✓ Journal entry created:
  - Debit: Accounts Payable $5,500
  - Credit: Bank Account $5,500
- ✓ Payment status: COMPLETED

---

### TEST 5: Insufficient Balance Prevention
**Goal:** Verify system prevents payment when balance insufficient

**Steps:**
```
1. Create another purchase:
   - Invoice: SUP-002
   - Total: $6,000

2. Click "Make Payment"
3. Payment dialog opens:
   - Checking balance...
   - Shows: "❌ Insufficient balance"
   - "Available: $4,500, Required: $6,000"
   - Red alert displayed
   - "Confirm Payment" button: DISABLED
```

**Verification:**
- ✓ Error message clearly states shortfall
- ✓ Cannot click confirm button
- ✓ Payment blocked at UI level
- ✓ Backend will also block if user bypasses UI

---

### TEST 6: Multiple Payments Scenario
**Goal:** Verify sequential payments correctly track balance

**Steps:**
```
Timeline of transactions:

09:00 - Opening Balance: $10,000

10:00 - Purchase #1: $2,000 (liability)
        Bank Balance check: $10,000 ✓

10:15 - Pay Purchase #1: $2,000 payment
        Bank after: $8,000 ✓

11:00 - Purchase #2: $3,000 (liability)
        Bank Balance check: $8,000 ✓

11:30 - Pay Purchase #2: $3,000 payment
        Bank after: $5,000 ✓

12:00 - Purchase #3: $6,000 (liability)
        Bank Balance check: $5,000 ✗
        → Cannot pay! (only $5,000 available)
```

**Verification:**
- ✓ Each payment reduces bank correctly
- ✓ Sequential deductions are cumulative
- ✓ Fourth payment blocked due to insufficient balance

---

### TEST 7: Cash Payment (Alternative Method)
**Goal:** Verify other payment methods also reduce balance

**Steps:**
```
1. Create purchase: $1,000
2. Open payment dialog
3. Select Payment Method: "Cash"
4. Fill reference: "CASH-001"
5. Confirm payment

Check Balance:
GET /api/stock/payments/check-balance?accountId=1010&amount=1000

Expected: Balance reduced by $1,000
```

**Verification:**
- ✓ Cash payments reduce bank balance
- ✓ Payment method doesn't affect accounting

---

### TEST 8: Check Journal Entries (Audit Trail)
**Goal:** Verify complete audit trail

**Steps:**
```
1. Navigate to: Accounting / Journal Entries
2. View all entries for date range

Expected to see:
  ✓ Opening Balance Entry (if exists)
  ✓ Purchase entries (Inventory/AP)
  ✓ Payment entries (AP/Bank)
```

**Sample Journal Audit Trail:**
```
Entry 1 - Purchase SUP-001 (Jan 15)
  Debit:  Inventory           $5,000
  Debit:  VAT Input           $  500
  Credit: Accounts Payable    $5,500
  Status: POSTED ✓

Entry 2 - Payment SUP-001 (Jan 20)
  Debit:  Accounts Payable    $5,500
  Credit: Primary Bank        $5,500
  Status: POSTED ✓
  
Verification: All entries balanced ✓
```

---

### TEST 9: Delete Payment (Reverse Transaction)
**Goal:** Verify deletion reverses journal entries and restores balance

**Steps:**
```
Bank Balance before deletion: $4,500

1. Find payment: WIRE-001
2. Click Delete/Remove
3. Confirm deletion

Check Balance After:
GET /api/stock/payments/check-balance?accountId=1010&amount=1000

Expected: $10,000 (balance restored)
```

**Verification:**
- ✓ Bank balance restored to original
- ✓ Journal entry removed from system
- ✓ Accounts Payable also restored

---

### TEST 10: Partial Payment
**Goal:** Test payment for portion of invoice

**Steps:**
```
Purchase: $5,500
Payment: $2,000 (partial)

After Payment:
- Bank balance: $8,000 (10,000 - 2,000)
- Accounts Payable: $3,500 (remaining)
- Payment status: PARTIAL
```

**Verification:**
- ✓ Partial payment recorded correctly
- ✓ Remaining balance still owed
- ✓ Bank only reduced by actual payment

---

## Validation Checklist

### Frontend Validation
- [ ] Balance check displays while loading
- [ ] Green alert shows with sufficient balance
- [ ] Red alert shows with insufficient balance
- [ ] Confirm button disabled on insufficient funds
- [ ] All payment methods (bank, cash, check) show in dropdown
- [ ] Reference number field accepts input
- [ ] Payment date selector works
- [ ] Notes field optional

### Backend Validation
- [ ] Balance calculation API returns correct amount
- [ ] Payment creation validates balance
- [ ] Rejects payment if insufficient funds
- [ ] Creates journal entry for each payment
- [ ] Journal entries are balanced (debit = credit)
- [ ] Deletion removes journal entries
- [ ] Accounts Payable updated correctly

### Data Integrity
- [ ] Bank account balance never goes negative
- [ ] All payments have journal entries
- [ ] Journal debit/credit always balanced
- [ ] Account IDs link correctly
- [ ] Dates recorded accurately
- [ ] Payment references unique

### Accounting Standards
- [ ] Purchases create liabilities (AP) only
- [ ] Payments reduce both AP and Bank
- [ ] Inventory increased at purchase
- [ ] Cash decreased at payment
- [ ] Double-entry bookkeeping followed

---

## Error Scenarios

### Error Test 1: Insufficient Balance
```
Setup: Bank balance $1,000
Attempt: Pay $2,000

Expected Error Response:
{
  "error": "Insufficient bank balance",
  "availableBalance": 1000,
  "requestedAmount": 2000
}

Status Code: 400 Bad Request ✓
```

### Error Test 2: Invalid Account ID
```
Request: GET /api/stock/payments/check-balance?accountId=INVALID&amount=100

Expected:
- Returns 0 balance
- canPay: false ✓
```

### Error Test 3: Missing Parameters
```
Request: GET /api/stock/payments/check-balance

Expected Error:
{
  "error": "Account ID and amount required"
}

Status Code: 400 ✓
```

---

## Performance Tests

### Load Test: Balance Calculation
```
Scenario: Calculate balance with 1000+ journal entries

Expected Results:
- Response time: < 1 second
- Memory usage: < 50MB
- Accurate calculation ✓
```

### Concurrent Payments
```
Scenario: 10 simultaneous payments from $10,000

Expected Results:
- Each payment processes
- Final balance: $0 or accurate
- No race conditions ✓
- All journal entries created ✓
```

---

## Reporting Tests

### Bank Statement Report
```
Expected columns:
- Date
- Description (reference)
- Debit (payments out)
- Credit (deposits/sales)
- Balance (running balance)

Verify:
- Running balance calculations correct
- Starts with opening balance
- Matches calculated balance
```

### Accounts Payable Report
```
Expected data:
- Supplier name
- Invoice number
- Original amount
- Paid amount
- Remaining balance
- Due date

Verify:
- Shows outstanding payables
- Matches liability account balance
```

---

## Sign-Off Checklist

Before marking system as production-ready:

- [ ] All 10 test scenarios pass
- [ ] No errors in browser console
- [ ] No errors in server logs
- [ ] Bank balance never goes negative
- [ ] Journal entries always balanced
- [ ] UI responsive and intuitive
- [ ] Error messages clear
- [ ] Reports generate correctly
- [ ] Performance acceptable
- [ ] Audit trail complete

---

## Quick Test Command Checklist

```bash
# 1. Check balance (should be 10000)
curl "http://localhost:3000/api/stock/payments/check-balance?accountId=1010&amount=5000"

# 2. Create payment (should reduce balance)
curl -X POST http://localhost:3000/api/stock/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "accountId": "1010",
    "supplierId": "supplier-123",
    "reference": "CHK-001",
    "date": "2024-01-20"
  }'

# 3. Check balance again (should be 5000)
curl "http://localhost:3000/api/stock/payments/check-balance?accountId=1010&amount=1000"
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Balance not updating | Clear cache, check journal entries created |
| Payment dialog stuck loading | Check network, verify API endpoint |
| Cannot pay sufficient funds | Verify account mapping correct |
| Journal entries unbalanced | Check line item calculations |
| Negative balance showing | Report as bug, should never occur |


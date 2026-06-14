# Quick Start Guide - Professional Payment System

## 5-Minute Setup

### Step 1: Configure Bank Account (2 min)
```
1. Go to: http://localhost:3000/stock/company-settings
2. Scroll to "Bank Accounts"
3. Click "Add Bank Account"
4. Fill in:
   - Bank Name: "Your Bank"
   - Account Number: "Your Account #"
   - Currency: USD
   - Opening Investment: Your starting balance
5. Click "Save"
```

### Step 2: Verify Setup (1 min)
```
1. System automatically creates:
   ✓ Bank Account (Asset)
   ✓ Investment Capital (Equity)
   
2. Check your bank balance:
   - Should equal Opening Investment
   - Ready to process payments
```

### Step 3: Make Your First Payment (2 min)
```
1. Go to: http://localhost:3000/stock/purchases
2. Create a purchase invoice
3. Click "Make Payment"
4. Dialog automatically checks balance
5. Click "Confirm Payment & Store"
6. Done! ✓
```

---

## Common Workflows

### Workflow 1: Buy Supplies (Create Liability)
```
👉 STEP 1: Add Purchase
   - Supplier: ABC Supplies
   - Invoice: INV-001
   - Items: 100 widgets @ $50 = $5,000
   - Total: $5,500 (with tax)

📊 What Happens:
   ✓ Inventory account: +$5,000
   ✓ Accounts Payable: +$5,500
   ✓ Bank Balance: UNCHANGED
   
💡 Why: You owe the money but haven't paid yet
```

### Workflow 2: Pay Supplier (Reduce Cash)
```
👉 STEP 1: Open Payment Dialog
   - System checks: Do you have $5,500?
   
👉 STEP 2: Choose Payment Method
   - Bank Transfer / Cash / Check
   - Select which bank account to pay from
   - Enter reference (check #, wire ref, etc.)

📊 What Happens:
   ✓ Accounts Payable: -$5,500 (liability settled)
   ✓ Bank Balance: -$5,500 (cash paid out)
   ✓ Payment recorded and verified
   
💡 Why: Actual money leaves your account
```

### Workflow 3: Check Available Cash
```
At any time, you can see:
✓ Total bank balance
✓ Pending payments owed
✓ Available cash to spend
```

---

## What Happens Behind the Scenes

### Purchase Example
```
You: "I'm buying $5,000 inventory on credit from Acme Co."

System:
  Creates Journal Entry:
    Debit:  Inventory            $5,000
    Credit: Accounts Payable     $5,000
  
  Records in:
    - Inventory account (up $5,000)
    - Accounts Payable (you owe $5,000)
    - Journal (audit trail)
    
  Bank Balance: NO CHANGE
  
  Why: You promised to pay later, not now
```

### Payment Example
```
You: "I'm paying Acme Co. $5,000 by bank transfer"

System:
  1. Checks: Do you have $5,000? ✓ YES
  2. Creates Journal Entry:
     Debit:  Accounts Payable    $5,000
     Credit: Bank Account        $5,000
  
  3. Records in:
     - Bank account (down $5,000)
     - Accounts Payable (down $5,000)
     - Payments ledger
     - Journal (audit trail)
     
  4. Updates Bank Balance: -$5,000
  
  Why: Money actually leaves your account NOW
```

---

## Key Numbers to Watch

### 1. Bank Balance
**What it is:** Actual cash you have available
**How to check:** Payment dialog shows automatically
**What it includes:**
  - Opening investment
  - Minus all payments made
  - Plus all sales received
  - Real-time calculation

### 2. Accounts Payable
**What it is:** Total money you OWE to suppliers
**How to check:** Go to Accounting → Accounts Payable Report
**Increases when:** You purchase on credit
**Decreases when:** You pay invoice

### 3. Inventory Balance
**What it is:** Value of stock you have
**How to check:** Stock/Inventory Report
**Increases when:** You purchase
**Decreases when:** You sell

---

## Decision: Can I Make This Payment?

### Quick Check
```
Do I have enough cash?

STEP 1: Open payment dialog
  → System shows your bank balance
  
STEP 2: Compare
  Your Balance >= Payment Amount?
  
  YES ✓ → Can pay (button enabled)
  NO ✗  → Cannot pay (button disabled)
```

### Example Scenarios
```
Scenario 1: You have $10,000
  Payment needed: $5,000
  Result: ✓ CAN PAY
  After payment: $5,000 remaining

Scenario 2: You have $10,000
  Payment needed: $15,000
  Result: ✗ CANNOT PAY
  System blocks payment
  After: Still have $10,000 (protected)

Scenario 3: You have $10,000
  Payment 1: $6,000 (OK)
  Payment 2: $5,000 (Now only have $4,000)
  Result: ✗ SECOND PAYMENT BLOCKED
```

---

## Troubleshooting

### Problem: Cannot make payment (button greyed out)
```
Reason: Not enough cash
Solution: 
  1. Check bank balance showing in dialog
  2. Deposit more funds
  3. Pay only part of invoice
  4. Delay payment until more cash available
```

### Problem: Balance not updating after payment
```
Reason: Might be browser cache
Solution:
  1. Refresh page (F5)
  2. Clear browser cache
  3. Reopen payment dialog
  4. Check balance endpoint directly
```

### Problem: Payment dialog shows balance as 0
```
Reason: Bank account might not be configured
Solution:
  1. Go to company settings
  2. Add a bank account with opening investment
  3. Save settings
  4. Try payment again
```

### Problem: Seeing "Insufficient bank balance" error
```
Reason: Exactly what it says - not enough cash
Solution:
  1. Check current balance in dialog
  2. Verify requested payment amount
  3. Either:
     - Get more funding
     - Pay partial amount
     - Defer payment
```

---

## Important Rules

### ❌ WHAT WILL FAIL
```
1. Paying more than available balance
   → System blocks → Error message

2. Paying before purchase recorded
   → No invoice to pay

3. Paying same invoice twice
   → System prevents duplicate

4. Negative bank balance
   → System never allows this
```

### ✅ WHAT WORKS
```
1. Credit purchases (no cash impact)
   → Creates liability (AP)

2. Paying with sufficient cash
   → Reduces bank balance

3. Partial payments
   → Updates both AP and cash

4. Multiple payments from one invoice
   → Tracked in system

5. Payments to different suppliers
   → Each tracked separately

6. Different payment methods
   → Bank, cash, check - all supported
```

---

## Real-World Example

### Company: Widget Factory
Opening Balance: $50,000

```
Day 1 - Monday AM
Action:   Purchase 1,000 widgets from Acme Supplies
Invoice:  INV-0001 for $25,000
Result:   
  - Bank: $50,000 (NO CHANGE)
  - Owe to Acme: $25,000

Day 2 - Tuesday AM
Action:   Receive customer order, collect $15,000
Result:   
  - Bank: $65,000 (added sales)
  - Can spend: $65,000

Day 2 - Tuesday PM
Action:   Pay Acme Supplies invoice (INV-0001)
Check:    "Have I got $25,000?" ✓ YES ($65,000)
Pay:      $25,000 by bank transfer
Result:   
  - Bank: $40,000
  - Owe to Acme: $0 (paid)

Day 3 - Wednesday
Action:   Try to buy more inventory for $30,000
Check:    "Have I got $30,000?" ✓ YES ($40,000)
Buy:      $30,000 from Acme (on credit again)
Result:   
  - Bank: $40,000 (NO CHANGE - credit purchase)
  - Owe to Acme: $30,000

Summary at end of Day 3:
  Opening Cash:          $50,000
  Plus: Sales collected  $15,000
  Minus: Payment made   ($25,000)
  Equals: Current cash   $40,000
  
  Purchases on credit:   $55,000 total
  Already paid:          $25,000
  Still owe:             $30,000
```

---

## Payment Methods Explained

### Bank Transfer
```
✓ Use when: Paying via wire, ACH, or online transfer
✓ Reference: Wire transfer #, transaction ID
✓ Time: Usually 1-3 business days to clear
✓ Best for: Large payments, suppliers outside area
```

### Cash
```
✓ Use when: Paying with physical cash
✓ Reference: Receipt number, date
✓ Time: Immediate
✓ Best for: Small purchases, local suppliers
```

### Check
```
✓ Use when: Paying by check
✓ Reference: Check number
✓ Time: 1-2 business days to clear
✓ Best for: Formal payments, documentation
```

### Mobile Money (if configured)
```
✓ Use when: Mobile payment available
✓ Reference: Transaction reference
✓ Time: Minutes to clear
✓ Best for: Quick payments, mobile payments
```

---

## Reports You Can Run

### 1. Bank Balance Report
```
Shows: Current cash position
By: Each bank account
Includes: Opening + Transactions = Current Balance
Use for: Know how much cash you have
```

### 2. Accounts Payable Report
```
Shows: Who you owe
By: Supplier, Invoice, Due date
Includes: Not yet paid + Partially paid
Use for: Know what's not paid yet
```

### 3. Payment History
```
Shows: All payments made
By: Date, Supplier, Amount
Includes: Payment method, reference
Use for: Audit trail, reconciliation
```

### 4. Cash Flow Report
```
Shows: Money in vs money out
By: Month or date range
Includes: Inflows, Outflows, Net
Use for: See overall cash trends
```

---

## Mobile Usage

### Payments on Phone
```
1. Open http://localhost:3000 on phone
2. Go to Purchases
3. Find invoice
4. Tap "Make Payment"
5. Dialog shows balance
6. Fill details
7. Tap "Confirm"
8. Done! ✓

Note: Works on any device with internet
```

---

## Best Practices

### DO ✅
```
✓ Check balance before making large purchases
✓ Record purchases immediately when received
✓ Pay invoices on time to maintain supplier relations
✓ Monitor accounts payable regularly
✓ Keep reference numbers for all payments
✓ Review bank balance reports weekly
```

### DON'T ❌
```
✗ Assume you have unlimited cash
✗ Delay recording purchases
✗ Forget payment terms
✗ Make duplicate payments
✗ Lose payment documentation
✗ Ignore warning messages
```

---

## Getting Help

### Find Information
```
- This Guide: Quick Start
- Full System Guide: PROFESSIONAL_CASH_FLOW_SYSTEM.md
- Technical Details: DATABASE_SCHEMA_CASH_FLOW.md
- Testing: TESTING_GUIDE_CASH_FLOW.md
- Implementation: IMPLEMENTATION_SUMMARY.md
```

### Test the System
```
1. Follow TESTING_GUIDE_CASH_FLOW.md
2. Run through test scenarios
3. Verify everything works
4. Gain confidence in system
```

### Common Questions

**Q: Do purchases reduce my bank balance?**
A: NO - Only payments reduce bank balance. Purchases on credit don't.

**Q: What if I don't have enough cash to pay?**
A: System blocks the payment. You must deposit more money first.

**Q: Can I partially pay an invoice?**
A: YES - Pay what you can, rest stays as liability until paid.

**Q: Where do I see what I owe?**
A: Check Accounts Payable Report or payment dialog details.

**Q: How do I verify a payment was recorded?**
A: Check Payment History and Journal Entries (audit trail).

**Q: Can I undo a payment?**
A: YES - Delete it to reverse the transaction and restore balance.

**Q: How is balance calculated?**
A: Real-time from all journal entries: Deposits - Payments = Balance

---

## Summary Checklist

Before using the system, ensure:
- [ ] Bank account configured in company settings
- [ ] Opening investment amount entered
- [ ] System shows correct starting balance
- [ ] Can create test purchase
- [ ] Can open payment dialog
- [ ] Dialog shows current balance
- [ ] Can make test payment
- [ ] Balance updates correctly after payment

Once you've checked all items above, you're ready to use the system! ✓

---

**Start using professional payment management now!**

Version 1.0 | Production Ready

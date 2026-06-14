# Professional Cash Flow & Bank Balance Management

## System Overview

This system implements professional accounting principles where **purchases create liabilities** (Accounts Payable) and **payments reduce bank balance** through proper journal entries.

## Accounting Flow

### 1. PURCHASE TRANSACTION
When a purchase is recorded:

```
Journal Entry:
  Debit:  Inventory / Stock Account         $1,000
  Debit:  VAT Input / Input Tax             $  200
  Credit: Accounts Payable (Supplier)       $1,200
```

**What happens:**
- ✅ Inventory increases (Balance Sheet: Asset)
- ✅ VAT Input recorded (Balance Sheet: Asset)
- ✅ Accounts Payable increases (Balance Sheet: Liability)
- ❌ **Bank balance NOT affected yet** (Liability recorded, cash not paid)

**Cash Impact:** NONE - This is recorded on credit terms

---

### 2. PAYMENT TRANSACTION
When you pay a supplier:

```
Journal Entry:
  Debit:  Accounts Payable (Supplier)       $1,200
  Credit: Bank Account / Cash               $1,200
```

**What happens:**
- ✅ Accounts Payable decreases (Liability settled)
- ✅ **Bank balance REDUCED** (Cash leaves company)
- ❌ Inventory unchanged (already recorded at purchase)

**Cash Impact:** -$1,200 from bank

---

## Balance Calculation Formula

```
Bank Balance = Opening Investment + Income Received - Payments Made

Real-time calculation from journal entries:
  For Bank Account Line Items:
    Balance = SUM(Debit Entries) - SUM(Credit Entries)
```

### Why This Matters:

**Scenario 1: Purchase on Credit**
- Purchase $1,000 inventory
- Bank balance: **UNCHANGED** (still shows original amount)
- Accounts Payable: +$1,000

**Scenario 2: Same Purchase + Payment**
- Purchase $1,000 inventory → AP: +$1,000, Bank: unchanged
- Pay $1,000 → AP: -$1,000, Bank: -$1,000

**Scenario 3: Purchase with Insufficient Balance**
- Your bank shows $500
- You try to pay $1,000 purchase
- **SYSTEM BLOCKS PAYMENT** ✅ (Prevents overdraft)

---

## Implementation Details

### Balance Check Endpoint
```
GET /api/stock/payments/check-balance?accountId=ACC-123&amount=1200

Response:
{
  "accountId": "ACC-123",
  "availableBalance": 500,
  "requestedAmount": 1200,
  "canPay": false,
  "message": "Insufficient balance. Available: 500, Requested: 1200"
}
```

### Payment Confirmation Rules
1. **Pre-Payment Check**: Dialog automatically verifies balance
2. **Balance Display**: Shows real-time available cash
3. **User Confirmation**: Must confirm items received + sufficient balance
4. **Backend Validation**: Server re-validates before saving (security)
5. **Journal Creation**: Payment automatically posts to ledger

### Real-Time Balance Updates
```
Example Timeline:
09:00 - Opening Bank: $10,000
10:00 - Purchase Invoice: $2,000 (on credit) → Bank: $10,000
10:15 - Pay Supplier: $2,000 → Bank: $8,000
10:30 - Customer Payment Received: $5,000 → Bank: $13,000
14:00 - Pay Employee: $1,500 → Bank: $11,500
```

---

## Cash Flow Reports Available

### 1. Bank Balance Report
Shows current cash position for each bank account

### 2. Accounts Payable Report
Shows what you OWE (not yet paid)

### 3. Cash Flow Analysis
- Cash inflows (sales, investments)
- Cash outflows (purchases, expenses)
- Net cash position

### 4. Payment Status
- Pending payments (unpaid invoices)
- Paid invoices with payment dates
- Payment reconciliation

---

## Professional Accounting Standards

✅ **IAS 2** - Inventory valuation (purchases increase inventory)
✅ **IAS 7** - Cash flow statement (tracks cash movements)
✅ **IFRS** - Accounts payable recognition
✅ **Double-entry Bookkeeping** - Every transaction affects two accounts
✅ **Accrual Accounting** - Record liability even before payment

---

## User Workflow

### Scenario: Supplier Invoice Payment

```
1. Supplier sends invoice for $1,200
   ↓
2. Record Purchase Invoice
   - System creates journal entry
   - Inventory: +$1,200
   - Accounts Payable: +$1,200
   ↓
3. Open Payment Dialog
   - System checks bank balance
   - Shows: "Available: $5,000, Required: $1,200" ✅
   ↓
4. Confirm Payment
   - Select payment account (Bank)
   - Enter reference number
   - Click "Confirm Payment & Store"
   ↓
5. Payment Processed
   - System creates payment journal entry
   - Accounts Payable: -$1,200
   - Bank Account: -$1,200
   ↓
6. Results
   - New Bank Balance: $3,800
   - Invoice marked: PAID
   - Payment ledger entry created
```

---

## Error Handling

### Insufficient Balance Error
```
USER ACTION: Try to pay $2,000 with only $500 in bank

SYSTEM RESPONSE:
❌ Error: Insufficient bank balance
   Available: $500
   Requested: $2,000
   
ACTION: Button disabled, cannot proceed
SOLUTION: Deposit more funds or pay partial amount
```

### Validation Layers

| Layer | Check |
|-------|-------|
| Frontend | Real-time balance check, UI validation |
| Backend | Balance verification before payment |
| Database | Journal entries audit trail |

---

## Key Features

✅ Automatic balance calculation from journal entries
✅ Real-time cash position updates
✅ Prevents overdraft transactions
✅ Professional audit trail
✅ Complete payment reconciliation
✅ Accounts payable tracking
✅ Multi-currency support (if configured)
✅ Bank account per-account tracking

---

## Configuration (Company Settings)

In Company Settings, you can:
1. Add multiple bank accounts
2. Set opening investment per account
3. Configure currency per account
4. Track separate balances for each account

Each account is tracked independently with its own balance calculation.

---

## Technical Architecture

```
Payment Flow:
User Interface
    ↓
Check Balance Endpoint → Calculate from Journals → Return Current Balance
    ↓
User Confirms Payment
    ↓
Create Payment Record
    ↓
Post Payment Journal Entry:
   - Debit: Accounts Payable
   - Credit: Bank Account
    ↓
Update Balance (Automatic via Journal)
    ↓
Payment Complete ✅
```

---

## Reporting & Compliance

✅ All transactions recorded in journal
✅ Audit trail for all payments
✅ Bank reconciliation support
✅ Tax-ready reports
✅ Financial statement export ready

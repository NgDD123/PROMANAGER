# System Architecture & Flow Diagrams

## 1. Payment Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT PROCESSING FLOW                       │
└─────────────────────────────────────────────────────────────────┘

USER OPENS PAYMENT DIALOG
        │
        ▼
╔═══════════════════════════════╗
║  FRONTEND: Dialog Loaded      ║
║  - Displays invoice summary   ║
║  - Shows payment form         ║
╚═══════════════════════════════╝
        │
        ▼
╔═══════════════════════════════╗
║  CHECK BALANCE REQUEST        ║
║  GET /api/payments/check-balance
║  - accountId: "1010"          ║
║  - amount: $5,500             ║
╚═══════════════════════════════╝
        │
        ▼
╔═══════════════════════════════╗
║  BACKEND: Calculate Balance   ║
║  - Query all journal entries  ║
║  - Sum: Debits - Credits      ║
║  - Result: $10,000            ║
╚═══════════════════════════════╝
        │
        ▼
      COMPARE
    ┌─────────┐
    │ $10,000 │ >= $5,500?
    └─────────┘
        │
    ┌───┴───────┐
    │   YES     │   NO
    ▼           ▼
┌──────────┐  ┌──────────────┐
│ SUFFICIENT
│  FUNDS   │  │ INSUFFICIENT │
└──────────┘  └──────────────┘
    │              │
    ▼              ▼
 GREEN         RED
 ALERT         ALERT
    │              │
    ▼              ▼
BUTTON         BUTTON
ENABLED        DISABLED
    │              │
    ▼              ▼
USER CAN'T PROCEED
MAKES PAYMENT
    │
    ▼
╔═══════════════════════════════╗
║ USER CONFIRMS PAYMENT         ║
║ - Items verified ✓            ║
║ - Balance checked ✓           ║
║ - Click: Confirm Payment      ║
╚═══════════════════════════════╝
    │
    ▼
POST PAYMENT REQUEST
    │
    ▼
╔═══════════════════════════════╗
║ BACKEND: VALIDATE AGAIN       ║
║ - Recheck balance             ║
║ - Verify $10,000 >= $5,500    ║
║ - Result: PASS ✓              ║
╚═══════════════════════════════╝
    │
    ▼
╔═══════════════════════════════╗
║ CREATE PAYMENT RECORD         ║
║ - Save to supplierPayments    ║
║ - Store all details           ║
╚═══════════════════════════════╝
    │
    ▼
╔═══════════════════════════════╗
║ POST JOURNAL ENTRY            ║
║ ┌─────────────────────────────┤
║ │ Debit: Accounts Payable  ║ │
║ │ Amount: $5,500           ║ │
║ ├─────────────────────────────┤
║ │ Credit: Bank Account     ║ │
║ │ Amount: $5,500           ║ │
║ └─────────────────────────────┤
╚═══════════════════════════════╝
    │
    ▼
╔═══════════════════════════════╗
║ UPDATE BALANCES (automatic)   ║
║ - AP: $5,500 → $0             ║
║ - Bank: $10,000 → $4,500      ║
╚═══════════════════════════════╝
    │
    ▼
╔═══════════════════════════════╗
║ SUCCESS ✓                     ║
║ - Payment recorded            ║
║ - Journal posted              ║
║ - Balance updated             ║
║ - Invoice marked PAID         ║
╚═══════════════════════════════╝
    │
    ▼
SHOW SUCCESS MESSAGE
& CLOSE DIALOG
```

---

## 2. Accounting Entries Diagram

```
┌────────────────────────────────────────────────────────────────┐
│            JOURNAL ENTRY FLOW - COMPLETE CYCLE                 │
└────────────────────────────────────────────────────────────────┘

SCENARIO: Company receives $5,500 invoice, pays later

╔═════════════════════════════════════════════════════════════╗
║               EVENT 1: PURCHASE INVOICE                    ║
║                   (Credit Terms)                           ║
╚═════════════════════════════════════════════════════════════╝

Journal Entry #1 - PURCHASE
┌─────────────────────────────────────────┐
│ Date: Jan 15, 2024                      │
│ Description: Purchase INV-001           │
├─────────────────────────────────────────┤
│ ACCOUNT          │ TYPE   │ AMOUNT      │
├──────────────────┼────────┼─────────────┤
│ Inventory        │ Debit  │    $5,000   │
│ VAT Input        │ Debit  │    $ 500    │
│ Accounts Payable │ Credit │    $5,500   │
├──────────────────┼────────┼─────────────┤
│ TOTAL DEBIT: $5,500  |  TOTAL CREDIT: $5,500  ✓
└─────────────────────────────────────────┘

Impact on Balances:
┌──────────────────────────────────────────┐
│ INVENTORY:         $0 → $5,000 (+$5,000) │
│ ACCOUNTS PAYABLE:  $0 → $5,500 (+$5,500) │
│ BANK ACCOUNT:  $10,000 → $10,000 (NO CHANGE) │
└──────────────────────────────────────────┘


╔═════════════════════════════════════════════════════════════╗
║               EVENT 2: PAYMENT MADE                        ║
║                  (Cash Outflow)                            ║
╚═════════════════════════════════════════════════════════════╝

Journal Entry #2 - PAYMENT
┌─────────────────────────────────────────┐
│ Date: Jan 20, 2024                      │
│ Description: Payment INV-001            │
├─────────────────────────────────────────┤
│ ACCOUNT          │ TYPE   │ AMOUNT      │
├──────────────────┼────────┼─────────────┤
│ Accounts Payable │ Debit  │    $5,500   │
│ Bank Account     │ Credit │    $5,500   │
├──────────────────┼────────┼─────────────┤
│ TOTAL DEBIT: $5,500  |  TOTAL CREDIT: $5,500  ✓
└─────────────────────────────────────────┘

Impact on Balances:
┌──────────────────────────────────────────┐
│ ACCOUNTS PAYABLE:  $5,500 → $0 (-$5,500) │
│ BANK ACCOUNT:  $10,000 → $4,500 (-$5,500) │
│ INVENTORY:     $5,000 → $5,000 (NO CHANGE) │
└──────────────────────────────────────────┘


╔═════════════════════════════════════════════════════════════╗
║                 FINAL BALANCES                            ║
╚═════════════════════════════════════════════════════════════╝

Before Purchase:
  Bank:              $10,000
  Inventory:         $0
  Accounts Payable:  $0

After Purchase:
  Bank:              $10,000  (still have cash)
  Inventory:         $5,000   (have goods)
  Accounts Payable:  $5,500   (owe supplier)

After Payment:
  Bank:              $4,500   (paid cash out)
  Inventory:         $5,000   (have goods)
  Accounts Payable:  $0       (debt settled)
```

---

## 3. Balance Calculation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│         REAL-TIME BALANCE CALCULATION SYSTEM                │
└─────────────────────────────────────────────────────────────┘

USER REQUESTS: "What's my bank balance?"
        │
        ▼
╔═══════════════════════════════════════════════╗
║     QUERY JOURNAL ENTRIES COLLECTION          ║
║  WHERE: accountId = "1010" (Bank Account)    ║
║  FILTER: All entries (no date filter)         ║
╚═══════════════════════════════════════════════╝
        │
        ▼
JOURNAL ENTRIES FOUND:
┌──────────────────────────────────────────────┐
│ Entry 1 (Jan 1):  Opening Investment         │
│   Debit: 10,000   Credit: 0                  │
│                                              │
│ Entry 2 (Jan 15): Purchase INV-001           │
│   Debit: 0        Credit: 0  (no bank impact)│
│                                              │
│ Entry 3 (Jan 20): Payment INV-001            │
│   Debit: 0        Credit: 5,500              │
│                                              │
│ Entry 4 (Jan 25): Sales Received             │
│   Debit: 3,000    Credit: 0                  │
└──────────────────────────────────────────────┘
        │
        ▼
╔═══════════════════════════════════════════════╗
║      CALCULATE: SUM(DEBITS) - SUM(CREDITS)    ║
║                                              ║
║  Total Debits:   10,000 + 3,000 = 13,000    ║
║  Total Credits:  0 + 0 + 5,500 + 0 = 5,500 ║
║                                              ║
║  Balance = 13,000 - 5,500 = 7,500           ║
╚═══════════════════════════════════════════════╝
        │
        ▼
RETURN TO USER: $7,500 available

Formula Summary:
┌──────────────────────────────────────────────┐
│ Bank Balance = Opening + Deposits - Payments │
│              = 10,000 + 3,000 - 5,500        │
│              = 7,500 ✓                       │
└──────────────────────────────────────────────┘
```

---

## 4. Data Flow - Complete Payment Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│        COMPLETE DATA FLOW: PURCHASE → PAYMENT → LEDGER        │
└──────────────────────────────────────────────────────────────┘

STEP 1: PURCHASE INVOICE RECEIVED
┌────────────────┐
│ Supplier Email │──→ "Invoice for $5,500"
└────────────────┘
        │
        ▼
USER: "I'll record this"
        │
        ▼
     ┌──────────────────────┐
     │ FRONTEND (Browser)   │
     │                      │
     │ User fills form:     │
     │ - Supplier: Acme     │
     │ - Amount: $5,500     │
     │ - Date: Jan 15       │
     └──────────────────────┘
        │
        ▼
REQUEST: POST /api/stock/purchases
BODY: { supplier, amount, items, taxes }
        │
        ▼
     ┌──────────────────────────┐
     │ BACKEND (Node.js)        │
     │                          │
     │ 1. Create purchase doc   │
     │ 2. Update inventory      │
     │ 3. Post journal entry    │
     └──────────────────────────┘
        │
        ▼
     ┌──────────────────────────┐
     │ FIREBASE (Database)      │
     │                          │
     │ Collections Updated:     │
     │ ✓ purchases              │
     │ ✓ journals               │
     │ ✓ products (stock)       │
     └──────────────────────────┘
        │
        ▼
PURCHASE RECORDED ✓
Accounts Payable: +$5,500
Bank: NO CHANGE


STEP 2: DECISION - MAKE PAYMENT
┌────────────────┐
     │ Payment Due   │──→ "Let's pay Acme"
└────────────────┘
        │
        ▼
USER: "Open payment dialog"
        │
        ▼
     ┌──────────────────────┐
     │ FRONTEND (Browser)   │
     │                      │
     │ Payment Dialog Opens │
     │ Shows invoice details│
     └──────────────────────┘
        │
        ▼
SYSTEM: "Let me check balance"
        │
        ▼
REQUEST: GET /api/payments/check-balance
PARAMS: accountId=1010, amount=5500
        │
        ▼
     ┌──────────────────────────┐
     │ BACKEND (Node.js)        │
     │                          │
     │ 1. Query all journals    │
     │ 2. Calculate balance     │
     │ 3. Compare to amount     │
     │ 4. Return result         │
     └──────────────────────────┘
        │
        ▼
     ┌──────────────────────────┐
     │ FIREBASE (Database)      │
     │                          │
     │ Query: journals          │
     │ Filter: accountId=1010   │
     │ Collect: all entries     │
     └──────────────────────────┘
        │
        ▼
RESPONSE: 
{
  availableBalance: 10000,
  canPay: true,
  message: "Sufficient balance"
}
        │
        ▼
     ┌──────────────────────┐
     │ FRONTEND (Browser)   │
     │                      │
     │ Shows: "Available:   │
     │ $10,000" (GREEN)    │
     │ Button: ENABLED     │
     └──────────────────────┘
        │
        ▼
USER: "Confirm Payment"
        │
        ▼

STEP 3: PROCESS PAYMENT
     ┌──────────────────────┐
     │ FRONTEND (Browser)   │
     │                      │
     │ User clicks:         │
     │ "Confirm Payment &   │
     │  Store"              │
     └──────────────────────┘
        │
        ▼
REQUEST: POST /api/stock/payments
BODY: {
  amount: 5500,
  accountId: "1010",
  supplierId: "acme",
  reference: "WIRE-001",
  paymentMethod: "bank"
}
        │
        ▼
     ┌──────────────────────────┐
     │ BACKEND (Node.js)        │
     │                          │
     │ 1. Validate balance      │
     │    Check: $10,000 ≥      │
     │    $5,500? → YES ✓       │
     │                          │
     │ 2. Create payment record │
     │    Save to DB            │
     │                          │
     │ 3. Post journal entry    │
     │    - Debit: AP $5,500    │
     │    - Credit: Bank $5,500 │
     │    - Create entry        │
     └──────────────────────────┘
        │
        ▼
     ┌──────────────────────────┐
     │ FIREBASE (Database)      │
     │                          │
     │ Collections Updated:     │
     │ ✓ supplierPayments       │
     │ ✓ journals (payment)     │
     │ ✓ accounts (balance)     │
     └──────────────────────────┘
        │
        ▼
PAYMENT PROCESSED ✓
Bank Balance: $10,000 → $4,500
Accounts Payable: $5,500 → $0
        │
        ▼
RESPONSE: {
  id: "payment-123",
  status: "completed",
  journalEntryId: "journal-456",
  message: "Payment processed"
}
        │
        ▼
     ┌──────────────────────┐
     │ FRONTEND (Browser)   │
     │                      │
     │ Shows:               │
     │ "✓ Payment Complete" │
     │ Dialog closes        │
     │ List refreshes       │
     └──────────────────────┘
        │
        ▼
USER SEES: "Invoice marked PAID"
         "Balance now: $4,500"
```

---

## 5. Account Balance Tracking

```
┌────────────────────────────────────────────────────────────┐
│        ACCOUNT BALANCES OVER TIME - EXAMPLE SCENARIO       │
└────────────────────────────────────────────────────────────┘

Timeline of Transactions:

DATE    DESCRIPTION           DEBIT   CREDIT   BALANCE
────────────────────────────────────────────────────────
Jan 1   Opening Invest       10,000            10,000 ✓
        Bank: 10,000
        
Jan 15  Purchase INV-001              5,500    4,500 ✗
        (No, balance stays: 10,000)
        
Jan 15  Purchase creates:
        Inventory: +5,000
        AP: +5,500
        Bank: unchanged 10,000 ✓
        
Jan 20  Payment INV-001              5,500     4,500 ✓
        (Now it DOES change)
        
Jan 20  Payment creates:
        AP: -5,500
        Bank: -5,500
        Bank: 10,000 - 5,500 = 4,500 ✓
        
Jan 25  Sales collected      3,000            7,500 ✓
        
Jan 30  Expense              1,500            6,000 ✓

FINAL BALANCE: $6,000
Calculation: 10,000 + 3,000 - 5,500 - 1,500 = 6,000 ✓
```

---

## 6. UI State Diagram - Payment Dialog

```
┌──────────────────────────────────────────────────────────┐
│          PAYMENT DIALOG - STATE TRANSITIONS              │
└──────────────────────────────────────────────────────────┘

╔════════════════════════════════════════╗
║         DIALOG LOADING STATE           ║
║                                        ║
║  - Shows spinner                       ║
║  - "Checking balance..."               ║
║  - All buttons disabled                ║
╚════════════════════════════════════════╝
        │
        ▼
┌─ Wait for balance check result ─┐
│                                 │
│  GET /check-balance response     │
│  either ARRIVES or FAILS         │
└─────────────────────────────────┘
        │
    ┌───┴──────────┐
    │              │
    ▼              ▼
SUCCESS        FAILURE
    │              │
    ▼              ▼
    BALANCE        ERROR
   CHECKED        STATE
    │              │
    ▼              ▼
┌──────────────┐ ┌──────────────────┐
│ SUFFICIENT?  │ │ Show Error:      │
└──────────────┘ │ "Could not check  │
    │            │  balance"        │
┌───┴────┐      │                  │
│         │      │ Close Dialog or  │
│         │      │ Retry            │
▼         ▼      └──────────────────┘
YES      NO
│        │
▼        ▼
┌──────────────────┐  ┌──────────────────┐
│  GREEN ALERT     │  │  RED ALERT       │
│  ✓ Available:    │  │  ✗ Insufficient: │
│  $10,000         │  │  $5,000 (need    │
│                  │  │  $7,000)         │
│  Form ENABLED    │  │  Form DISABLED   │
│  Button: ON      │  │  Button: OFF     │
└──────────────────┘  └──────────────────┘
    │                       │
    │                   Can't proceed
    │
    ▼
User fills form:
 - Items verified ✓
 - Payment method selected
 - Reference entered
 - Clicks checkbox
    │
    ▼
╔════════════════════════════════════════╗
║    CONFIRM PAYMENT - FORM VALID        ║
║                                        ║
║ All conditions met:                    ║
║ ✓ Balance sufficient                   ║
║ ✓ Items confirmed                      ║
║ ✓ Form filled                          ║
║ ✓ Button enabled                       ║
╚════════════════════════════════════════╝
    │
    ▼
User clicks: "Confirm Payment & Store"
    │
    ▼
╔════════════════════════════════════════╗
║        PROCESSING STATE                ║
║                                        ║
║  - Loading spinner                     ║
║  - "Processing..."                     ║
║  - Buttons disabled                    │
║  - Sending payment request             │
╚════════════════════════════════════════╝
    │
    ▼
Backend processes...
    │
    ▼
Response received
    │
    ├─ SUCCESS ──→ ✓ Success message
    │             Close dialog
    │             Refresh list
    │
    └─ FAILURE ──→ ✗ Error message
                 Keep dialog open
                 Allow retry
```

---

## 7. Database Relationships

```
┌────────────────────────────────────────────────────────────┐
│        DATABASE COLLECTION RELATIONSHIPS                   │
└────────────────────────────────────────────────────────────┘

companySettings (1)
    │
    ├─→ bankAccounts [] (linked to accounts by sourceId)
    │
    └─→ Creates/Auto-syncs-to: accounts
        

purchases (many)
    │
    ├─→ references: accounts (payable, inventory)
    │
    ├─→ creates: journals (purchase entry)
    │
    └─→ can have: supplierPayments


supplierPayments (many)
    │
    ├─→ references: purchases (purchaseId)
    │
    ├─→ references: accounts (bank, payable)
    │
    └─→ creates: journals (payment entry)


journals (audit trail)
    │
    ├─→ references: accounts (line items)
    │
    ├─→ links to sources:
    │   ├─ purchases
    │   ├─ supplierPayments
    │   ├─ sales
    │   └─ other transactions
    │
    └─→ NOT editable directly (immutable)


accounts (chart of accounts)
    │
    ├─→ Asset Accounts (Banks, Inventory, AR)
    │
    ├─→ Liability Accounts (Payables, Loans)
    │
    └─→ Equity Accounts (Capital, Retained Earnings)


CALCULATION FLOW:
accounts + journals = BALANCES
        ↓
Balance (real-time):
  SUM(journal.debit) - SUM(journal.credit)
  WHERE journal.lines.accountId = account.id
```

---

## 8. Payment Decision Tree

```
USER: "Can I make this payment?"

         START
           │
           ▼
    Is payment amount
    specified?
      ├─ NO  → Ask for amount
      └─ YES
           │
           ▼
    Is bank account
    configured?
      ├─ NO  → Go to company settings
      └─ YES
           │
           ▼
    System calls:
    GET /check-balance
           │
           ▼
    Calculate current balance
    from all journal entries
           │
           ▼
    ┌──────────┐
    │ COMPARE  │
    │ Balance  │
    │   >=     │
    │ Amount?  │
    └──────────┘
      ├─ YES  ──────────────────→ CAN PAY ✓
      │                           - Show balance
      │                           - Enable button
      │                           - User confirms
      │
      └─ NO ──────────────────→ CANNOT PAY ✗
                               - Show error
                               - Show shortfall
                               - Disable button
                               - Suggest actions:
                                 • Deposit funds
                                 • Pay partial
                                 • Delay payment
```

---

**All diagrams are ASCII-based and render correctly in markdown**

For visual versions, refer to:
- PROFESSIONAL_CASH_FLOW_SYSTEM.md (workflow descriptions)
- DATABASE_SCHEMA_CASH_FLOW.md (technical details)
- TESTING_GUIDE_CASH_FLOW.md (test flow)

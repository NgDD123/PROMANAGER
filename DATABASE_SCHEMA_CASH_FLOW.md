# Database Schema - Cash Flow & Payment System

## Collections Overview

### 1. `purchases` Collection
Records all purchase orders/invoices from suppliers

```javascript
{
  id: "purchase-uuid",
  invoiceNumber: "INV-2024-001",
  supplierId: "supplier-uuid",
  supplierName: "John's Supplies",
  date: "2024-01-15T10:00:00Z",
  items: [
    {
      productId: "prod-123",
      productName: "Widget",
      quantity: 100,
      unitPrice: 50,
      discount: 5,          // amount or percentage
      taxAmount: 450,
      total: 4950
    }
  ],
  taxes: [
    {
      taxId: "tax-vat",
      taxName: "VAT 9%",
      taxableAmount: 5000,
      taxAmount: 450,
      taxRate: 9
    }
  ],
  totalAmount: 5450,
  status: "completed",      // pending, completed, cancelled
  payableAccountId: "acc-payable-123",
  inventoryAccountId: "acc-inventory-456",
  paymentTerms: "NET 30",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z"
}
```

---

### 2. `supplierPayments` Collection
Records actual payments made to suppliers

```javascript
{
  id: "payment-uuid",
  supplierId: "supplier-uuid",
  supplierName: "John's Supplies",
  purchaseId: "purchase-uuid",           // Links to original purchase
  invoiceNumber: "INV-2024-001",
  amount: 5450,
  paymentMethod: "bank",                 // bank, cash, check, mobile_money
  accountId: "acc-bank-primary",         // Which bank account paid from
  cashOrBankAccountId: "acc-bank-primary",
  reference: "CHK-12345",                // Check number, bank ref, etc.
  paymentDate: "2024-01-20T14:30:00Z",
  date: "2024-01-20T14:30:00Z",
  description: "Payment for INV-2024-001",
  notes: "Paid via wire transfer",
  status: "completed",                   // pending, completed, failed
  journalEntryId: "journal-payment-789", // Links to accounting entry
  payableAccountId: "acc-payable-123",
  type: "supplier",
  createdAt: "2024-01-20T14:30:00Z",
  updatedAt: "2024-01-20T14:30:00Z"
}
```

---

### 3. `accounts` Collection
Chart of Accounts - All accounting accounts

```javascript
{
  id: "acc-bank-primary",
  code: "1010",
  name: "Primary Bank Account",
  accountType: "Asset",
  category: "Current Assets",
  subCategory: "Bank Accounts",
  statement: "Balance Sheet",
  status: "Active",
  currency: "USD",
  openingInvestment: 10000,
  sourceType: "CompanySettings",         // auto-generated from company settings
  sourceBankAccountId: "bank-acc-123",   // reference to company bank account
  sourceAccountRole: "Bank",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

**Other Key Accounts:**
```
Inventory Accounts:
  - code: 1200, name: "Raw Materials"
  - code: 1210, name: "Work in Progress"
  - code: 1220, name: "Finished Goods"

Liability Accounts:
  - code: 2100, name: "Accounts Payable"
  - code: 2110, name: "Salaries Payable"

Equity Accounts:
  - code: 3100, name: "Share Capital / Investment Capital"
```

---

### 4. `journals` Collection
Complete accounting journal entries (audit trail)

```javascript
{
  id: "journal-entry-123",
  date: "2024-01-15T10:00:00Z",
  description: "Purchase invoice INV-2024-001",
  reference: "INV-2024-001",
  referenceId: "purchase-uuid",
  source: {
    type: "purchase",                    // purchase, supplierPayment, sale, etc.
    id: "purchase-uuid"
  },
  userId: "user-456",                    // Who recorded this
  lines: [
    {
      accountId: "acc-inventory-456",
      accountName: "Raw Materials",
      type: "debit",
      amount: 5000,
      debit: 5000,
      credit: 0
    },
    {
      accountId: "acc-vat-input-789",
      accountName: "VAT Input",
      type: "debit",
      amount: 450,
      debit: 450,
      credit: 0
    },
    {
      accountId: "acc-payable-123",
      accountName: "Accounts Payable",
      type: "credit",
      amount: 5450,
      debit: 0,
      credit: 5450
    }
  ],
  status: "posted",                      // draft, posted, reversed
  totalDebit: 5450,
  totalCredit: 5450,
  balanced: true,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z"
}
```

---

### 5. `companySettings` Collection
Company bank account configuration

```javascript
{
  id: "default",
  companyName: "Acme Corp",
  companyLogo: "https://...",
  registrationNumber: "REG-123456",
  tinTaxNumber: "TIN-789",
  defaultCurrency: "USD",
  bankAccounts: [
    {
      id: "bank-acc-primary",
      bankName: "First National Bank",
      accountNumber: "1234567890",
      currency: "USD",
      openingInvestment: 10000,
      investmentDate: "2024-01-01",
      status: "Active",
      notes: "Operating account"
    },
    {
      id: "bank-acc-savings",
      bankName: "First National Bank",
      accountNumber: "0987654321",
      currency: "USD",
      openingInvestment: 50000,
      investmentDate: "2024-01-01",
      status: "Active",
      notes: "Savings account"
    }
  ],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z"
}
```

---

## Relationship Diagram

```
companySettings
    ├── bankAccounts[]
    │   └── synced to → accounts (auto-generated)
    │
purchases
    ├── relates to → supplierPayments (purchaseId)
    ├── creates → journals (reference entry)
    └── references → accounts (payable, inventory)

supplierPayments
    ├── relates to → purchases (purchaseId)
    ├── creates → journals (payment entry)
    └── references → accounts (bank, payable)

journals (audit trail)
    ├── references → accounts (lines[].accountId)
    └── links to source
        ├── purchases
        ├── supplierPayments
        └── other transactions
```

---

## Balance Calculation

### Bank Account Balance
```
For a given accountId:

Balance = SUM(All Journal Entries for this account)

Calculate:
  FOR each journal_entry where date <= report_date:
    FOR each line in journal_entry.lines:
      IF line.accountId matches bank account:
        balance += line.debit - line.credit

Result: Current bank account balance
```

### Example Calculation
```
Bank Account ID: acc-bank-primary

Journal Entries (Debits and Credits):
  1. Opening Investment (Jan 1):    Debit: 10,000 (opening balance)
  2. Purchase (Jan 15):             Credit: 2,000 (liab created, no impact)
  3. Payment (Jan 20):              Credit: 2,000 (bank payment)
  4. Sale Receipt (Jan 25):         Debit: 3,000 (cash received)
  5. Expense (Jan 28):              Credit: 500 (cash paid)

Balance Calculation:
  = Debit entries - Credit entries
  = (10,000 + 3,000) - (2,000 + 500)
  = 13,000 - 2,500
  = 10,500 ✓
```

---

## Transaction Flow Example

### Complete Purchase-to-Payment Cycle

```
STEP 1: Receive Purchase Invoice (Jan 15)
├─ Create: purchases document
├─ Post Journal Entry:
│   Debit:  Inventory (1,000)
│   Debit:  VAT Input (100)
│   Credit: Accounts Payable (1,100)
└─ Result: Bank balance unchanged

STEP 2: Record Payment (Jan 20)
├─ Create: supplierPayments document
├─ Validate: Bank balance >= 1,100 ✅
├─ Post Journal Entry:
│   Debit:  Accounts Payable (1,100)
│   Credit: Bank Account (1,100)
└─ Result: Bank balance reduced by 1,100

STEP 3: Verification
├─ Check Journal Entry:
│   - Total Debits = Total Credits ✓
│   - Accounts Payable: 0 (settled)
│   - Bank: -1,100 (cash paid)
└─ Status: Complete ✓
```

---

## Query Examples

### Get Bank Balance (as of date)
```javascript
// Pseudo-code for balance calculation
const getAccountBalance = async (accountId, asOfDate = today) => {
  const journals = await db.collection('journals')
    .where('date', '<=', asOfDate)
    .get();
  
  let balance = 0;
  journals.forEach(entry => {
    entry.lines.forEach(line => {
      if (line.accountId === accountId) {
        balance += (line.debit || 0) - (line.credit || 0);
      }
    });
  });
  return balance;
};
```

### Get Pending Payments
```javascript
const getPendingPayments = async (supplierId) => {
  const purchases = await db.collection('purchases')
    .where('supplierId', '==', supplierId)
    .where('status', '==', 'completed')
    .get();
  
  const payments = await db.collection('supplierPayments')
    .where('supplierId', '==', supplierId)
    .get();
  
  // Match purchases to payments
  return purchases.filter(p => 
    !payments.some(py => py.purchaseId === p.id)
  );
};
```

---

## Data Integrity Checks

✅ **Journal Balance**: Sum(Debits) = Sum(Credits) for each entry
✅ **Account Balance**: Bank balance >= 0 (prevents overdraft)
✅ **Referential Integrity**: Payment.purchaseId exists in purchases
✅ **Reconciliation**: Payment amount <= Purchase total amount
✅ **Audit Trail**: All changes timestamped and traceable

---

## Indexes (Performance Optimization)

```
purchases:
  - Index: supplierId + status
  - Index: date
  - Index: invoiceNumber

supplierPayments:
  - Index: supplierId + date
  - Index: accountId (for balance queries)
  - Index: purchaseId

journals:
  - Index: date (for balance calculations)
  - Index: referenceId (quick lookup)
  - Index: source.id
  - Composite: date + accountId (balance queries)
```

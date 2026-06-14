# Payment Balance Validation Implementation

## Overview
Payment confirmation now requires sufficient bank balance before processing. Payments are only confirmed when the bank account has enough cash balance.

## Changes Made

### 1. Backend - Payment Controller
**File:** `backend/src/controllers/stock/payment.controller.js`

- **Added `getAccountBalance()` function**: Calculates available bank balance by analyzing journal entries (debits - credits)
- **Added `checkBankBalance()` endpoint**: GET `/api/stock/payments/check-balance`
  - Query params: `accountId`, `amount`
  - Returns: `canPay`, `availableBalance`, `requestedAmount`, `message`
- **Updated `createSupplierPayment()` method**: 
  - Validates balance before creating payment
  - Returns 400 error if insufficient funds with details

### 2. Backend - Payment Routes
**File:** `backend/src/routes/stock/payment.routes.js`

- Added new route: `GET /check-balance` for balance checking before payment

### 3. Frontend - Payment Dialog
**File:** `stock_manager/src/components/modals/PaymentConfirmationDialog.tsx`

**New Features:**
- Automatic balance checking when dialog opens or account selection changes
- Displays available bank balance in success alert
- Shows error alert if insufficient balance with amount details
- Loading spinner while checking balance
- Confirms payment button disabled if:
  - Balance is insufficient
  - Still checking balance
  - Items not confirmed

**New State Variables:**
- `bankBalance`: Current available balance
- `balanceError`: Error message if insufficient funds
- `checkingBalance`: Loading state

**New Functions:**
- `checkBalance()`: Fetches balance from server and validates against payment amount

## Flow

1. **Payment Dialog Opens** → Auto-check balance for selected account
2. **User Changes Account** → Re-check balance for new account
3. **Balance Sufficient** → Green alert shows available balance, button enabled
4. **Insufficient Balance** → Red alert shows error, button disabled
5. **User Confirms Payment** → Backend validates again before creating payment

## API Response Examples

### Balance Check Success
```json
{
  "accountId": "account-123",
  "availableBalance": 5000,
  "requestedAmount": 2500,
  "canPay": true,
  "message": "Sufficient balance available"
}
```

### Balance Check Failure
```json
{
  "accountId": "account-123",
  "availableBalance": 1000,
  "requestedAmount": 2500,
  "canPay": false,
  "message": "Insufficient balance. Available: 1000, Requested: 2500"
}
```

### Payment Creation Error (Insufficient Balance)
```json
{
  "error": "Insufficient bank balance",
  "availableBalance": 1000,
  "requestedAmount": 2500
}
```

## Security Notes
- Balance validation happens on both frontend (UX) and backend (security)
- Prevents payments even if frontend validation is bypassed
- Uses journal entries for real-time balance calculation

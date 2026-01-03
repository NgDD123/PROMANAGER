// src/utils/format.js

// List of top 50 currencies + Rwandan Franc
export const supportedCurrencies = [
  "USD", "EUR", "JPY", "GBP", "AUD", "CAD", "CHF", "CNY", "HKD", "NZD",
  "SEK", "KRW", "SGD", "NOK", "MXN", "INR", "RUB", "ZAR", "TRY", "BRL",
  "TWD", "DKK", "PLN", "THB", "IDR", "HUF", "CZK", "ILS", "CLP", "PHP",
  "AED", "COP", "SAR", "MYR", "RON", "VND", "PKR", "EGP", "KWD", "QAR",
  "NGN", "BDT", "LKR", "DZD", "MAD", "UAH", "RWF", "OMR", "KZT", "BHD"
];

// Format number to a currency string
export function formatCurrency(amount, currency = "USD") {
  if (!supportedCurrencies.includes(currency)) {
    console.warn(`Currency ${currency} not supported. Falling back to USD.`);
    currency = "USD";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

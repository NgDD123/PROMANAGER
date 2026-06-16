import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";
import { AccountModel } from "./accounts.model.js";

const COLLECTION = "companySettings";
const DOCUMENT_ID = "default";

const cleanBankAccounts = (accounts = []) =>
  (Array.isArray(accounts) ? accounts : []).map((account, index) => ({
    id: account.id || `bank-${Date.now()}-${index}`,
    bankName: account.bankName || "",
    accountNumber: account.accountNumber || "",
    currency: account.currency || "USD",
    openingInvestment: Number(account.openingInvestment) || 0,
    investmentDate: account.investmentDate || "",
    status: account.status || "Active",
    notes: account.notes || "",
  }));

const normalizeSettings = (data = {}) => ({
  companyName: data.companyName || "",
  companyLogo: data.companyLogo || "",
  registrationNumber: data.registrationNumber || "",
  tinTaxNumber: data.tinTaxNumber || "",
  businessLicenseNumber: data.businessLicenseNumber || "",
  defaultCurrency: data.defaultCurrency || "USD",
  bankAccounts: cleanBankAccounts(data.bankAccounts),
});

const generatedAccountKey = (bankAccountId, role) => `company-settings:${bankAccountId}:${role}`;

const findGeneratedAccount = (accounts, bankAccountId, role) =>
  accounts.find(
    (account) =>
      account.sourceType === "CompanySettings" &&
      account.sourceBankAccountId === bankAccountId &&
      account.sourceAccountRole === role
  );

const nextAccountCode = (accounts, startCode) => {
  const usedCodes = new Set(accounts.map((account) => String(account.code)));
  let code = startCode;
  while (usedCodes.has(String(code))) code += 1;
  return String(code);
};

const syncBankAccountsToChartOfAccounts = async (settings) => {
  const accounts = await AccountModel.findAll();
  const activeBankAccounts = settings.bankAccounts.filter(
    (account) => account.bankName && account.accountNumber && account.status !== "Inactive"
  );

  for (const [index, bankAccount] of activeBankAccounts.entries()) {
    const bankAccountName = `${bankAccount.bankName} - ${bankAccount.accountNumber}`;
    const investmentAmount = Number(bankAccount.openingInvestment) || 0;
    const bankSourceKey = generatedAccountKey(bankAccount.id, "Bank");
    const investmentSourceKey = generatedAccountKey(bankAccount.id, "InvestmentCapital");

    const bankPayload = {
      name: bankAccountName,
      accountName: bankAccountName,
      accountType: "Asset",
      type: "Assets",
      category: "Current Assets",
      subCategory: "Bank Accounts",
      statement: "Balance Sheet",
      status: "Active",
      currency: bankAccount.currency || settings.defaultCurrency || "USD",
      openingInvestment: investmentAmount,
      openingBalance: investmentAmount,
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      isBankAccount: true,
      isPaymentAccount: true,
      sourceType: "CompanySettings",
      sourceKey: bankSourceKey,
      sourceBankAccountId: bankAccount.id,
      sourceAccountRole: "Bank",
    };

    const investmentPayload = {
      name: `Investment Capital - ${bankAccount.bankName}`,
      accountName: `Investment Capital - ${bankAccount.bankName}`,
      accountType: "Equity",
      type: "Equity",
      category: "Equity",
      subCategory: "Share Capital",
      statement: "Balance Sheet",
      status: "Active",
      currency: bankAccount.currency || settings.defaultCurrency || "USD",
      openingInvestment: investmentAmount,
      openingBalance: investmentAmount,
      sourceType: "CompanySettings",
      sourceKey: investmentSourceKey,
      sourceBankAccountId: bankAccount.id,
      sourceAccountRole: "InvestmentCapital",
    };

    const existingBankAccount = findGeneratedAccount(accounts, bankAccount.id, "Bank");
    if (existingBankAccount) {
      await AccountModel.update(existingBankAccount.id, bankPayload);
    } else {
      const created = await AccountModel.create({
        ...bankPayload,
        code: nextAccountCode(accounts, 1100 + index),
      });
      accounts.push(created);
    }

    const existingInvestmentAccount = findGeneratedAccount(accounts, bankAccount.id, "InvestmentCapital");
    if (existingInvestmentAccount) {
      await AccountModel.update(existingInvestmentAccount.id, investmentPayload);
    } else {
      const created = await AccountModel.create({
        ...investmentPayload,
        code: nextAccountCode(accounts, 3100 + index),
      });
      accounts.push(created);
    }
  }

  const activeBankIds = new Set(activeBankAccounts.map((account) => account.id));
  const staleGeneratedAccounts = accounts.filter(
    (account) =>
      account.sourceType === "CompanySettings" &&
      account.sourceBankAccountId &&
      !activeBankIds.has(account.sourceBankAccountId)
  );

  for (const account of staleGeneratedAccounts) {
    await AccountModel.update(account.id, { status: "Inactive" });
  }
};

export const CompanySettingModel = {
  async get() {
    const ref = db().collection(COLLECTION).doc(DOCUMENT_ID);
    const doc = await ref.get();
    if (!doc.exists) {
      return {
        id: DOCUMENT_ID,
        ...normalizeSettings(),
      };
    }
    return { id: doc.id, ...doc.data() };
  },

  async save(data) {
    const ref = db().collection(COLLECTION).doc(DOCUMENT_ID);
    const existing = await ref.get();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const payload = {
      ...normalizeSettings(data),
      updatedAt: timestamp,
      ...(existing.exists ? {} : { createdAt: timestamp }),
    };

    await ref.set(payload, { merge: true });
    await syncBankAccountsToChartOfAccounts(payload);
    return { id: DOCUMENT_ID, ...payload };
  },
};

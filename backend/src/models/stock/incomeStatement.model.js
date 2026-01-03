import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const journalCollection = db().collection("journalEntries");
const accountSettingsCollection = db().collection("accountSettings");
const incomeCollection = db().collection("incomeStatements");

const IncomeStatementModel = {
  // Build income statement for given date range (inclusive)
  async generate({ from = null, to = null, runId = `run-${Date.now()}` } = {}) {
    // load accounts metadata
    const acctSnap = await accountSettingsCollection.get();
    const accounts = acctSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Revenue & Expenses lists
    const revenueAccounts = accounts.filter(a => (a.category || a.type || "").toLowerCase() === "revenue");
    const expenseAccounts = accounts.filter(a => (a.category || a.type || "").toLowerCase() === "expenses");

    // fetch journal entries in range
    let query = journalCollection;
    if (from) query = query.where("date", ">=", from);
    if (to) query = query.where("date", "<=", to);
    const jSnap = await query.get();
    const journals = jSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const totals = {
      revenue: 0,
      expenses: 0,
      revenueByAccount: {},
      expenseByAccount: {},
    };

    journals.forEach(entry => {
      (entry.lines || []).forEach(line => {
        const acctMeta = accounts.find(a => a.id === line.accountId);
        const acctCategory = (acctMeta?.category || acctMeta?.type || "").toLowerCase();

        if (line.type === "credit" && acctCategory === "revenue") {
          totals.revenue += Number(line.amount || 0);
          totals.revenueByAccount[line.accountId] = (totals.revenueByAccount[line.accountId] || 0) + Number(line.amount || 0);
        }
        if (line.type === "debit" && acctCategory === "revenue") {
          // contra or refund - treat as negative revenue
          totals.revenue -= Number(line.amount || 0);
          totals.revenueByAccount[line.accountId] = (totals.revenueByAccount[line.accountId] || 0) - Number(line.amount || 0);
        }

        if (line.type === "debit" && acctCategory === "expenses") {
          totals.expenses += Number(line.amount || 0);
          totals.expenseByAccount[line.accountId] = (totals.expenseByAccount[line.accountId] || 0) + Number(line.amount || 0);
        }
        if (line.type === "credit" && acctCategory === "expenses") {
          // contra expense or reversal
          totals.expenses -= Number(line.amount || 0);
          totals.expenseByAccount[line.accountId] = (totals.expenseByAccount[line.accountId] || 0) - Number(line.amount || 0);
        }
      });
    });

    const netIncome = totals.revenue - totals.expenses;

    const snapshot = {
      runId,
      from,
      to,
      generatedAt: new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      totals,
      netIncome,
    };

    await incomeCollection.doc(runId).set(snapshot);
    return { id: runId, ...snapshot };
  },

  async getSnapshot(runId = null) {
    if (runId) {
      const doc = await incomeCollection.doc(runId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    }
    const snap = await incomeCollection.orderBy("createdAt", "desc").limit(1).get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  },

  async removeSnapshot(runId) {
    await incomeCollection.doc(runId).delete();
    return true;
  },
};

export default IncomeStatementModel;

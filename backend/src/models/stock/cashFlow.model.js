import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const journalCollection = db().collection("journalEntries");
const accountSettingsCollection = db().collection("accountSettings");
const cfCollection = db().collection("cashFlows");

const CashFlowModel = {
  // generate cashflow for period
  async generate({ from = null, to = null, runId = `run-${Date.now()}` } = {}) {
    const acctSnap = await accountSettingsCollection.get();
    const accounts = acctSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // identify cash accounts (flag "isCash" true or category contains 'cash' or 'bank')
    const cashAccountIds = accounts.filter(a => a.isCash || (a.category || "").toLowerCase().includes("cash") || (a.name || "").toLowerCase().includes("cash") || (a.name || "").toLowerCase().includes("bank")).map(a => a.id);

    // fetch journal entries in date range
    let q = journalCollection;
    if (from) q = q.where("date", ">=", from);
    if (to) q = q.where("date", "<=", to);
    const jSnap = await q.get();
    const journals = jSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const activities = {
      operating: 0,
      investing: 0,
      financing: 0,
      details: { operating: [], investing: [], financing: [] },
    };

    // Map account categories to activity bucket — simple mapping
    const mapCategoryToActivity = (category = "") => {
      const c = (category || "").toLowerCase();
      if (["revenue", "expenses", "cost of goods sold", "cogs", "operating"].some(s => c.includes(s))) return "operating";
      if (["assets", "property", "plant", "equipment", "investments", "long-term investments"].some(s => c.includes(s))) return "investing";
      if (["liabilities", "equity", "loans", "capital", "share"].some(s => c.includes(s))) return "financing";
      return "operating";
    };

    // compute cash movements: any journal line that uses a cash account is cash movement.
    journals.forEach(entry => {
      (entry.lines || []).forEach(line => {
        if (!cashAccountIds.includes(line.accountId)) return; // not cash
        const amt = Number(line.amount) || 0;
        // Determine if cash was received (debit to cash for asset accounts) or paid (credit to cash)
        // For cash accounts (Assets), debit increases cash, credit decreases cash
        const isIncrease = line.type === "debit"; // debit increases cash asset
        // find counter-part account (simple: find other line in same journal)
        const otherLine = (entry.lines || []).find(l => l.accountId !== line.accountId);
        const otherAcctMeta = accounts.find(a => a.id === otherLine?.accountId);
        const activity = mapCategoryToActivity(otherAcctMeta?.category || otherAcctMeta?.type);

        const signed = isIncrease ? +amt : -amt;
        activities[activity] += signed;
        activities.details[activity].push({
          journalId: entry.id,
          date: entry.date,
          cashAccountId: line.accountId,
          counterAccountId: otherLine?.accountId,
          amount: signed,
          description: entry.description || "",
        });
      });
    });

    const netIncrease = activities.operating + activities.investing + activities.financing;

    const snapshot = {
      runId,
      from,
      to,
      generatedAt: new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      activities,
      netIncrease,
    };

    await cfCollection.doc(runId).set(snapshot);
    return { id: runId, ...snapshot };
  },

  async getSnapshot(runId = null) {
    if (runId) {
      const doc = await cfCollection.doc(runId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    }
    const snap = await cfCollection.orderBy("createdAt", "desc").limit(1).get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  },

  async removeSnapshot(runId) {
    await cfCollection.doc(runId).delete();
    return true;
  },
};

export default CashFlowModel;

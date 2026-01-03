import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const journalCollection = db().collection("journalEntries");
const accountSettingsCollection = db().collection("accountSettings");
const bsCollection = db().collection("balanceSheets");

const BalanceSheetModel = {
  async generate({ asOf = null, runId = `run-${Date.now()}` } = {}) {
    // load accounts
    const acctSnap = await accountSettingsCollection.get();
    const accounts = acctSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // fetch journal entries up to asOf if provided
    let q = journalCollection;
    if (asOf) q = q.where("date", "<=", asOf);
    const jSnap = await q.get();
    const journals = jSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // compute account balances (debit - credit)
    const balances = {};
    accounts.forEach(a => { balances[a.id] = { account: a, debit: 0, credit: 0 }; });

    journals.forEach(entry => {
      (entry.lines || []).forEach(line => {
        const id = line.accountId;
        const amt = Number(line.amount) || 0;
        if (!balances[id]) balances[id] = { account: { id }, debit: 0, credit: 0 };
        if (line.type === "debit") balances[id].debit += amt;
        else balances[id].credit += amt;
      });
    });

    // bucket by category
    const assets = [];
    const liabilities = [];
    const equity = [];
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    Object.values(balances).forEach(b => {
      const acct = b.account;
      const net = (b.debit || 0) - (b.credit || 0);
      const category = (acct.category || acct.type || "").toLowerCase();
      if (category === "assets") {
        assets.push({ account: acct, amount: net });
        totalAssets += net;
      } else if (category === "liabilities") {
        liabilities.push({ account: acct, amount: -net }); // present liabilities as positive
        totalLiabilities += -net;
      } else if (category === "equity") {
        equity.push({ account: acct, amount: -net }); // equity credit balance positive
        totalEquity += -net;
      } else {
        // fallback — classify negative vs positive
        if (net >= 0) {
          assets.push({ account: acct, amount: net });
          totalAssets += net;
        } else {
          liabilities.push({ account: acct, amount: -net });
          totalLiabilities += -net;
        }
      }
    });

    const snapshot = {
      runId,
      asOf,
      generatedAt: new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      assets,
      liabilities,
      equity,
      totals: { totalAssets, totalLiabilities, totalEquity },
    };

    await bsCollection.doc(runId).set(snapshot);
    return { id: runId, ...snapshot };
  },

  async getSnapshot(runId = null) {
    if (runId) {
      const doc = await bsCollection.doc(runId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    }
    const snap = await bsCollection.orderBy("createdAt", "desc").limit(1).get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  },

  async removeSnapshot(runId) {
    await bsCollection.doc(runId).delete();
    return true;
  },
};

export default BalanceSheetModel;

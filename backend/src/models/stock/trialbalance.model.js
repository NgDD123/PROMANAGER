import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const tbCollection = db().collection("trialBalance");

const TrialBalanceModel = {
  // Update trial balance totals for an account
  async update(accountId, type, amount) {
    const docRef = tbCollection.doc(accountId);
    const snapshot = await docRef.get();

    let debit = 0, credit = 0;
    if (snapshot.exists) {
      const data = snapshot.data();
      debit = data.debit || 0;
      credit = data.credit || 0;
    }

    if (type === "debit") debit += Number(amount);
    else credit += Number(amount);

    await docRef.set({ accountId, debit, credit }, { merge: true });
    return { accountId, debit, credit };
  },

  // Adjust trial balance (used for deleting or updating journal entries)
  async adjust(accountId, type, amount, isSubtract = false) {
    const docRef = tbCollection.doc(accountId);
    const snapshot = await docRef.get();
    if (!snapshot.exists) return null;

    const data = snapshot.data();
    let debit = data.debit || 0;
    let credit = data.credit || 0;

    if (type === "debit") debit += isSubtract ? -amount : amount;
    else credit += isSubtract ? -amount : amount;

    await docRef.set({ accountId, debit, credit }, { merge: true });
    return { accountId, debit, credit };
  },

  // Get all trial balance entries
  async findAll() {
    const snapshot = await tbCollection.get();
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

export default TrialBalanceModel;

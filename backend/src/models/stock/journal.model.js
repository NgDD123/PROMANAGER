import { db } from "../../../utils/firebase.js";
import admin from "firebase-admin";

const journalCollection = db().collection("journalEntries");

const JournalModel = {
  // Create a new journal entry (supports multiple debit/credit lines)
  async create(entry) {
    const newDoc = journalCollection.doc();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const data = {
      ...entry,
      date: entry.date || new Date().toISOString(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await newDoc.set(data);
    return { id: newDoc.id, ...data };
  },

  // Get all journal entries, sorted by date
  async findAll() {
    const snapshot = await journalCollection.orderBy("date", "desc").get();
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // Remove a journal entry by ID
  async remove(id) {
    await journalCollection.doc(id).delete();
    return true;
  },

  // Optional: get entries by account
  async findByAccount(accountId) {
    const snapshot = await journalCollection
      .where("lines.accountId", "array-contains", accountId)
      .orderBy("date", "desc")
      .get();
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

export default JournalModel;

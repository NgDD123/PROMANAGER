import JournalModel from "../../models/stock/journal.model.js";

const JournalController = {
  // Create a journal entry
  async create(req, res) {
    console.log("➡️ [JournalController.create] Received request to create journal entry");
    try {
      const entry = req.body;
      console.log("📦 Incoming entry data:", JSON.stringify(entry, null, 2));

      if (!entry || !entry.lines || !Array.isArray(entry.lines)) {
        console.warn("⚠️ Invalid entry data structure:", entry);
        return res.status(400).json({ error: "Invalid entry format" });
      }

      // Validate that debits = credits
      const totalDebit = entry.lines
        .filter((l) => l.type === "debit")
        .reduce((sum, l) => sum + Number(l.amount || 0), 0);
      const totalCredit = entry.lines
        .filter((l) => l.type === "credit")
        .reduce((sum, l) => sum + Number(l.amount || 0), 0);

      console.log("💰 Total Debit:", totalDebit, "| Total Credit:", totalCredit);

      if (totalDebit !== totalCredit) {
        console.error("❌ Debit and Credit mismatch!");
        return res.status(400).json({ error: "Debits must equal credits" });
      }

      console.log("📝 Creating journal entry in database...");
      const result = await JournalModel.create(entry);
      console.log("✅ Journal entry created successfully:", result);

      res.status(201).json(result);
    } catch (err) {
      console.error("🔥 Error creating journal entry:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get all journal entries
  async getAll(req, res) {
    console.log("➡️ [JournalController.getAll] Fetching all journal entries...");
    try {
      const entries = await JournalModel.findAll();
      console.log(`📚 Retrieved ${entries.length} journal entries`);
      res.status(200).json(entries);
    } catch (err) {
      console.error("🔥 Error fetching journal entries:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Delete a journal entry
  async remove(req, res) {
    console.log("➡️ [JournalController.remove] Request to delete journal entry");
    try {
      const { id } = req.params;
      console.log("🗑️ Deleting journal entry with ID:", id);

      if (!id) {
        console.warn("⚠️ Missing journal entry ID");
        return res.status(400).json({ error: "Missing journal entry ID" });
      }

      const result = await JournalModel.remove(id);
      console.log("✅ Journal entry deleted successfully:", result);

      res.status(200).json({ message: "Journal entry deleted" });
    } catch (err) {
      console.error("🔥 Error deleting journal entry:", err);
      res.status(500).json({ error: err.message });
    }
  },
};

export default JournalController;

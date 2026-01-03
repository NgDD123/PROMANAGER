import  defaultChartAccounts  from "../../data/defaultChartAccounts.js";
import { AccountModel } from "../../models/stock/accounts.model.js";

export const AccountController = {
  // Seed default chart of accounts
  async seedDefault(req, res) {
    try {
      // Optional: Remove existing accounts before seeding
      await AccountModel.removeAll();

      const seededAccounts = [];
      for (const account of defaultChartAccounts) {
        const created = await AccountModel.create(account);
        seededAccounts.push(created);
      }

      res.json({
        message: "Default chart of accounts seeded successfully",
        seededCount: seededAccounts.length
      });
    } catch (err) {
      console.error("Seeding error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get all accounts
  async getAll(req, res) {
    try {
      const accounts = await AccountModel.findAll();
      res.json(accounts);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

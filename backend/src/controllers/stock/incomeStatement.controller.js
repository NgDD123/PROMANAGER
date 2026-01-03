import IncomeStatementModel from "../../models/stock/incomeStatement.model.js";

const IncomeStatementController = {
  // generate snapshot for a period
  async generate(req, res) {
    try {
      const { from, to, runId } = req.query;
      const snap = await IncomeStatementModel.generate({ from, to, runId });
      res.status(200).json(snap);
    } catch (err) {
      console.error("IncomeStatement generate error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async get(req, res) {
    try {
      const { runId } = req.query;
      const snap = await IncomeStatementModel.getSnapshot(runId);
      if (!snap) return res.status(404).json({ error: "No income statement snapshot found" });
      res.status(200).json(snap);
    } catch (err) {
      console.error("IncomeStatement get error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      await IncomeStatementModel.removeSnapshot(id);
      res.status(200).json({ message: "Income statement snapshot removed" });
    } catch (err) {
      console.error("IncomeStatement remove error:", err);
      res.status(500).json({ error: err.message });
    }
  },
};

export default IncomeStatementController;

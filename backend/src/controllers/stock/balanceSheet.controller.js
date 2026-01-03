import BalanceSheetModel from "../../models/stock/balanceSheet.model.js";

const BalanceSheetController = {
  async generate(req, res) {
    try {
      const { asOf, runId } = req.query;
      const snap = await BalanceSheetModel.generate({ asOf, runId });
      res.status(200).json(snap);
    } catch (err) {
      console.error("BalanceSheet generate error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async get(req, res) {
    try {
      const { runId } = req.query;
      const snap = await BalanceSheetModel.getSnapshot(runId);
      if (!snap) return res.status(404).json({ error: "No balance sheet snapshot found" });
      res.status(200).json(snap);
    } catch (err) {
      console.error("BalanceSheet get error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      await BalanceSheetModel.removeSnapshot(id);
      res.status(200).json({ message: "Balance sheet snapshot removed" });
    } catch (err) {
      console.error("BalanceSheet remove error:", err);
      res.status(500).json({ error: err.message });
    }
  },
};

export default BalanceSheetController;

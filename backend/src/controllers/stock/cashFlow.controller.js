import CashFlowModel from "../../models/stock/cashFlow.model.js";

const CashFlowController = {
  async generate(req, res) {
    try {
      const { from, to, runId } = req.query;
      const snap = await CashFlowModel.generate({ from, to, runId });
      res.status(200).json(snap);
    } catch (err) {
      console.error("CashFlow generate error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async get(req, res) {
    try {
      const { runId } = req.query;
      const snap = await CashFlowModel.getSnapshot(runId);
      if (!snap) return res.status(404).json({ error: "No cash flow snapshot found" });
      res.status(200).json(snap);
    } catch (err) {
      console.error("CashFlow get error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      await CashFlowModel.removeSnapshot(id);
      res.status(200).json({ message: "Cash flow snapshot removed" });
    } catch (err) {
      console.error("CashFlow remove error:", err);
      res.status(500).json({ error: err.message });
    }
  },
};

export default CashFlowController;

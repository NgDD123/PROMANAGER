import TrialBalanceModel from "../../models/stock/trialbalance.model.js";

const TrialBalanceController = {
  async getAll(req, res) {
    try {
      const entries = await TrialBalanceModel.findAll();
      res.status(200).json(entries);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

export default TrialBalanceController;

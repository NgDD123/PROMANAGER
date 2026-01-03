import LedgerModel from "../../models/stock/ledger.model.js";

const LedgerController = {
  async getAll(req, res) {
    try {
      const entries = await LedgerModel.findAll();
      res.status(200).json(entries);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getByAccount(req, res) {
    try {
      const { accountId } = req.params;
      const entries = await LedgerModel.findByAccount(accountId);
      res.status(200).json(entries);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

export default LedgerController;

import { CustomerModel } from "../../models/stock/customer.model.js";

export const CustomerController = {
  async create(req, res) {
    try {
      const customer = await CustomerModel.create(req.body);
      res.status(201).json(customer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAll(req, res) {
    try {
      const customers = await CustomerModel.findAll();
      res.json(customers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const customer = await CustomerModel.findById(req.params.id);
      if (!customer) return res.status(404).json({ message: "Customer not found" });
      res.json(customer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const customer = await CustomerModel.update(req.params.id, req.body);
      res.json(customer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      await CustomerModel.remove(req.params.id);
      res.json({ message: "Customer deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

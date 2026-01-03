import { PaymentModel } from "../../models/stock/payment.model.js";

export const PaymentController = {
  // ===== SUPPLIER PAYMENTS =====
  async createSupplierPayment(req, res) {
    try {
      console.log("📥 [CREATE] Request body:", req.body);
      const payment = await PaymentModel.createSupplierPayment(req.body);
      res.status(201).json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAllSupplierPayments(req, res) {
    try {
      const payments = await PaymentModel.findAllSupplierPayments();
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getSupplierPaymentById(req, res) {
    try {
      const payment = await PaymentModel.findSupplierPaymentById(req.params.id);
      if (!payment) return res.status(404).json({ message: "Payment not found" });
      res.json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateSupplierPayment(req, res) {
    try {
      const payment = await PaymentModel.updateSupplierPayment(req.params.id, req.body);
      res.json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async removeSupplierPayment(req, res) {
    try {
      await PaymentModel.removeSupplierPayment(req.params.id);
      res.json({ message: "Supplier payment deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getPaymentsBySupplier(req, res) {
    try {
      const payments = await PaymentModel.findBySupplier(req.params.supplierId);
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ===== CUSTOMER PAYMENTS =====
  async createCustomerPayment(req, res) {
    try {
      const payment = await PaymentModel.createCustomerPayment(req.body);
      res.status(201).json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getAllCustomerPayments(req, res) {
    try {
      const payments = await PaymentModel.findAllCustomerPayments();
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getCustomerPaymentById(req, res) {
    try {
      const payment = await PaymentModel.findCustomerPaymentById(req.params.id);
      if (!payment) return res.status(404).json({ message: "Payment not found" });
      res.json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateCustomerPayment(req, res) {
    try {
      const payment = await PaymentModel.updateCustomerPayment(req.params.id, req.body);
      res.json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async removeCustomerPayment(req, res) {
    try {
      await PaymentModel.removeCustomerPayment(req.params.id);
      res.json({ message: "Customer payment deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getPaymentsByCustomer(req, res) {
    try {
      const payments = await PaymentModel.findByCustomer(req.params.customerId);
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

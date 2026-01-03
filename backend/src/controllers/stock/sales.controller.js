import { SalesModel } from "../../models/stock/sales.model.js";
import { ProductModel } from "../../models/stock/product.model.js";
import { ProductSettingModel } from "../../models/stock/productSetting.model.js";

export const SalesController = {
 async create(req, res) {
  try {
    let saleData = req.body;

    // Ensure items is always an array
    if (!Array.isArray(saleData.items)) saleData.items = [];

    // If cart items exist, calculate totals
    if (saleData.items.length > 0) {
      // Map and calculate each item's total
      saleData.items = saleData.items.map((item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const discount = Number(item.discount) || 0;
        const tax = Number(item.tax) || 0;

        const subtotal = quantity * unitPrice;
        const discountAmount = discount > 1 ? discount : subtotal * (discount / 100);
        const taxAmount = tax > 1 ? tax : (subtotal - discountAmount) * (tax / 100);
        const totalPrice = subtotal - discountAmount + taxAmount;

        return {
          productId: item.productId || '',
          productName: item.productName || 'N/A', // ensure productName exists
          description: item.description || '',
          unit: item.unit || 'Kg',
          quantity,
          unitPrice,
          discount,
          tax,
          totalPrice,
        };
      });

      // Total sale price
      saleData.totalPrice = saleData.items.reduce((acc, i) => acc + i.totalPrice, 0);
    } else {
      // Fallback for single-item sale (old behavior)
      const quantity = Number(saleData.quantity) || 0;
      const unitPrice = Number(saleData.unitPrice) || 0;
      const discount = Number(saleData.discount) || 0;
      const tax = Number(saleData.tax) || 0;

      const subtotal = quantity * unitPrice;
      const discountAmount = discount > 1 ? discount : subtotal * (discount / 100);
      const taxAmount = tax > 1 ? tax : (subtotal - discountAmount) * (tax / 100);
      const totalPrice = subtotal - discountAmount + taxAmount;

      saleData.totalPrice = totalPrice;
      saleData.items = [
        {
          productId: saleData.productId || '',
          productName: saleData.productName || 'N/A',
          description: saleData.description || '',
          unit: saleData.unit || 'Kg',
          quantity,
          unitPrice,
          discount,
          tax,
          totalPrice,
        },
      ];
    }

    // Save sale
    const sale = await SalesModel.create({
      ...saleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Return full sale object with populated items
    res.status(201).json({ message: "Sale created successfully", sale });
  } catch (err) {
    console.error("Error creating sale:", err);
    res.status(500).json({ error: err.message });
  }
},


  // GET ALL SALES
  async getAll(req, res) {
    try {
      const sales = await SalesModel.findAll();
      res.json(sales);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET SALE BY ID
  async getById(req, res) {
    try {
      const sale = await SalesModel.findById(req.params.id);
      if (!sale) return res.status(404).json({ message: "Sale not found" });
      res.json(sale);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // UPDATE SALE
  async update(req, res) {
    try {
      const existingSale = await SalesModel.findById(req.params.id);
      if (!existingSale) return res.status(404).json({ message: "Sale not found" });

      const { productId, quantity, unitPrice, discount = 0, tax = 0 } = req.body;

      // Recalculate totals
      const subtotal = Number(quantity) * Number(unitPrice);
      const discountAmount = discount > 1 ? discount : subtotal * (discount / 100);
      const taxAmount = tax > 1 ? tax : subtotal * (tax / 100);
      const totalPrice = subtotal - discountAmount + taxAmount;

      const updatedSale = await SalesModel.update(req.params.id, {
        ...req.body,
        totalPrice,
        updatedAt: new Date().toISOString(),
      });

      // ✅ Find product in either model
      let product = await ProductModel.findById(productId);
      if (!product) {
        product = await ProductSettingModel.getById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });
      }

      // ✅ Adjust stock only if product in ProductModel
      const qtyDiff = Number(existingSale.quantity) - Number(quantity);
      if (await ProductModel.findById(productId)) {
        await ProductModel.update(productId, { quantity: Number(product.quantity) + qtyDiff });
      }

      res.json({ message: "Sale updated and stock adjusted", sale: updatedSale });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // DELETE SALE
  async remove(req, res) {
    try {
      const sale = await SalesModel.findById(req.params.id);
      if (!sale) return res.status(404).json({ message: "Sale not found" });

      await SalesModel.remove(req.params.id);
      res.json({ message: "Sale deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

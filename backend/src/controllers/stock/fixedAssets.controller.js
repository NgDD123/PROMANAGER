import { FixedAssetModel } from "../../models/stock/fixedAssets.model.js";
import JournalModel from "../../models/stock/journal.model.js";
import { AccountModel } from "../../models/stock/accounts.model.js";
import admin from "firebase-admin";

export const FixedAssetController = {
  // -------------------------------
  // Create new fixed asset + linked journal
  // -------------------------------
  async create(req, res) {
    try {
      const {
        assetName,
        date,
        acquisitionDate,
        purchaseDate,
        cost,
        usefulLife,
        purchaseAccountId,
        paymentAccountId,
        currency,
      } = req.body;

      const assetDate = date || acquisitionDate || purchaseDate || new Date().toISOString();

      if (!assetName || !assetDate || !cost || !purchaseAccountId || !paymentAccountId) {
        return res.status(400).json({ success: false, error: "Missing required fields." });
      }

      const numericCost = Number(cost);
      if (Number.isNaN(numericCost) || numericCost <= 0) {
        return res.status(400).json({ success: false, error: "Invalid cost value." });
      }

      const accounts = await AccountModel.findAll();
      const purchaseAcc = accounts.find((a) => a.id === purchaseAccountId);
      const paymentAcc = accounts.find((a) => a.id === paymentAccountId);

      if (!purchaseAcc || !paymentAcc) {
        return res.status(400).json({ success: false, error: "Invalid account selection." });
      }

      const lines = [
        {
          accountId: purchaseAccountId,
          accountName: purchaseAcc.name,
          type: "debit",
          amount: numericCost,
        },
        {
          accountId: paymentAccountId,
          accountName: paymentAcc.name,
          type: "credit",
          amount: numericCost,
        },
      ];

      const totalDebit = lines.reduce((s, l) => s + (l.type === "debit" ? Number(l.amount) : 0), 0);
      const totalCredit = lines.reduce((s, l) => s + (l.type === "credit" ? Number(l.amount) : 0), 0);
      if (Math.round(totalDebit * 100) !== Math.round(totalCredit * 100)) {
        return res.status(400).json({ success: false, error: "Unbalanced entry (debit ≠ credit)." });
      }

      const assetPayload = {
        assetName,
        date: assetDate,
        acquisitionDate: assetDate,
        cost: numericCost,
        usefulLife: Number(usefulLife) || 5,
        accumulatedDepreciation: 0,
        lastDepreciationDate: null,
        purchaseAccountId,
        purchaseAccountName: purchaseAcc.name,
        paymentAccountId,
        paymentAccountName: paymentAcc.name,
        currency: currency || "RWF",
        depreciationStartDate: assetDate,
      };

      const createdAsset = await FixedAssetModel.create(assetPayload);

      await JournalModel.create({
        date: assetDate,
        description: `Fixed asset purchase: ${assetName}`,
        lines,
        reference: createdAsset.id || null,
        source: { type: "fixedAsset", id: createdAsset.id || null },
      });

      return res.status(201).json({
        success: true,
        message: "Fixed asset recorded successfully",
        data: { asset: createdAsset },
      });
    } catch (err) {
      console.error("FixedAsset create error:", err);
      return res.status(500).json({ success: false, error: err.message || String(err) });
    }
  },

  // -------------------------------
  // Get all fixed assets (normalized)
  // -------------------------------
  async getAll(req, res) {
    try {
      const rawAssets = await FixedAssetModel.findAll();

      const assets = rawAssets.map((a) => ({
        id: a.id || a._id || "",
        assetName: a.assetName || "-",
        cost: Number(a.cost) || 0,
        usefulLife: Number(a.usefulLife) || 5,
        acquisitionDate: a.acquisitionDate || a.date || a.purchaseDate || new Date().toISOString(),
        purchaseAccountId: a.purchaseAccountId || "",
        purchaseAccountName: a.purchaseAccountName || "-",
        paymentAccountId: a.paymentAccountId || "",
        paymentAccountName: a.paymentAccountName || "-",
        accumulatedDepreciation: Number(a.accumulatedDepreciation) || 0,
        currency: a.currency || "RWF",
        depreciationStartDate: a.depreciationStartDate || a.acquisitionDate || null,
        createdAt: a.createdAt || new Date().toISOString(),
        updatedAt: a.updatedAt || new Date().toISOString(),
      }));

      return res.json({ success: true, data: { assets } });
    } catch (err) {
      console.error("FixedAsset getAll error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // -------------------------------
  // Delete asset + related journals
  // -------------------------------
  async remove(req, res) {
    try {
      const { id } = req.params;
      const asset = await FixedAssetModel.findById(id);
      if (!asset) return res.status(404).json({ success: false, error: "Asset not found" });

      await FixedAssetModel.remove(id);
      await JournalModel.removeBySource("fixedAsset", id);

      return res.json({ success: true, message: "Fixed asset deleted successfully" });
    } catch (err) {
      console.error("FixedAsset remove error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // -------------------------------
  // Post monthly depreciation
  // -------------------------------
  async postMonthlyDepreciation(req, res) {
    try {
      const assets = await FixedAssetModel.findAll();
      const accounts = await AccountModel.findAll();

      const depreciationExpenseAcc = accounts.find((a) =>
        a.name.toLowerCase().includes("depreciation expense")
      );
      const accumulatedDepAcc = accounts.find((a) =>
        a.name.toLowerCase().includes("accumulated depreciation")
      );

      if (!depreciationExpenseAcc || !accumulatedDepAcc) {
        return res.status(400).json({
          success: false,
          error:
            "Depreciation accounts not configured (need 'Depreciation Expense' and 'Accumulated Depreciation').",
        });
      }

      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const postedEntries = [];

      for (const asset of assets) {
        const months = (Number(asset.usefulLife) || 5) * 12;
        const monthlyDep = months > 0 ? Number(asset.cost) / months : 0;
        if (monthlyDep <= 0) continue;

        const existingEntries = await JournalModel.findBySource("fixedAsset", asset.id);
        const alreadyPosted = existingEntries?.some((e) => e.reference === monthKey);
        if (alreadyPosted) continue;

        const journalEntry = await JournalModel.create({
          date: admin.firestore.Timestamp.now(),
          description: `Monthly depreciation - ${asset.assetName} (${monthKey})`,
          lines: [
            {
              accountId: depreciationExpenseAcc.id,
              accountName: depreciationExpenseAcc.name,
              type: "debit",
              amount: monthlyDep,
            },
            {
              accountId: accumulatedDepAcc.id,
              accountName: accumulatedDepAcc.name,
              type: "credit",
              amount: monthlyDep,
            },
          ],
          reference: monthKey,
          source: { type: "fixedAsset", id: asset.id },
        });

        await FixedAssetModel.update(asset.id, {
          accumulatedDepreciation: (Number(asset.accumulatedDepreciation) || 0) + monthlyDep,
          lastDepreciationDate: admin.firestore.Timestamp.now(),
        });

        postedEntries.push({ assetId: asset.id, monthlyDep, journalEntryId: journalEntry?.id || null });
      }

      return res.json({
        success: true,
        message: `Depreciation posted for ${postedEntries.length} assets`,
        postedEntries,
      });
    } catch (err) {
      console.error("Depreciation posting error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  // -------------------------------
  // Depreciation summary report
  // -------------------------------
  async depreciationSummary(req, res) {
    try {
      const assets = await FixedAssetModel.findAll();

      const report = assets.map((asset) => {
        const cost = Number(asset.cost || 0);
        const accumulated = Number(asset.accumulatedDepreciation || 0);
        const usefulLifeMonths = (Number(asset.usefulLife) || 5) * 12;
        const monthlyDep = usefulLifeMonths > 0 ? cost / usefulLifeMonths : 0;
        const netBookValue = cost - accumulated;

        const lastDep = asset.lastDepreciationDate
          ? new Date(asset.lastDepreciationDate.toDate ? asset.lastDepreciationDate.toDate() : asset.lastDepreciationDate)
          : new Date(asset.date?.toDate ? asset.date.toDate() : asset.date);

        const nextDepDate = new Date(lastDep);
        nextDepDate.setMonth(nextDepDate.getMonth() + 1);

        return {
          assetId: asset.id,
          assetName: asset.assetName,
          cost,
          accumulatedDepreciation: accumulated,
          netBookValue,
          monthlyDepreciation: monthlyDep,
          lastDepreciationDate: lastDep,
          nextDepreciationDate: nextDepDate,
        };
      });

      const totals = {
        totalCost: report.reduce((s, a) => s + a.cost, 0),
        totalAccumulatedDepreciation: report.reduce((s, a) => s + a.accumulatedDepreciation, 0),
        totalNetBookValue: report.reduce((s, a) => s + a.netBookValue, 0),
        totalMonthlyDepreciation: report.reduce((s, a) => s + a.monthlyDepreciation, 0),
      };

      return res.json({ success: true, data: { report, totals } });
    } catch (err) {
      console.error("Depreciation summary error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },
};

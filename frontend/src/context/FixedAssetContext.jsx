// ================================
// ✅ FixedAssetContext (Final Version)
// ================================
import React, { createContext, useContext, useState, useEffect } from "react";
import { stockService } from "../services/stock.service";

const FixedAssetContext = createContext();

export const FixedAssetProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------
  // 🔹 Normalize each asset record safely
  // -------------------------------
  const normalizeAsset = (a) => {
    if (!a) return null;
    return {
      id: a.id || a._id || "",
      assetName: a.assetName || "-",
      cost: Number(a.cost) || 0,
      usefulLife: Number(a.usefulLife) || 5,
      acquisitionDate:
        a.acquisitionDate ||
        a.date ||
        a.purchaseDate ||
        new Date().toISOString(),
      purchaseAccountId: a.purchaseAccountId || "",
      purchaseAccountName: a.purchaseAccountName || "-",
      paymentAccountId: a.paymentAccountId || "",
      paymentAccountName: a.paymentAccountName || "-",
      accumulatedDepreciation: Number(a.accumulatedDepreciation) || 0,
      currency: a.currency || "RWF",
      depreciationStartDate: a.depreciationStartDate || a.acquisitionDate || null,
      createdAt: a.createdAt || new Date().toISOString(),
      updatedAt: a.updatedAt || new Date().toISOString(),
    };
  };

  // ==========================
  // 🔄 Load all fixed assets
  // ==========================
  const loadAssets = async () => {
    setLoading(true);
    try {
      console.log("🔄 Loading fixed assets...");
      const res = await stockService.getAll("fixed-assets");

      const data = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];

      const normalized = data.map(normalizeAsset).filter(Boolean);
      setAssets(normalized);
      console.log("✅ Fixed assets loaded:", normalized);
    } catch (err) {
      console.error("❌ Error loading fixed assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  // -------------------------------
  // ➕ Add a new Fixed Asset
  // -------------------------------
  const addAsset = async (asset) => {
    try {
      console.log("💾 Submitting fixed asset payload:", asset);

      // Ensure no undefined Firestore values
      const payload = {
        assetName: asset.assetName || "-",
        date: asset.acquisitionDate || new Date().toISOString(),
        cost: Number(asset.cost) || 0,
        usefulLife: Number(asset.usefulLife) || 5,
        purchaseAccountId: asset.purchaseAccountId || asset.accountId || "",
        paymentAccountId: asset.paymentAccountId || "",
        currency: asset.currency || "RWF",
        depreciationStartDate:
          asset.depreciationStartDate ||
          asset.acquisitionDate ||
          new Date().toISOString(),
      };

      const res = await stockService.add("fixed-assets", payload);

      // Handle both Axios and direct returns
      const saved = res?.data?.asset || res?.asset || res || null;

      if (saved) {
        const newAsset = normalizeAsset(saved);
        setAssets((prev) => [newAsset, ...prev]); // ✅ prepend for instant UI update
        console.log("✅ Fixed asset added successfully:", newAsset);
      } else {
        console.warn("⚠️ No asset data returned from backend. Reloading...");
        await loadAssets(); // fallback: reload full list
      }

      return saved;
    } catch (err) {
      console.error("❌ Failed to add fixed asset:", err.response?.data || err);
      throw err;
    }
  };

  // ==========================
  // 🗑 Remove Fixed Asset
  // ==========================
  const removeAsset = async (id) => {
    if (!id) return;
    try {
      await stockService.remove("fixed-assets", id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      console.log("✅ Fixed asset removed successfully");
    } catch (err) {
      console.error("❌ Error removing fixed asset:", err);
    }
  };

  // ==========================
  // 📅 Post Monthly Depreciation
  // ==========================
  const postMonthlyDepreciation = async () => {
    try {
      await stockService.add("fixed-assets-depreciation", {});
      await loadAssets();
    } catch (err) {
      console.error("❌ Failed to post monthly depreciation:", err);
      throw err;
    }
  };

  return (
    <FixedAssetContext.Provider
      value={{
        assets,
        loading,
        addAsset,
        removeAsset,
        refreshAssets: loadAssets,
        postMonthlyDepreciation,
      }}
    >
      {children}
    </FixedAssetContext.Provider>
  );
};

export const useFixedAssets = () => useContext(FixedAssetContext);

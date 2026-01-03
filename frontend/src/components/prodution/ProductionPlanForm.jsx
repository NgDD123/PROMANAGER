import React, { useState } from "react";

export default function ProductionPlanForm({
  onSubmit,
  finishedProducts = [],
  initialData,
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [productId, setProductId] = useState(initialData?.productId || "");
  const [quantity, setQuantity] = useState(initialData?.quantity || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !productId || !quantity)
      return alert("All fields are required");

    const product = finishedProducts.find((p) => p.id === productId);
    if (!product) return alert("Selected product is invalid");

    onSubmit({
  planName: name,
  finishedProductId: product.id,
  finishedProductName: product.name,
  plannedQty: quantity,
  status: "planned",
  storeCategory: product.storeCategory,
  productCategory: product.productCategory,
  unit: product.unit,
});

  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 p-4 rounded shadow mb-4 border"
    >
      <div className="mb-2">
        <label className="block text-gray-700">Plan Name</label>
        <input
          type="text"
          className="border p-2 w-full rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-2">
        <label className="block text-gray-700">Finished Product</label>
        <select
          className="border p-2 w-full rounded"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        >
          <option value="">Select Finished Product</option>
          {finishedProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.unit}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label className="block text-gray-700">Quantity</label>
        <input
          type="number"
          className="border p-2 w-full rounded"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Save Plan
      </button>
    </form>
  );
}

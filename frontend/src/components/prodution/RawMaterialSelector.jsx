import React, { useEffect, useState } from 'react';
import { useStock } from '../../context/stockContext';
import { useProduction } from '../../context/ProductionContext';

export default function AttachRawMaterials({ plan, onClose }) {
  const { purchases } = useStock(); // ✅ use purchases
  const { startCycle } = useProduction();

  const [rawMaterials, setRawMaterials] = useState([]);
  const [selected, setSelected] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(false);

  // -------------------------
  // Extract raw materials from purchases
  // -------------------------
  useEffect(() => {
    if (!Array.isArray(purchases) || purchases.length === 0) return;

    const raws = purchases
      .filter((item) => {
        const category = (
          item.storeCategory ||
          item.category ||
          ''
        ).toLowerCase();
        return category.includes('raw') || category.includes('material');
      })
      .map((item, index) => {
        const qty = Number(item.quantity || 0);
        const price = Number(item.unitPrice || item.buyingPrice || 0);
        const name = item.productName || item.name || '-';
        const storeCategory =
          item.storeCategory?.name ||
          item.storeCategory ||
          item.category?.name ||
          item.categoryName ||
          item.category ||
          '-';

        return {
          id: item.id || index,
          productId: item.id || index, // ✅ match ProductionContext
          name,
          category: storeCategory,
          available: qty,
          unit: item.unit || '-',
          costPerUnit: price,
          totalValue: (qty * price).toFixed(2),
        };
      });

    setRawMaterials(raws);
  }, [purchases]);

  // -------------------------
  // Handle selection toggle
  // -------------------------
  const toggleSelect = (material) => {
    setSelected((prev) =>
      prev.some((s) => s.id === material.id)
        ? prev.filter((s) => s.id !== material.id)
        : [...prev, material]
    );
  };

  // -------------------------
  // Handle quantity change
  // -------------------------
  const handleQuantityChange = (id, value) => {
    setQuantities((prev) => ({ ...prev, [id]: Number(value) }));
  };

  // -------------------------
  // Compute total cost
  // -------------------------
  const totalCost = selected.reduce((sum, item) => {
    const qty = quantities[item.id] || 0;
    return sum + qty * item.costPerUnit;
  }, 0);

  // -------------------------
  // Attach materials and start production cycle
  // -------------------------
  const handleAttachAndStart = async () => {
    if (selected.length === 0) return alert('⚠️ No materials selected!');
    setLoading(true);

    try {
      const materialsUsed = selected.map((m) => ({
        productId: m.productId, // ✅ match ProductionContext expectation
        productName: m.name,
        quantity: quantities[m.id] || 0,
        costPerUnit: m.costPerUnit,
        totalCost: (quantities[m.id] || 0) * m.costPerUnit,
      }));

      await startCycle({
        planId: plan.id,
        rawMaterials: materialsUsed, // ✅ must be array
      });

      alert('✅ Raw materials attached and cycle started!');
      onClose();
    } catch (err) {
      console.error('❌ Failed to attach raw materials:', err);
      alert('❌ Failed to start cycle. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50'>
      <div className='bg-white w-full max-w-4xl p-6 rounded-lg relative'>
        <button
          className='absolute top-2 right-2 text-gray-500'
          onClick={onClose}
          disabled={loading}
        >
          ✖
        </button>

        <h2 className='text-xl font-semibold mb-4'>
          Attach Raw Materials — {plan?.planName || plan?.id}
        </h2>

        {/* Debug Info */}
        <div className='bg-yellow-50 border border-yellow-200 text-yellow-700 p-2 mb-4 rounded text-sm'>
          <p>Raw materials found: {rawMaterials?.length || 0}</p>
        </div>

        {rawMaterials.length === 0 ? (
          <div className='text-center text-gray-500 py-6'>
            ⚠️ No raw materials found in purchases.
            <p className='text-sm mt-2'>
              Check your <strong>storeCategory</strong> or{' '}
              <strong>category</strong> field for names like{' '}
              <code>"Raw Materials"</code>.
            </p>
          </div>
        ) : (
          <table className='w-full border-collapse text-sm'>
            <thead className='bg-gray-100'>
              <tr>
                <th className='border p-2'>Material</th>
                <th className='border p-2'>Category</th>
                <th className='border p-2'>Available</th>
                <th className='border p-2'>Quantity</th>
                <th className='border p-2'>Cost/Unit</th>
                <th className='border p-2'>Total</th>
                <th className='border p-2'>Action</th>
              </tr>
            </thead>
            <tbody>
              {rawMaterials.map((m) => (
                <tr key={m.id} className='hover:bg-gray-50'>
                  <td className='border p-2'>{m.name}</td>
                  <td className='border p-2'>{m.category}</td>
                  <td className='border p-2 text-right'>{m.available}</td>
                  <td className='border p-2'>
                    <input
                      type='number'
                      min='0'
                      max={m.available}
                      className='border w-24 p-1 rounded'
                      value={quantities[m.id] || ''}
                      onChange={(e) =>
                        handleQuantityChange(m.id, e.target.value)
                      }
                    />
                  </td>
                  <td className='border p-2 text-right'>
                    {m.costPerUnit.toFixed(2)}
                  </td>
                  <td className='border p-2 text-right'>
                    {((quantities[m.id] || 0) * m.costPerUnit).toFixed(2)}
                  </td>
                  <td className='border p-2 text-center'>
                    <input
                      type='checkbox'
                      checked={selected.some((s) => s.id === m.id)}
                      onChange={() => toggleSelect(m)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer */}
        <div className='flex justify-between items-center mt-4'>
          <div>
            <p className='text-sm'>
              Total Materials Selected: <strong>{selected.length}</strong>
            </p>
            <p className='text-sm'>
              Total Cost: <strong>{totalCost.toFixed(2)} RWF</strong>
            </p>
          </div>
          <div className='flex gap-3'>
            <button
              className='px-4 py-2 bg-gray-400 text-white rounded'
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleAttachAndStart}
              className='px-4 py-2 bg-blue-600 text-white rounded'
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Attach & Start Cycle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

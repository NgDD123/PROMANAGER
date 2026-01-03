import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { productionService } from '../services/productionService';
import { useStock } from './stockContext';

const ProductionContext = createContext();

export const ProductionProvider = ({ children }) => {
  const { products, addItem, updateItem, getProductStock, createJournalEntry } =
    useStock();

  const [plans, setPlans] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch production data on mount
  useEffect(() => {
    const loadProductionData = async () => {
      setLoading(true);
      try {
        const [plansRes, cyclesRes] = await Promise.all([
          productionService.getAllPlans(),
          productionService.getAllCycles(),
        ]);

        const formattedPlans = (plansRes?.data?.plans || []).map((p) => ({
          id: p.id,
          planName: p.planCode || p.planName || `Plan-${p.id}`,
          productName: p.finishedProductName || 'Unnamed Product',
          quantity: p.plannedQty || 0,
          status: p.status || 'draft',
          startDate: p.plannedStartDate,
          endDate: p.plannedEndDate,
        }));
        setPlans(formattedPlans);

        const formattedCycles = (cyclesRes?.data?.cycles || []).map((c) => {
          const plan = formattedPlans.find((p) => p.id === c.planId);
          const cost = c.costSummary || {};
          return {
            id: c.id,
            name: plan?.planName || `Cycle-${c.id}`,
            planId: c.planId,
            productId: c.productId,
            productName: plan?.productName || c.productName || 'Unknown',
            quantityPlanned: plan?.quantity || c.quantityPlanned || 0,
            quantityCompleted: c.producedQty || 0,
            status: c.status || 'in_progress',
            laborCost: cost.laborCost || 0,
            overheadCost: cost.overheadCost || 0,
            materialCost: cost.materialCost || 0,
            totalCost: cost.totalCost || 0,
            rawMaterials: c.consumedMaterials || [],
            createdAt: c.createdAt || new Date().toISOString(),
          };
        });
        setCycles(formattedCycles);
      } catch (err) {
        console.error('❌ Error loading production data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProductionData();
  }, []);

  // ======================
  // Computed cycle categories
  // ======================
  const wipCycles = useMemo(
    () => cycles.filter((c) => c.status === 'in_progress'),
    [cycles]
  );
  const finishedGoods = useMemo(
    () => cycles.filter((c) => c.status === 'completed'),
    [cycles]
  );
  const damagedProducts = useMemo(
    () => cycles.filter((c) => c.status === 'damaged'),
    [cycles]
  );

  // ======================
  // PLAN OPERATIONS
  // ======================
  const createPlan = async (data) => {
    try {
      const planRes = await productionService.createPlan(data);
      const newPlan = planRes?.data?.plan || planRes;
      setPlans((prev) => [...prev, newPlan]);
      return newPlan;
    } catch (err) {
      console.error('❌ Error creating plan:', err);
      throw err;
    }
  };

  const updatePlan = async (id, data) => {
    if (!id) throw new Error('Plan ID is required');
    try {
      const res = await productionService.updatePlan(id, data);
      const updated = res?.data?.plan || res;
      setPlans((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err) {
      console.error('❌ Error updating plan:', err);
      throw err;
    }
  };

  const deletePlan = async (id) => {
    if (!id) throw new Error('Plan ID required');
    try {
      await productionService.removePlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('❌ Error deleting plan:', err);
      throw err;
    }
  };

  const approvePlan = async (plan) => {
    if (!plan?.id) throw new Error('Plan ID required');
    try {
      await productionService.updatePlan(plan.id, { status: 'approved' });
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, status: 'approved' } : p))
      );
    } catch (err) {
      console.error('❌ Error approving plan:', err);
      throw err;
    }
  };

  // ======================
  // CYCLE OPERATIONS
  // ======================
  const startCycle = async ({ planId, rawMaterials }) => {
    if (!planId) throw new Error('Plan ID required to start cycle');
    const plan = plans.find((p) => p.id === planId);
    if (!plan) throw new Error('Invalid plan ID');

    try {
      for (let item of rawMaterials) {
        const available = getProductStock(item.productId) || 0;
        const needed = item.quantity || 0;
        if (available <= 0) console.warn(`⚠️ No stock for ${item.productName}`);
        const consumeQty = Math.min(available, needed);
        await addItem('dispense', {
          ...item,
          quantity: consumeQty,
          description: `Consumed in cycle for plan ${plan.planName}`,
        });
      }

      const cycleRes = await productionService.startCycle({
        planId,
        consumedMaterials: rawMaterials,
      });
      const created = cycleRes?.data?.cycle || cycleRes;

      const newCycle = {
        ...created,
        rawMaterials,
        id: created.id,
        planId,
        productId: created.productId,
        name: plan.planName,
        productName: plan.productName,
        quantityPlanned: plan.quantity,
        quantityCompleted: 0,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
      };

      setCycles((prev) => [...prev, newCycle]);
      setPlans((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, status: 'in_progress' } : p))
      );

      return newCycle;
    } catch (err) {
      console.error('❌ Error starting cycle:', err);
      throw err;
    }
  };

  const completeCycle = async ({
    cycleId,
    producedQty,
    laborCost = 0,
    overheadCost = 0,
  }) => {
    if (!cycleId || producedQty == null)
      throw new Error('cycleId and producedQty are required');
    const existingCycle = cycles.find((c) => c.id === cycleId);
    if (!existingCycle) throw new Error('Cycle not found');

    try {
      const res = await productionService.completeCycle({
        cycleId,
        producedQty,
        laborCost,
        overheadCost,
        consumedMaterials: existingCycle.rawMaterials || [],
      });

      const updated = res?.data?.cycle || res?.data || res || {};
      const cost = updated.costSummary || {};

      const completedCycle = {
        ...existingCycle,
        ...updated,
        laborCost: Number(cost.laborCost ?? laborCost),
        overheadCost: Number(cost.overheadCost ?? overheadCost),
        materialCost: Number(cost.materialCost ?? 0),
        totalCost: Number(cost.totalCost ?? 0),
        quantityCompleted: Number(updated.producedQty ?? producedQty),
        status: 'completed',
        rawMaterials: existingCycle.rawMaterials,
        updatedAt: new Date().toISOString(),
      };

      setCycles((prev) =>
        prev.map((c) => (c.id === cycleId ? completedCycle : c))
      );

      await addItem('receive', {
        productId: completedCycle.productId,
        productName: completedCycle.productName,
        quantity: completedCycle.quantityCompleted,
        description: `Finished goods from cycle ${cycleId}`,
      });

      await createJournalEntry({
        description: `Production completion - ${completedCycle.productName}`,
        debit: 'Finished Goods Inventory',
        credit: 'Work In Progress',
        amount: completedCycle.totalCost,
        meta: {
          cycleId,
          producedQty: completedCycle.quantityCompleted,
          laborCost: completedCycle.laborCost,
          overheadCost: completedCycle.overheadCost,
          materialCost: completedCycle.materialCost,
          rawMaterials: completedCycle.rawMaterials,
        },
      });

      console.log('✅ Cycle completed successfully:', completedCycle);
      return completedCycle;
    } catch (err) {
      console.error('❌ Error completing cycle:', err);
      if (
        err?.response?.status === 200 ||
        err?.message?.includes('already completed')
      ) {
        console.warn('⚠️ Cycle was already completed successfully.');
        return cycles.find((c) => c.id === cycleId);
      }
      throw err;
    }
  };

  // ======================
  // QUALITY INSPECTIONS
  // ======================
  const createInspection = async (data) => {
    try {
      const res = await productionService.createInspection(data);
      const newInspection = res?.data?.inspection || res;
      setInspections((prev) => [...prev, newInspection]);
      return newInspection;
    } catch (err) {
      console.error('❌ Error creating inspection:', err);
      throw err;
    }
  };

  const getInspectionsByCycle = async (cycleId) => {
    if (!cycleId) throw new Error('Cycle ID required');
    try {
      const res = await productionService.getInspectionsByCycle(cycleId);
      const list = res?.data?.inspections || res;
      setInspections(list);
      return list;
    } catch (err) {
      console.error('❌ Error fetching inspections:', err);
      throw err;
    }
  };

  return (
    <ProductionContext.Provider
      value={{
        plans,
        cycles,
        inspections,
        loading,
        wipCycles,
        finishedGoods,
        damagedProducts,
        createPlan,
        updatePlan,
        deletePlan,
        approvePlan,
        startCycle,
        completeCycle,
        createInspection,
        getInspectionsByCycle,
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
};

export const useProduction = () => useContext(ProductionContext);

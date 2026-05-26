import { Finance } from '../../models/ngo/finance.model.js';
import {
  createPayload,
  denyUnlessCanAccess,
  filterRecordsByOwner,
  listFilters,
  updatePayload,
} from '../../utils/ngoOwnership.js';

export const createFinance = async (req, res) => {
  try {
    const finance = await Finance.create(createPayload(req, req.body));
    res.status(201).json({ success: true, data: finance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllFinances = async (req, res) => {
  try {
    const { organizationId, type, projectId, status, startDate, endDate } = req.query;
    const filters = listFilters(req, { type, projectId, status, startDate, endDate });
    let finances = await Finance.getAll(organizationId, filters);
    finances = filterRecordsByOwner(req, finances);
    res.json({ success: true, data: finances });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFinance = async (req, res) => {
  try {
    const finance = await Finance.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, finance, 'Finance record')) return;
    res.json({ success: true, data: finance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateFinance = async (req, res) => {
  try {
    const existing = await Finance.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Finance record')) return;
    const finance = await Finance.update(req.params.id, updatePayload(req, existing, req.body));
    res.json({ success: true, data: finance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteFinance = async (req, res) => {
  try {
    const existing = await Finance.getById(req.params.id);
    if (denyUnlessCanAccess(req, res, existing, 'Finance record')) return;
    await Finance.delete(req.params.id);
    res.json({ success: true, message: 'Finance record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFinancialSummary = async (req, res) => {
  try {
    const organizationId = req.params.organizationId || req.organizationId;
    const { startDate, endDate } = req.query;
    const filters = listFilters(req, { startDate, endDate });
    let transactions = await Finance.getAll(organizationId, filters);
    transactions = filterRecordsByOwner(req, transactions);

    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    res.json({
      success: true,
      data: {
        totalIncome: income,
        totalExpenses: expenses,
        netBalance: income - expenses,
        transactionCount: transactions.length,
        period: { startDate, endDate },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFinancesByProject = async (req, res) => {
  try {
    let finances = await Finance.getByProject(req.params.projectId);
    finances = filterRecordsByOwner(req, finances);
    res.json({ success: true, data: finances });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

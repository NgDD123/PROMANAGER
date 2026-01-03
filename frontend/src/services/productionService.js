// services/productionService.js
import axios from "axios";

const PRODUCTION_API_URL = "http://localhost:5000/api/v1/production";

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const handleAxiosError = (err, context) => {
  console.error(`❌ Axios error in ${context}:`, {
    message: err.message,
    response: err.response?.data,
    request: err.request,
  });
  throw err;
};

export const productionService = {
  // ================================
  // Production Plans
  // ================================
  getAllPlans: async () => {
    try {
      const res = await axios.get(`${PRODUCTION_API_URL}/plans`, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "getAllPlans");
    }
  },

  getPlanById: async (id) => {
    if (!id) throw new Error("Plan ID is required for getPlanById");
    try {
      const res = await axios.get(`${PRODUCTION_API_URL}/plans/${id}`, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "getPlanById");
    }
  },

  createPlan: async (data) => {
    if (!data) throw new Error("Data is required for createPlan");
    try {
      const res = await axios.post(`${PRODUCTION_API_URL}/plans`, data, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "createPlan");
    }
  },

  updatePlan: async (id, data) => {
    if (!id) throw new Error("Plan ID is required for updatePlan");
    if (!data || Object.keys(data).length === 0)
      throw new Error("Data is required for updatePlan");

    try {
      console.log("Updating plan:", { id, data }); // debug log
      const res = await axios.put(`${PRODUCTION_API_URL}/plans/${id}`, data, getAuthHeader());
      console.log("Updated plan response:", res.data);
      return res.data;
    } catch (err) {
      handleAxiosError(err, "updatePlan");
    }
  },

  removePlan: async (id) => {
    if (!id) throw new Error("Plan ID is required for removePlan");
    try {
      const res = await axios.delete(`${PRODUCTION_API_URL}/plans/${id}`, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "removePlan");
    }
  },

  // ================================
  // Production Cycles
  // ================================
  getAllCycles: async () => {
    try {
      const res = await axios.get(`${PRODUCTION_API_URL}/cycles`, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "getAllCycles");
    }
  },

  getCycleById: async (id) => {
    if (!id) throw new Error("Cycle ID is required for getCycleById");
    try {
      const res = await axios.get(`${PRODUCTION_API_URL}/cycles/${id}`, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "getCycleById");
    }
  },

  startCycle: async (data) => {
    if (!data) throw new Error("Data is required for startCycle");
    try {
      const res = await axios.post(`${PRODUCTION_API_URL}/cycles/start`, data, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "startCycle");
    }
  },

  completeCycle: async (data) => {
    if (!data) throw new Error("Data is required for completeCycle");
    try {
      const res = await axios.post(`${PRODUCTION_API_URL}/cycles/complete`, data, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "completeCycle");
    }
  },

  updateCycle: async (id, data) => {
    if (!id) throw new Error("Cycle ID is required for updateCycle");
    try {
      const res = await axios.put(`${PRODUCTION_API_URL}/cycles/${id}`, data, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "updateCycle");
    }
  },

  removeCycle: async (id) => {
    if (!id) throw new Error("Cycle ID is required for removeCycle");
    try {
      const res = await axios.delete(`${PRODUCTION_API_URL}/cycles/${id}`, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "removeCycle");
    }
  },

  // ================================
  // Finished Goods
  // ================================
  getAllFinishedGoods: async () => {
    try {
      const res = await axios.get(`${PRODUCTION_API_URL}/finished-goods`, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "getAllFinishedGoods");
    }
  },

  getFinishedGoodById: async (id) => {
    if (!id) throw new Error("Finished Good ID is required for getFinishedGoodById");
    try {
      const res = await axios.get(`${PRODUCTION_API_URL}/finished-goods/${id}`, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "getFinishedGoodById");
    }
  },

  createFinishedGood: async (data) => {
    if (!data) throw new Error("Data is required for createFinishedGood");
    try {
      const res = await axios.post(`${PRODUCTION_API_URL}/finished-goods`, data, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "createFinishedGood");
    }
  },

  updateFinishedGood: async (id, data) => {
    if (!id) throw new Error("Finished Good ID is required for updateFinishedGood");
    try {
      const res = await axios.put(`${PRODUCTION_API_URL}/finished-goods/${id}`, data, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "updateFinishedGood");
    }
  },

  removeFinishedGood: async (id) => {
    if (!id) throw new Error("Finished Good ID is required for removeFinishedGood");
    try {
      const res = await axios.delete(`${PRODUCTION_API_URL}/finished-goods/${id}`, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "removeFinishedGood");
    }
  },

  // ================================
  // Raw Material Consumption
  // ================================
  getConsumptionByFinishedGood: async (fgId) => {
    if (!fgId) throw new Error("Finished Good ID is required for getConsumptionByFinishedGood");
    try {
      const res = await axios.get(`${PRODUCTION_API_URL}/consumption?finishedGoodId=${fgId}`, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "getConsumptionByFinishedGood");
    }
  },

  createConsumption: async (data) => {
    if (!data) throw new Error("Data is required for createConsumption");
    try {
      const res = await axios.post(`${PRODUCTION_API_URL}/consumption`, data, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "createConsumption");
    }
  },

  // ================================
  // Quality Inspections
  // ================================
  createInspection: async (data) => {
    if (!data) throw new Error("Data is required for createInspection");
    try {
      const res = await axios.post(`${PRODUCTION_API_URL}/inspections`, data, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "createInspection");
    }
  },

  getInspectionsByCycle: async (cycleId) => {
    if (!cycleId) throw new Error("Cycle ID is required for getInspectionsByCycle");
    try {
      const res = await axios.get(`${PRODUCTION_API_URL}/inspections?cycleId=${cycleId}`, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "getInspectionsByCycle");
    }
  },

  updateInspection: async (id, data) => {
    if (!id) throw new Error("Inspection ID is required for updateInspection");
    try {
      const res = await axios.put(`${PRODUCTION_API_URL}/inspections/${id}`, data, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "updateInspection");
    }
  },

  removeInspection: async (id) => {
    if (!id) throw new Error("Inspection ID is required for removeInspection");
    try {
      const res = await axios.delete(`${PRODUCTION_API_URL}/inspections/${id}`, getAuthHeader());
      return res.data;
    } catch (err) {
      handleAxiosError(err, "removeInspection");
    }
  },

  // ================================
  // Production Reports
  // ================================
  getProductionSummary: async (startDate = "", endDate = "") => {
    try {
      const res = await axios.get(
        `${PRODUCTION_API_URL}/reports/summary?start=${startDate}&end=${endDate}`,
        getAuthHeader()
      );
      return res.data;
    } catch (err) {
      handleAxiosError(err, "getProductionSummary");
    }
  },

  getMaterialConsumptionReport: async (startDate = "", endDate = "") => {
    try {
      const res = await axios.get(
        `${PRODUCTION_API_URL}/reports/material-consumption?start=${startDate}&end=${endDate}`,
        getAuthHeader()
      );
      return res.data;
    } catch (err) {
      handleAxiosError(err, "getMaterialConsumptionReport");
    }
  },
};

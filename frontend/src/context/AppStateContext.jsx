import React, { createContext, useContext, useReducer } from "react";

// ----------------------------
// ACTION TYPES
// ---------------------------- 
export const ACTIONS = {
  SET_PRESCRIPTIONS: "SET_PRESCRIPTIONS",
  SET_PHARMACIES: "SET_PHARMACIES",
  UPDATE_FORM: "UPDATE_FORM",
  RESET_FORM: "RESET_FORM",
  SET_PHARMACY_RX: "SET_PHARMACY_RX",

  // Call Center
  SET_ACTIVE_CALLS: "SET_ACTIVE_CALLS",
  SET_CURRENT_CALL: "SET_CURRENT_CALL",

  // Status
  SET_DOCTOR_STATUS: "SET_DOCTOR_STATUS",
  SET_PHARMACY_STATUS: "SET_PHARMACY_STATUS",
};

// ----------------------------
// INITIAL STATE
// ----------------------------
const initialState = {
  // Prescription form (Doctor page)
  prescriptionForm: {
    patientId: "",
    diagnosis: "",
    pharmacyId: "",
    items: [],
  },
  pharmacies: [],
  prescriptions: [],

  // Pharmacy dashboard
  pharmacyRx: {
    prescriptions: [],
    loadingIds: {},
    errorMsg: "",
  },

  // Call Center state
  callCenter: {
    activeCalls: [],
    currentCall: null,
  },

  // Status (for doctors & pharmacies availability)
  statuses: {
    doctors: [],
    pharmacies: [],
  },
};

// ----------------------------
// REDUCER
// ----------------------------
function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.UPDATE_FORM:
      return {
        ...state,
        prescriptionForm: { ...state.prescriptionForm, ...action.payload },
      };

    case ACTIONS.RESET_FORM:
      return { ...state, prescriptionForm: { ...initialState.prescriptionForm } };

    case ACTIONS.SET_PHARMACIES:
      return { ...state, pharmacies: action.payload };

    case ACTIONS.SET_PRESCRIPTIONS:
      return { ...state, prescriptions: action.payload };

    case ACTIONS.SET_PHARMACY_RX:
      return { ...state, pharmacyRx: { ...state.pharmacyRx, ...action.payload } };

    case ACTIONS.SET_ACTIVE_CALLS:
      return { ...state, callCenter: { ...state.callCenter, activeCalls: action.payload } };

    case ACTIONS.SET_CURRENT_CALL:
      return { ...state, callCenter: { ...state.callCenter, currentCall: action.payload } };

    case ACTIONS.SET_DOCTOR_STATUS:
      return { ...state, statuses: { ...state.statuses, doctors: action.payload } };

    case ACTIONS.SET_PHARMACY_STATUS:
      return { ...state, statuses: { ...state.statuses, pharmacies: action.payload } };

    default:
      return state;
  }
}

// ----------------------------
// CONTEXTS
// ----------------------------
const AppStateContext = createContext();
const AppDispatchContext = createContext();

// ----------------------------
// PROVIDER
// ----------------------------
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
};

// ----------------------------
// HOOKS
// ----------------------------
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used within AppProvider");
  return context;
};

export const useAppDispatch = () => {
  const context = useContext(AppDispatchContext);
  if (!context) throw new Error("useAppDispatch must be used within AppProvider");
  return context;
};

import { db } from "../../utils/firebase.js";
import { getOnlineUsers, setUserStatus } from "./status.model.js";

const coll = () => db().collection("call_sessions");

/**
 * Create a new call session
 */
export const createCallSession = async ({ patientId, patientPhone, type }) => {
  const availableProviders = await getOnlineUsers(type);
  const provider = availableProviders.length ? availableProviders[0] : null;

  const session = {
    patientId: patientId || null,
    patientPhone: patientPhone || null,
    providerId: provider?.userId || null,
    providerPhone: provider?.phone || null,
    assignedTo: provider?.userId || null,
    type: type || null,
    status: provider ? "WAITING" : "PENDING",
    createdAt: new Date(),
    transfers: [],
    providerLink: provider?.phone
      ? `https://wa.me/${provider.phone}?text=${encodeURIComponent("You have a new patient assigned.")}`
      : null,
    patientLink: patientPhone
      ? `https://wa.me/${patientPhone}?text=${encodeURIComponent("Your call is being connected.")}`
      : null,
  };

  const ref = await coll().add(session);
  return { id: ref.id, ...session };
};

/**
 * Update call session status
 */
export const updateCallStatus = async (id, status, providerId = null, assignedTo = null) => {
  const ref = coll().doc(id);
  const snapBefore = await ref.get();
  const beforeData = snapBefore.data();

  const updateData = {
    status,
    updatedAt: new Date(),
  };

  if (providerId) updateData.providerId = providerId;
  if (assignedTo) updateData.assignedTo = assignedTo;

  // Track transfer history
  if (status === "CONNECTED_BY_CALLCENTER" && assignedTo) {
    const transferLog = {
      from: providerId, // call center/admin
      to: assignedTo,
      timestamp: new Date(),
    };
    const prevTransfers = beforeData.transfers || [];
    updateData.transfers = [...prevTransfers, transferLog];
  }

  await ref.update(updateData);
  const snap = await ref.get();
  const callData = snap.data();

  // Provider availability
  if (status === "CONNECTED" && providerId) await setUserStatus(providerId, callData.type, false);
  if (status === "ENDED" && providerId) await setUserStatus(providerId, callData.type, true);

  return { id: snap.id, ...callData };
};

/**
 * List active calls
 */
export const listActiveCalls = async () => {
  const snap = await coll()
    .where("status", "in", ["WAITING", "CONNECTED", "PENDING", "CONNECTED_BY_CALLCENTER"])
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/**
 * Get online providers by type
 */
export const getOnlineProviders = async (type) => {
  const users = await getOnlineUsers(type); // role = DOCTOR / PHARMACY
  return users;
};

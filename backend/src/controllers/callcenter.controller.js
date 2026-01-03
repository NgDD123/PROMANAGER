import {
  createCallSession,
  updateCallStatus,
  listActiveCalls,
  getOnlineProviders,
} from "../models/callcenter.model.js";

/**
 * Patient / Doctor / Pharmacy requests a call
 */
export const requestCall = async (req, res) => {
  try {
    const { type, patientPhone } = req.body; // ✅ ensure phone comes in body
    console.log(`[Request Call] User ${req.user.id} (${req.user.role}) requested type ${type}`);

    const session = await createCallSession({
      patientId: req.user.id,
      patientPhone,
      type,
      patientPhone: req.user.phone || patientPhone || "2507xxxxxxx",

    });

    console.log(`[Request Call] Session created:`, session);
    res.status(201).json(session);
  } catch (err) {
    console.error("[Request Call] Error:", err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Get active calls
 */
export const getActiveCalls = async (req, res) => {
  try {
    console.log(`[Get Active Calls] User ${req.user.id} (${req.user.role}) fetching calls`);
    let calls = await listActiveCalls();

    // ✅ enrich with WhatsApp links
    calls = calls.map((c) => ({
      ...c,
      patientLink: c.patientPhone
        ? `https://wa.me/${c.patientPhone}?text=${encodeURIComponent("Your call is being connected.")}`
        : null,
      providerLink: c.providerPhone
        ? `https://wa.me/${c.providerPhone}?text=${encodeURIComponent("You have a new patient assigned.")}`
        : null,
    }));

    if (["DOCTOR", "PHARMACY"].includes(req.user.role)) {
      calls = calls.filter(
        (c) =>
          c.assignedTo === req.user.id ||
          c.providerId === req.user.id ||
          c.status === "CONNECTED_BY_CALLCENTER"
      );
    }

    console.log(`[Get Active Calls] Returning ${calls.length} calls`);
    res.json(calls);
  } catch (err) {
    console.error("[Get Active Calls] Error:", err);
    res.status(500).json({ error: err.message });
  }
};


/**
 * Call Center / Admin accepts & transfers a call
 */
export const acceptCallByCallCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignTo } = req.body;
    console.log(`[Accept Call] User ${req.user.id} assigning call ${id} to ${assignTo}`);

    const updated = await updateCallStatus(
      id,
      "CONNECTED_BY_CALLCENTER",
      req.user.id,
      assignTo || null
    );

    console.log(`[Accept Call] Updated call:`, updated);
    res.json(updated);
  } catch (err) {
    console.error("[Accept Call] Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Provider accepts a call
 */
export const acceptCall = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Provider Accept] User ${req.user.id} accepting call ${id}`);
    const updated = await updateCallStatus(id, "CONNECTED", req.user.id);
    console.log(`[Provider Accept] Call updated:`, updated);
    res.json(updated);
  } catch (err) {
    console.error("[Provider Accept] Error:", err);
    res.status(403).json({ error: err.message });
  }
};

/**
 * End a call
 */
export const endCall = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[End Call] User ${req.user.id} ending call ${id}`);
    const updated = await updateCallStatus(id, "ENDED", req.user.id);
    console.log(`[End Call] Call updated:`, updated);
    res.json(updated);
  } catch (err) {
    console.error("[End Call] Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get online providers
 */
export const getProvidersForCall = async (req, res) => {
  try {
    const { type } = req.query;
    console.log(`[Get Providers] Fetching online providers for type ${type}`);
    const providers = await getOnlineProviders(type);
    console.log(`[Get Providers] Found ${providers.length} providers`);
    res.json(providers);
  } catch (err) {
    console.error("[Get Providers] Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// models/audit.model.js
import { db } from "../../../utils/firebase.js";

const AUDIT = "auditLogs";
export const logAudit = async ({ actorId = null, action, meta = {} }) => {
  await db().collection(AUDIT).add({
    actorId,
    action,
    meta,
    createdAt: new Date(),
  });
};

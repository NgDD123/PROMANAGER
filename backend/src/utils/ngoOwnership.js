/** Shared creator-based access for NGO tenant resources. */

export function canAccessNgoRecord(req, record) {
  if (record?.organizationId && record.organizationId !== req.organizationId) return false;
  if (req.isNgoAdmin) return true;
  return record?.createdBy === req.ngoUserId;
}

export function filterRecordsByOwner(req, records = []) {
  if (req.isNgoAdmin) return records;
  return records.filter((record) => record.createdBy === req.ngoUserId);
}

export function listFilters(req, filters = {}) {
  if (req.isNgoAdmin) return filters;
  return { ...filters, createdBy: req.ngoUserId };
}

export function createPayload(req, body = {}) {
  return {
    ...body,
    organizationId: req.organizationId,
    createdBy: req.ngoUserId,
  };
}

export function updatePayload(req, existing, body = {}) {
  return {
    ...body,
    organizationId: req.organizationId,
    createdBy: existing?.createdBy || req.ngoUserId,
  };
}

export function denyUnlessCanAccess(req, res, record, label = 'Resource') {
  if (!record) {
    res.status(404).json({ success: false, error: `${label} not found` });
    return true;
  }
  if (!canAccessNgoRecord(req, record)) {
    res.status(403).json({ success: false, error: `Access denied for this ${label.toLowerCase()}` });
    return true;
  }
  return false;
}

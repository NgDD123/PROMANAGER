import { Branch } from '../models/ngo/branch.model.js';

/** Resolve branch label for church staff and church module users. */
export async function resolveChurchBranchContext(user, roleContext = {}) {
  let branchId = user?.branchId || roleContext.branchId || '';
  let branchName = user?.branchName || '';

  if (!branchName && branchId) {
    const branch = await Branch.getById(branchId);
    if (branch?.name) branchName = branch.name;
  }

  if (!branchName && user?.organizationId) {
    const branches = await Branch.getByOrganization(user.organizationId);
    if (branches.length === 1) {
      branchId = branches[0].id;
      branchName = branches[0].name || '';
    }
  }

  return { branchId, branchName };
}

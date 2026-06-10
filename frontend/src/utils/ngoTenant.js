import { getServiceUser, getServiceOrganization } from './authCookies.js';
import { getWorkspaceOrganization } from '../config/serviceContext.js';

/** Resolve the signed-in NGO tenant organization from session + optional API list. */
export function resolveNgoTenantOrganization(organizations = []) {
  const user = getServiceUser('ngo');
  const sessionOrganization = getWorkspaceOrganization('ngo', user) || getServiceOrganization('ngo');
  const tenantOrganizationId =
    user?.organizationId || sessionOrganization?.id || organizations[0]?.id || '';
  const tenantOrganizationName =
    sessionOrganization?.name ||
    organizations.find((org) => org.id === tenantOrganizationId)?.name ||
    'your organization';

  return { user, sessionOrganization, tenantOrganizationId, tenantOrganizationName };
}

/** Modal title/subtitle with tenant org name in the subtitle. */
export function ngoEntityModalCopy(entityLabel, mode, organizationName) {
  const orgLabel = organizationName || 'your organization';
  if (mode === 'add') {
    return {
      title: `Add New ${entityLabel}`,
      subtitle: `Create a new ${entityLabel.toLowerCase()} record ${orgLabel}`,
    };
  }
  if (mode === 'edit') {
    return {
      title: `Edit ${entityLabel}`,
      subtitle: `Update ${entityLabel.toLowerCase()} record ${orgLabel}`,
    };
  }
  if (mode === 'view') {
    return {
      title: `${entityLabel} Details`,
      subtitle: `View ${entityLabel.toLowerCase()} record ${orgLabel}`,
    };
  }
  return null;
}

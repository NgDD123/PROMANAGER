import { db } from '../../../utils/firebase.js';
import { FieldSite } from '../../models/ngo/fieldSite.model.js';
import { FieldVisit } from '../../models/ngo/fieldVisit.model.js';
import { buildOwnedResourceHandlers, filterRecordsByOwner } from './ngoOwnedResource.controller.js';

const siteHandlers = buildOwnedResourceHandlers(FieldSite, 'Field site');
const visitHandlers = buildOwnedResourceHandlers(FieldVisit, 'Field visit');

export const createFieldSite = siteHandlers.create;
export const getAllFieldSites = siteHandlers.getAll;
export const getFieldSite = siteHandlers.getById;
export const updateFieldSite = siteHandlers.update;
export const deleteFieldSite = siteHandlers.remove;

export const createFieldVisit = visitHandlers.create;
export const getAllFieldVisits = visitHandlers.getAll;
export const getFieldVisit = visitHandlers.getById;
export const updateFieldVisit = visitHandlers.update;
export const deleteFieldVisit = visitHandlers.remove;

export const getGpsLocations = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    let branchQuery = db().collection('ngo_branches').where('organizationId', '==', organizationId);
    let siteQuery = db().collection('ngo_field_sites').where('organizationId', '==', organizationId);

    const [branchesSnap, sitesSnap] = await Promise.all([branchQuery.get(), siteQuery.get()]);

    let branches = branchesSnap.docs.map((doc) => ({ id: doc.id, type: 'branch', ...doc.data() }));
    let sites = sitesSnap.docs.map((doc) => ({ id: doc.id, type: 'site', ...doc.data() }));

    branches = branches.filter((item) => item.gps?.trim());
    sites = sites.filter((item) => item.gps?.trim());

    if (!req.isNgoAdmin) {
      branches = filterRecordsByOwner(req, branches);
      sites = filterRecordsByOwner(req, sites);
    }

    res.json({ success: true, data: [...branches, ...sites] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

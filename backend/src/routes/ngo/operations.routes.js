import express from 'express';
import { db } from '../../../utils/firebase.js';
import { ngoProtected } from '../../middleware/ngoResource.middleware.js';
import {
  canAccessNgoRecord,
  filterRecordsByOwner,
} from '../../utils/ngoOwnership.js';

const router = express.Router();

router.use(...ngoProtected);

// Branches
router.get('/branches', async (req, res) => {
  try {
    const { organizationId, type } = req.query;
    let query = db().collection('ngo_branches');
    
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (type) query = query.where('type', '==', type);
    
    const snapshot = await query.get();
    const branches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: branches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/branches', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_branches').add({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Grants
router.get('/grants', async (req, res) => {
  try {
    const { organizationId, donor, compliance } = req.query;
    let query = db().collection('ngo_grants');
    
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (donor) query = query.where('donor', '==', donor);
    if (compliance) query = query.where('compliance', '==', compliance);
    
    const snapshot = await query.get();
    const grants = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: grants });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/grants', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_grants').add({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Donor Reports
router.get('/donor-reports', async (req, res) => {
  try {
    const { organizationId, donor, status } = req.query;
    let query = db().collection('ngo_donor_reports');
    
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    if (donor) query = query.where('donor', '==', donor);
    if (status) query = query.where('status', '==', status);
    
    const snapshot = await query.get();
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/donor-reports', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_donor_reports').add({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Beneficiaries
router.get('/beneficiaries', async (req, res) => {
  try {
    const { siteId, status } = req.query;
    let query = db().collection('ngo_beneficiaries');
    
    if (siteId) query = query.where('siteId', '==', siteId);
    if (status) query = query.where('status', '==', status);
    
    const snapshot = await query.get();
    const beneficiaries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, data: beneficiaries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Service Health
router.get('/service-health', async (req, res) => {
  try {
    const { organizationId } = req.query;
    
    const collections = [
      'ngo_branches',
      'ngo_field_sites',
      'ngo_field_visits',
      'ngo_grants',
      'ngo_donor_reports',
      'ngo_beneficiaries',
      'ngo_chart_of_accounts',
      'ngo_beneficial_owners',
      'ngo_projects',
      'ngo_tenders',
      'ngo_contracts',
      'ngo_storages',
      'ngo_impacts',
      'ngo_evaluations'
    ];
    
    const health = {};
    
    for (const collection of collections) {
      let query = db().collection(collection);
      if (organizationId) query = query.where('organizationId', '==', organizationId);
      
      const snapshot = await query.get();
      health[collection] = {
        count: snapshot.size,
        status: snapshot.size > 0 ? 'active' : 'empty'
      };
    }
    
    res.json({ success: true, data: health });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const professionalCollections = {
  'chart-of-accounts': 'ngo_chart_of_accounts',
  'bank-accounts': 'ngo_bank_accounts',
  payments: 'ngo_payments',
  'journal-entries': 'ngo_journal_entries',
  grants: 'ngo_grants',
  payroll: 'ngo_payroll_runs',
  'donor-reports': 'ngo_donor_reports',
  'income-transactions': 'ngo_income_transactions',
  'expense-transactions': 'ngo_expense_transactions',
  // contracts, storages, impacts, evaluations, beneficial-owners, projects, tenders:
  // served by dedicated authenticated routes (see server.js)
};

const createProfessionalRouter = (resource, collectionName) => {
  router.get(`/${resource}`, async (req, res) => {
    try {
      const { projectId, status } = req.query;
      let query = db().collection(collectionName);

      if (req.organizationId) query = query.where('organizationId', '==', req.organizationId);
      if (projectId) query = query.where('projectId', '==', projectId);
      if (status) query = query.where('status', '==', status);
      if (!req.isNgoAdmin) query = query.where('createdBy', '==', req.ngoUserId);

      const snapshot = await query.get();
      let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      data = filterRecordsByOwner(req, data);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post(`/${resource}`, async (req, res) => {
    try {
      const now = new Date();
      const payload = {
        ...req.body,
        organizationId: req.organizationId,
        createdBy: req.ngoUserId,
        createdAt: now,
        updatedAt: now,
      };
      const docRef = await db().collection(collectionName).add(payload);
      res.status(201).json({ success: true, data: { id: docRef.id, ...payload } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.put(`/${resource}/:id`, async (req, res) => {
    try {
      const docRef = db().collection(collectionName).doc(req.params.id);
      const existing = await docRef.get();
      if (!existing.exists) {
        return res.status(404).json({ success: false, error: 'Not found' });
      }
      const record = { id: existing.id, ...existing.data() };
      if (!canAccessNgoRecord(req, record)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      const payload = {
        ...req.body,
        organizationId: req.organizationId,
        createdBy: record.createdBy || req.ngoUserId,
        updatedAt: new Date(),
      };
      await docRef.set(payload, { merge: true });
      res.json({ success: true, data: { id: req.params.id, ...payload } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.delete(`/${resource}/:id`, async (req, res) => {
    try {
      const docRef = db().collection(collectionName).doc(req.params.id);
      const existing = await docRef.get();
      if (!existing.exists) {
        return res.status(404).json({ success: false, error: 'Not found' });
      }
      const record = { id: existing.id, ...existing.data() };
      if (!canAccessNgoRecord(req, record)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
      await docRef.delete();
      res.json({ success: true, data: { id: req.params.id } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  router.patch(`/${resource}/:id/approve`, async (req, res) => {
    try {
      const docRef = db().collection(collectionName).doc(req.params.id);
      const existing = await docRef.get();
      if (!existing.exists) {
        return res.status(404).json({ success: false, error: 'Not found' });
      }
      const record = { id: existing.id, ...existing.data() };
      if (!canAccessNgoRecord(req, record)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }

      const payload = {
        approvalStatus: req.body.approvalStatus || 'Approved',
        status: req.body.status,
        approvedBy: req.body.approvedBy || req.body.user || 'Finance Approver',
        approvedAt: new Date(),
        updatedAt: new Date(),
      };

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      await docRef.set(payload, { merge: true });
      res.json({ success: true, data: { id: req.params.id, ...payload } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
};

Object.entries(professionalCollections).forEach(([resource, collectionName]) => {
  createProfessionalRouter(resource, collectionName);
});

// Church Operations
router.get('/offerings', async (req, res) => {
  try {
    const { branchId } = req.query;
    let query = db().collection('ngo_offerings');
    if (branchId) query = query.where('branchId', '==', branchId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/offerings', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_offerings').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pastoral-visits', async (req, res) => {
  try {
    const { branchId } = req.query;
    let query = db().collection('ngo_pastoral_visits');
    if (branchId) query = query.where('branchId', '==', branchId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/pastoral-visits', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_pastoral_visits').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/attendance', async (req, res) => {
  try {
    const { branchId } = req.query;
    let query = db().collection('ngo_attendance');
    if (branchId) query = query.where('branchId', '==', branchId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/attendance', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_attendance').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/members', async (req, res) => {
  try {
    const { branchId } = req.query;
    let query = db().collection('ngo_members');
    if (branchId) query = query.where('branchId', '==', branchId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/members', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_members').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Programs & Projects
router.get('/programs', async (req, res) => {
  try {
    const { organizationId } = req.query;
    let query = db().collection('ngo_programs');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/programs', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_programs').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/donors', async (req, res) => {
  try {
    const { organizationId } = req.query;
    let query = db().collection('ngo_donors');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/donors', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_donors').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/volunteers', async (req, res) => {
  try {
    const { organizationId } = req.query;
    let query = db().collection('ngo_volunteers');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/volunteers', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_volunteers').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Distribution & Procurement
router.get('/distributions', async (req, res) => {
  try {
    const { organizationId } = req.query;
    let query = db().collection('ngo_distributions');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/distributions', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_distributions').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Communication
router.get('/announcements', async (req, res) => {
  try {
    const { organizationId } = req.query;
    let query = db().collection('ngo_announcements');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/announcements', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_announcements').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/sms', async (req, res) => {
  try {
    const { organizationId } = req.query;
    let query = db().collection('ngo_sms');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/sms', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_sms').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/whatsapp', async (req, res) => {
  try {
    const { organizationId } = req.query;
    let query = db().collection('ngo_whatsapp');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/whatsapp', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_whatsapp').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/email-campaigns', async (req, res) => {
  try {
    const { organizationId } = req.query;
    let query = db().collection('ngo_email_campaigns');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/email-campaigns', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_email_campaigns').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/notifications', async (req, res) => {
  try {
    const { organizationId } = req.query;
    let query = db().collection('ngo_notifications');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/notifications', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_notifications').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reports
router.get('/reports', async (req, res) => {
  try {
    const { organizationId } = req.query;
    let query = db().collection('ngo_reports');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/reports', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_reports').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/field-reports', async (req, res) => {
  try {
    const { organizationId } = req.query;
    let query = db().collection('ngo_field_reports');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/field-reports', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_field_reports').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/compliance-reports', async (req, res) => {
  try {
    const { organizationId } = req.query;
    let query = db().collection('ngo_compliance_reports');
    if (organizationId) query = query.where('organizationId', '==', organizationId);
    const snapshot = await query.get();
    res.json({ success: true, data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/compliance-reports', async (req, res) => {
  try {
    const docRef = await db().collection('ngo_compliance_reports').add({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true, data: { id: docRef.id, ...req.body } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

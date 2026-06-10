import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initFirebase } from '../utils/firebase.js';
import { getMailConfigStatus, isMailConfigured } from './utils/mailer.js';
import { getCloudinaryConfigStatus, isCloudinaryConfigured } from './utils/cloudinary.js';
import { buildCorsOptions } from './config/cors.config.js';

const NODE_ENV_RAW = process.env.NODE_ENV || 'development';

// Clean environment variables (remove quotes if present)
const cleanEnvVar = (value) => {
  if (!value) return value;
  return value.replace(/^["']|["']$/g, '');
};

// Environment configuration - NOW read from loaded .env file
const NODE_ENV = cleanEnvVar(process.env.NODE_ENV) || 'development';
const PORT = parseInt(cleanEnvVar(process.env.PORT)) || 3001; // Default to 3001
const { allowedOrigins, options: corsOptions } = buildCorsOptions(process.env.CORS_ORIGIN);

console.log(`🚀 Starting server in ${NODE_ENV} mode`);
console.log(`📡 CORS allowed origins: ${allowedOrigins.join(', ')}`);
console.log(`🔌 Port will be: ${PORT}`);
console.log(`🔌 PORT from env: ${process.env.PORT}`);
console.log(`🔌 NODE_ENV from env: ${process.env.NODE_ENV}`);

const mailStatus = getMailConfigStatus();
if (isMailConfigured()) {
  console.log('📧 Mail: configured (Mailtrap)');
} else {
  console.warn('📧 Mail: NOT configured —', mailStatus.reason);
  console.warn('📧 Put MAILTRAP_TOKEN and MAILTRAP_FROM_EMAIL in backend/.env, then restart.');
}

const cloudinaryStatus = getCloudinaryConfigStatus();
if (isCloudinaryConfigured()) {
  console.log(`☁️  Cloudinary: configured (${cloudinaryStatus.cloudName})`);
} else {
  console.warn('☁️  Cloudinary: NOT configured —', cloudinaryStatus.reason);
}

const app = express();

// Initialize Firebase asynchronously (non-blocking)
let firebaseReady = false;
console.log(`🔥 Firebase initialization starting...`);
initFirebase()
  .then(async () => {
    firebaseReady = true;
    console.log('✅ Firebase initialized successfully');
    try {
      await seedSuperAdminRoleAndUser();
      console.log('✅ Platform SUPER_ADMIN role seeded');
    } catch (error) {
      console.error('⚠️ Platform role seed skipped:', error.message);
    }
  })
  .catch((error) => {
    console.error('❌ Firebase initialization failed:', error);
  });

// Routes
import authRoutes from './routes/auth.routes.js';
import rxRoutes from './routes/rx.routes.js';
import pharmacyRoutes from './routes/pharmacy.routes.js';
import callcenterRoutes from './routes/callcenter.routes.js';
import statusRoutes from './routes/status.routes.js';
import productRouter from './routes/stock/product.routes.js';
import purchaseRouter from './routes/stock/purchase.routes.js';
import dispenseRouter from './routes/stock/dispense.routes.js';
import transferRouter from './routes/stock/transfer.routes.js';
import journalRouter from './routes/stock/journal.routes.js';
import productSettingRouter from './routes/stock/productSetting.routes.js';
import inventoryRouter from './routes/stock/inventory.routes.js';
import salesRouter from './routes/stock/sales.route.js';
import accountsRouter from './routes/stock/accounts.route.js';
import expensesRouter from './routes/stock/expenses.route.js';
import ledgerRouter from './routes/stock/ledger.router.js';
import trialBalanceRouter from './routes/stock/trialbalance.router.js';
import incomestaatementRouter from './routes/stock/incomeStatement.routes.js';
import balanceSheetRouter from './routes/stock/balanceSheet.routes.js';
import cashFlowRouter from './routes/stock/cashFlow.routes.js';
import fixedAssetRouter from './routes/stock/fixedAssets.routes.js';
import productionRouter from './routes/production/production.routes.js';
import authRouters from './routes/stock/auths.routes.js';
import purchaseRoutes from './routes/stock/purchase.routes.js';
import supplierRoutes from './routes/stock/supplier.routes.js';
import supplierInvoiceRoutes from './routes/stock/supplierInvoice.routes.js';
import customerRoutes from './routes/stock/customer.routes.js';
import customerInvoiceRoutes from './routes/stock/customerInvoice.routes.js';
import paymentRoutes from './routes/stock/payment.routes.js';
import taxRoutes from './routes/stock/tax.routes.js';
import glAccountRoutes from './routes/stock/glAccount.routes.js';

// Hospital Routes
import hospitalAuthRoutes from './routes/hospital/auth.routes.js';
import appointmentRoutes from './routes/hospital/appointment.routes.js';
import billingRoutes from './routes/hospital/billing.routes.js';
import departmentRoutes from './routes/hospital/department.routes.js';
import doctorRoutes from './routes/hospital/doctor.routes.js';
import labRoutes from './routes/hospital/lab.routes.js';
import medicalRecordRoutes from './routes/hospital/medicalRecord.routes.js';
import patientRoutes from './routes/hospital/patient.routes.js';
import specializationRoutes from './routes/hospital/specialization.routes.js';
import wardRoutes from './routes/hospital/ward.routes.js';
import insuranceProviderRoutes from './routes/hospital/insuranceProvider.routes.js';
import vitalSignsRoutes from './routes/hospital/vitalSigns.routes.js';
import prescriptionRoutes from './routes/hospital/prescription.routes.js';
import surgeryRecordRoutes from './routes/hospital/surgeryRecord.routes.js';
import treatmentPlanRoutes from './routes/hospital/treatmentPlan.routes.js';
import admissionRoutes from './routes/hospital/admission.routes.js';
import hospitalAdminRoutes from './routes/hospital/hospitalAdmin.routes.js';
import reportsRoutes from './routes/hospital/reports.routes.js';

// Super Admin Routes
import superAdminHospitalRoutes from './routes/superAdmin/hospital.routes.js';
import superAdminHospitalAdminRoutes from './routes/superAdmin/hospitalAdmin.routes.js';
import superAdminDashboardRoutes from './routes/superAdmin/dashboard.routes.js';
import superAdminStockRoutes from './routes/superAdmin/stock.routes.js';
import superAdminPharmacyRoutes from './routes/superAdmin/pharmacy.routes.js';
import superAdminHROrganizationRoutes from './routes/superAdmin/hrOrganization.routes.js';
import superAdminPayrollRoutes from './routes/superAdmin/payroll.routes.js';
import superAdminNGORoutes from './routes/superAdmin/ngo.routes.js';
import superAdminPropertyOrganizationRoutes from './routes/superAdmin/propertyOrganization.routes.js';
import superAdminRoleRoutes from './routes/superAdmin/role.routes.js';
import superAdminPlatformUserRoutes from './routes/superAdmin/platformUser.routes.js';
import superAdminServiceRegistrationRoutes from './routes/superAdmin/serviceRegistration.routes.js';
import { seedSuperAdminRoleAndUser } from './services/platformRoleSeed.service.js';
import ngoOperationsRoutes from './routes/ngo/operations.routes.js';
import ngoProjectRoutes from './routes/ngo/project.routes.js';
import ngoTenderRoutes from './routes/ngo/tender.routes.js';
import ngoContractRoutes from './routes/ngo/contract.routes.js';
import ngoImpactRoutes from './routes/ngo/impact.routes.js';
import ngoEvaluationRoutes from './routes/ngo/evaluation.routes.js';
import ngoMeModuleAssignmentRoutes from './routes/ngo/meModuleAssignment.routes.js';
import ngoIntegrationRoutes from './routes/ngo/integration.routes.js';
import ngoOrganizationRoutes from './routes/ngo/organization.routes.js';
import ngoBranchRoutes from './routes/ngo/branch.routes.js';
import ngoDepartmentRoutes from './routes/ngo/department.routes.js';
import ngoOrgChartRoutes from './routes/ngo/orgChart.routes.js';
import ngoRoleRoutes from './routes/ngo/role.routes.js';
import ngoFinanceRoutes from './routes/ngo/finance.routes.js';
import ngoAuditRoutes from './routes/ngo/audit.routes.js';
import ngoBeneficialOwnerRoutes from './routes/ngo/beneficialOwner.routes.js';
import ngoStorageRoutes from './routes/ngo/storage.routes.js';
import ngoChurchRoutes from './routes/ngo/church.routes.js';
import ngoGisRoutes from './routes/ngo/gis.routes.js';
import ngoServiceControlRoutes from './routes/ngo/serviceControl.routes.js';
import ngoSettingsRoutes from './routes/ngo/settings.routes.js';
import ngoUserRoutes from './routes/ngo/user.routes.js';
import ngoAccountRoutes from './routes/ngo/account.routes.js';
import ngoDashboardRoutes from './routes/ngo/dashboard.routes.js';
import ngoDiamondFormRoutes from './routes/ngo/diamondForm.routes.js';
import ngoDiamondOptionRoutes from './routes/ngo/diamondOption.routes.js';
import ngoDiamondSectionRoutes from './routes/ngo/diamondSection.routes.js';

// HR Routes
import hrOrganizationRoutes from './routes/hr/organization.routes.js';
import hrEmployeeRoutes from './routes/hr/employee.routes.js';
import hrDepartmentRoutes from './routes/hr/department.routes.js';
import hrAttendanceRoutes from './routes/hr/attendance.routes.js';
import hrShiftRoutes from './routes/hr/shift.routes.js';
import hrLeaveRoutes from './routes/hr/leave.routes.js';
import hrPayrollRoutes from './routes/hr/payroll.routes.js';
import hrContractRoutes from './routes/hr/contract.routes.js';
import hrPerformanceRoutes from './routes/hr/performance.routes.js';
import hrDashboardRoutes from './routes/hr/dashboard.routes.js';
import hrAuthRoutes from './routes/hr/auth.routes.js';
import currencyRoutes from './routes/currency.routes.js';
import serviceRegistrationRoutes from './routes/serviceRegistration.routes.js';

// Property Routes
import propertyRoutes from './routes/property/property.routes.js';
import unitRoutes from './routes/property/unit.routes.js';
import tenantRoutes from './routes/property/tenant.routes.js';
import leaseRoutes from './routes/property/lease.routes.js';
import propertyBillingRoutes from './routes/property/billing.routes.js';
import maintenanceRoutes from './routes/property/maintenance.routes.js';
import propertyStaffRoutes from './routes/property/staff.routes.js';

// Middlewares — CORS before helmet so preflight responses include ACAO headers
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
  express.json(),
  express.urlencoded({ extended: true }),
  morgan(NODE_ENV === 'production' ? 'combined' : 'dev')
);

// Firebase readiness middleware
const requireFirebase = (req, res, next) => {
  if (!firebaseReady) {
    return res.status(503).json({ 
      error: 'Service temporarily unavailable', 
      message: 'Firebase is still initializing' 
    });
  }
  next();
};

// Health check
app.get('/', (_req, res) => res.json({ 
  message: 'ProManager API Server', 
  status: 'running', 
  firebase: firebaseReady ? 'ready' : 'initializing',
  timestamp: new Date().toISOString() 
}));
app.get('/api/v1/health', (_req, res) => res.json({ 
  ok: true, 
  firebase: firebaseReady ? 'ready' : 'initializing' 
}));

// API routes
app.use('/api/v1/auth', authRoutes); // auth (register/login)
app.use('/api/v1/service-registration', requireFirebase, serviceRegistrationRoutes);
app.use('/api/v1/prescriptions', rxRoutes); // prescriptions (doctor/pharmacy)
app.use('/api/v1/pharmacies', pharmacyRoutes); // pharmacies CRUD
app.use('/api/v1/callcenter', callcenterRoutes),
  app.use('/api/v1/status', statusRoutes); // ✅ add this
app.use('/api/v1/stock/product', productRouter);
app.use('/api/v1/stock/purchase', purchaseRouter);
app.use('/api/v1/stock/dispense', dispenseRouter);
app.use('/api/v1/stock/transfer', transferRouter);
app.use('api/v1/stock/journal', journalRouter);
app.use('/api/v1/stock/product-settings', productSettingRouter);
app.use('/api/v1/stock/inventory', inventoryRouter);
app.use('/api/v1/stock/sales', salesRouter);
app.use('/api/v1/stock/account-settings', accountsRouter);
app.use('/api/v1/stock/journal', journalRouter);
app.use('/api/v1/stock/expenses', expensesRouter);
app.use('/api/v1/stock/ledger', ledgerRouter);
app.use('/api/v1/stock/trialbalance', trialBalanceRouter);
app.use('/api/v1/stock/income-statement', incomestaatementRouter);
app.use('/api/v1/stock/balance-sheet', balanceSheetRouter);
app.use('/api/v1/stock/cash-flow', cashFlowRouter);
app.use('/api/v1/stock/fixed-assets', fixedAssetRouter);
app.use('/api/v1/production', productionRouter);
app.use('/api/v1/stock/auth', authRouters);
// app.use("/api/v1/stock/admin", stockAdminRoutes)
app.use('/api/v1/stock/purchases', purchaseRoutes);
app.use('/api/v1/stock/supplier', supplierRoutes);
app.use('/api/V1/stock/supplier-invoices', supplierInvoiceRoutes);
app.use('/api/v1/stock/customer', customerRoutes);
app.use('/api/v1/stock/invoice', customerInvoiceRoutes);
app.use('/api/v1/stock/payment', paymentRoutes);
app.use('/api/v1/stock/taxes', taxRoutes);
app.use('/api/v1/stock/gl-accounts', glAccountRoutes);

// Hospital routes
console.log('Registering hospital auth routes...');
app.use('/api/v1/hospital/auth', requireFirebase, hospitalAuthRoutes);
console.log('Hospital auth routes registered successfully');
app.use('/api/v1/hospital/appointments', requireFirebase, appointmentRoutes);
app.use('/api/v1/hospital/billing', requireFirebase, billingRoutes);
app.use('/api/v1/hospital/departments', requireFirebase, departmentRoutes);
app.use('/api/v1/hospital/doctors', requireFirebase, doctorRoutes);
app.use('/api/v1/hospital/lab', requireFirebase, labRoutes);
app.use('/api/v1/hospital/medical-records', requireFirebase, medicalRecordRoutes);
app.use('/api/v1/hospital/patients', requireFirebase, patientRoutes);
app.use('/api/v1/hospital/specializations', requireFirebase, specializationRoutes);
app.use('/api/v1/hospital/wards', requireFirebase, wardRoutes);
app.use('/api/v1/hospital/insurance-providers', requireFirebase, insuranceProviderRoutes);
app.use('/api/v1/hospital/vital-signs', requireFirebase, vitalSignsRoutes);
app.use('/api/v1/hospital/prescriptions', requireFirebase, prescriptionRoutes);
app.use('/api/v1/hospital/surgery-records', requireFirebase, surgeryRecordRoutes);
app.use('/api/v1/hospital/treatment-plans', requireFirebase, treatmentPlanRoutes);
app.use('/api/v1/hospital/admissions', requireFirebase, admissionRoutes);
app.use('/api/v1/hospital/admin', requireFirebase, hospitalAdminRoutes);
app.use('/api/v1/hospital/reports', requireFirebase, reportsRoutes);

// Super Admin routes
app.use('/api/v1/super-admin/hospitals', superAdminHospitalRoutes);
app.use('/api/v1/super-admin/hospital-admins', superAdminHospitalAdminRoutes);
app.use('/api/v1/super-admin/dashboard', superAdminDashboardRoutes);
app.use('/api/v1/super-admin/stocks', superAdminStockRoutes);
app.use('/api/v1/super-admin/pharmacies', superAdminPharmacyRoutes);
app.use('/api/v1/super-admin/hr-organizations', superAdminHROrganizationRoutes);
app.use('/api/v1/super-admin/payroll', superAdminPayrollRoutes);
app.use('/api/v1/super-admin/ngos', superAdminNGORoutes);
app.use('/api/v1/super-admin/property-organizations', superAdminPropertyOrganizationRoutes);
app.use('/api/v1/super-admin/roles', superAdminRoleRoutes);
app.use('/api/v1/super-admin/platform-users', superAdminPlatformUserRoutes);
app.use('/api/v1/super-admin/service-registrations', superAdminServiceRegistrationRoutes);
app.use('/api/v1/ngo/dashboard', requireFirebase, ngoDashboardRoutes);
app.use('/api/v1/ngo/diamond-forms', requireFirebase, ngoDiamondFormRoutes);
app.use('/api/v1/ngo/diamond-options', requireFirebase, ngoDiamondOptionRoutes);
app.use('/api/v1/ngo/diamond-sections', requireFirebase, ngoDiamondSectionRoutes);
app.use('/api/v1/ngo/users', requireFirebase, ngoUserRoutes);
app.use('/api/v1/ngo/account', requireFirebase, ngoAccountRoutes);
app.use('/api/v1/ngo/projects', requireFirebase, ngoProjectRoutes);
app.use('/api/v1/ngo/tenders', requireFirebase, ngoTenderRoutes);
app.use('/api/v1/ngo/contracts', requireFirebase, ngoContractRoutes);
app.use('/api/v1/ngo/storages', requireFirebase, ngoStorageRoutes);
app.use('/api/v1/ngo/church', requireFirebase, ngoChurchRoutes);
app.use('/api/v1/ngo/impacts', requireFirebase, ngoImpactRoutes);
app.use('/api/v1/ngo/evaluations', requireFirebase, ngoEvaluationRoutes);
app.use('/api/v1/ngo/me-module-assignments', requireFirebase, ngoMeModuleAssignmentRoutes);
app.use('/api/v1/ngo/finances', requireFirebase, ngoFinanceRoutes);
app.use('/api/v1/ngo/audits', requireFirebase, ngoAuditRoutes);
app.use('/api/v1/ngo/beneficial-owners', requireFirebase, ngoBeneficialOwnerRoutes);
app.use('/api/v1/ngo/service-control', requireFirebase, ngoServiceControlRoutes);
app.use('/api/v1/ngo', requireFirebase, ngoGisRoutes);
app.use('/api/v1/ngo', requireFirebase, ngoSettingsRoutes);
app.use('/api/v1/ngo', requireFirebase, ngoOperationsRoutes);
app.use('/api/v1/ngo/integration', requireFirebase, ngoIntegrationRoutes);
app.use('/api/v1/ngo/organizations', requireFirebase, ngoOrganizationRoutes);
app.use('/api/v1/ngo/branches', requireFirebase, ngoBranchRoutes);
app.use('/api/v1/ngo/departments', requireFirebase, ngoDepartmentRoutes);
app.use('/api/v1/ngo/org-charts', requireFirebase, ngoOrgChartRoutes);
app.use('/api/v1/ngo/roles', requireFirebase, ngoRoleRoutes);

// Currency routes
app.use('/api/v1/currency', currencyRoutes);

// HR routes
app.use('/api/v1/hr/auth', hrAuthRoutes);
app.use('/api/v1/hr/organizations', hrOrganizationRoutes);
app.use('/api/v1/hr/employees', hrEmployeeRoutes);
app.use('/api/v1/hr/departments', hrDepartmentRoutes);
app.use('/api/v1/hr/attendance', hrAttendanceRoutes);
app.use('/api/v1/hr/shifts', hrShiftRoutes);
app.use('/api/v1/hr/leaves', hrLeaveRoutes);
app.use('/api/v1/hr/payroll', hrPayrollRoutes);
app.use('/api/v1/hr/contracts', hrContractRoutes);
app.use('/api/v1/hr/performance', hrPerformanceRoutes);
app.use('/api/v1/hr/dashboard', hrDashboardRoutes);

// Property routes
app.use('/api/v1/property/properties', requireFirebase, propertyRoutes);
app.use('/api/v1/property/units', requireFirebase, unitRoutes);
app.use('/api/v1/property/tenants', requireFirebase, tenantRoutes);
app.use('/api/v1/property/leases', requireFirebase, leaseRoutes);
app.use('/api/v1/property/billing', requireFirebase, propertyBillingRoutes);
app.use('/api/v1/property/maintenance', requireFirebase, maintenanceRoutes);
app.use('/api/v1/property/staff', requireFirebase, propertyStaffRoutes);

// Catch-all for debugging
app.use('*', (req, res) => {
  console.log('Unmatched route:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Route not found', method: req.method, url: req.originalUrl });
});

// Start server
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Server running on ${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📡 CORS allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`🔗 Health Check: http://${HOST}:${PORT}/api/v1/health`);
  console.log(`📚 API Base URL: http://${HOST}:${PORT}/api/v1`);
  console.log('\n✅ Server ready to accept connections\n');
});

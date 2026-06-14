import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { initFirebase } from '../utils/firebase.js';

// Load environment variables based on NODE_ENV (set before importing)
const NODE_ENV_RAW = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV_RAW === 'production' ? '.env.production' : '.env.development';
const envPath = fileURLToPath(new URL(`../${envFile}`, import.meta.url));
console.log(`📄 Loading environment from: ${envPath}`);
dotenv.config({ path: envPath });

// Clean environment variables (remove quotes if present)
const cleanEnvVar = (value) => {
  if (!value) return value;
  return value.replace(/^["']|["']$/g, '');
};

// Environment configuration - NOW read from loaded .env file
const NODE_ENV = cleanEnvVar(process.env.NODE_ENV) || 'development';
const PORT = parseInt(cleanEnvVar(process.env.PORT)) || 3001; // Default to 3001
const CORS_ORIGIN = cleanEnvVar(process.env.CORS_ORIGIN) || 'http://localhost:5173,http://localhost:3000';
const allowedOrigins = CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
const isOriginAllowed = (origin) =>
  !origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin);
const corsOptions = {
  origin(origin, callback) {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

console.log(`🚀 Starting server in ${NODE_ENV} mode`);
console.log(`📡 CORS Origin: ${CORS_ORIGIN}`);
console.log(`🔌 Port will be: ${PORT}`);
console.log(`🔌 PORT from env: ${process.env.PORT}`);
console.log(`🔌 NODE_ENV from env: ${process.env.NODE_ENV}`);

const app = express();

// Initialize Firebase asynchronously (non-blocking)
let firebaseReady = false;
console.log(`🔥 Firebase initialization starting...`);
initFirebase()
  .then(() => {
    firebaseReady = true;
    console.log('✅ Firebase initialized successfully');
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
import companySettingRouter from './routes/stock/companySetting.routes.js';
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
import assetManagementRouter from './routes/assetManagement/assetManagement.routes.js';
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
import cashierRoutes from './routes/stock/cashier.routes.js';

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

// Property Routes
import propertyRoutes from './routes/property/property.routes.js';
import unitRoutes from './routes/property/unit.routes.js';
import tenantRoutes from './routes/property/tenant.routes.js';
import leaseRoutes from './routes/property/lease.routes.js';
import propertyBillingRoutes from './routes/property/billing.routes.js';
import maintenanceRoutes from './routes/property/maintenance.routes.js';
import propertyStaffRoutes from './routes/property/staff.routes.js';

// Middlewares
app.use(
  helmet(),
  express.json(),
  express.urlencoded({ extended: true }),
  cors(corsOptions),
  morgan(NODE_ENV === 'production' ? 'combined' : 'dev')
);

// Additional CORS preflight handler (must match allowedOrigins)
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Origin', origin || allowedOrigins[0]);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

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
app.use('/api/v1/stock/company-settings', companySettingRouter);
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
app.use('/api/v1/stock/assets-management', assetManagementRouter);
app.use('/api/v1/stock/asset-management', assetManagementRouter);
app.use('/api/v1/assets-management', assetManagementRouter);
app.use('/api/v1/production', productionRouter);
app.use('/api/v1/stock/auth', authRouters);
// app.use("/api/v1/stock/admin", stockAdminRoutes)
app.use('/api/v1/stock/purchases', purchaseRoutes);
app.use('/api/v1/stock/supplier', supplierRoutes);
app.use('/api/v1/stock/supplier-invoices', supplierInvoiceRoutes);
app.use('/api/v1/stock/customer', customerRoutes);
app.use('/api/v1/stock/invoice', customerInvoiceRoutes);
app.use('/api/v1/stock/payment', paymentRoutes);
app.use('/api/v1/stock/taxes', taxRoutes);
app.use('/api/v1/stock/gl-accounts', glAccountRoutes);
app.use('/api/v1/stock/cashier', cashierRoutes);

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
  console.log(`📡 CORS Origin: ${CORS_ORIGIN}`);
  console.log(`🔗 Health Check: http://${HOST}:${PORT}/api/v1/health`);
  console.log(`📚 API Base URL: http://${HOST}:${PORT}/api/v1`);
  console.log('\n✅ Server ready to accept connections\n');
});

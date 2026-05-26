import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import AppLayout from "./AppLayout.jsx";
import StockLayout from './pages/stock/StockLayout.jsx';
import StockDashboardOverview from './pages/stock/StockDashboardOverview.jsx';
import InventoryPage from './pages/stock/InventoryPage.jsx';
import ProductsPage from './pages/stock/ProductsPage.jsx';
import PurchasesPage from './pages/stock/PurchasesPage.jsx';
import DispensePage from './pages/stock/DispensePage.jsx';
import TransfersPage from './pages/stock/TransfersPage.jsx';
import AdjustmentsPage from './pages/stock/AdjustmentsPage.jsx';
import ReturnsPage from './pages/stock/ReturnsPage.jsx';
import GeneralJournalPage from './pages/stock/JournalsPage.jsx';
import ProductSettingsPage from './pages/stock/ProductSettingsPage.jsx';
import TaxSettingsPage from './pages/stock/TaxSettingsPage.jsx';
import TaxReportsPage from './pages/stock/TaxReportsPage.jsx';
import ChartOfAccountsPage from './pages/stock/ChartOfAccountsPage.jsx';
import SalesPage from './pages/stock/SalesPage.jsx';
import CustomerPage from './pages/stock/CustomerPage.jsx';
import ExpensesPage from './pages/stock/ExpensesPage.jsx';
import ReportsDashboard from './pages/stock/ReportsDashboard.jsx';
import FixedAssetsPage from './pages/stock/FixedAssetsPage.jsx';
import ProductionPlanPage from './pages/production/ProductionPlanPage.jsx';
import ProductionCostPage from './pages/production/ProductionCostPage.jsx';
import ProductionPlanningPage from './pages/production/ProductionPlanningPage.jsx';
import ProductionReportsPage from './pages/production/ProductionReportsPage.jsx';
import FinishedGoodsPage from './pages/production/FinishedGoodsPage.jsx';
import FinishedGoodsStockPage from './pages/stock/FinishedGoodsStockPage.jsx';
import MaterialConsumptionPage from './pages/production/MaterialConsumptionPage.jsx';
import ProductionCyclePage from './pages/production/ProductionCyclePage.jsx';
import InvoicePage from './pages/stock/InvoicePage.jsx';
import UserSettingsPage from './pages/stock/UserSettingsPage.jsx';
import StockSettingsPage from './pages/stock/StockSettingsPage.jsx';

import { AuthProvider } from './context/AuthContext.jsx';
import { PopupProvider } from './context/PopupContext.jsx';
import { AppProvider } from './context/AppStateContext.jsx';
import { StockProvider } from './context/stockContext.jsx';
import { StockAuthProvider } from './context/StockAuthContext.jsx';
import { JournalProvider } from "./context/JournalContext";
import { ExpenseProvider } from './context/ExpenseContext';
import { ReportsProvider } from './context/ReportsContext.jsx';
import { FixedAssetProvider } from './context/FixedAssetContext.jsx';
import { ProductionProvider } from './context/ProductionContext.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { HospitalAuthProvider } from './context/HospitalAuthContext.jsx';
import { HRAuthProvider } from './context/HRAuthContext.jsx';
import HospitalProvider from './context/HospitalProvider.jsx';
import StockProtectedRoute from './components/stock/StockProtectedRoute.jsx';
import HospitalProtectedRoute from './components/hospital/HospitalProtectedRoute.jsx';
import HRProtectedRoute from './components/hr/HRProtectedRoute.jsx';

// Hospital Pages
import HospitalRoutes from './hospitalPages/HospitalRoutes.jsx';
import DashboardOverview from './hospitalPages/dashboard/DashboardOverview.jsx';
import PatientList from './hospitalPages/patients/pages/PatientList.jsx';
import PatientCreate from './hospitalPages/patients/pages/PatientCreate.jsx';
import PatientDetails from './hospitalPages/patients/pages/PatientDetails.jsx';
import PatientEdit from './hospitalPages/patients/pages/PatientEdit.jsx';
import PatientHistory from './hospitalPages/patients/pages/PatientHistory.jsx';
import PatientDocuments from './hospitalPages/patients/pages/PatientDocuments.jsx';
import PatientInsurance from './hospitalPages/patients/pages/PatientInsurance.jsx';
import PatientEmergencyContacts from './hospitalPages/patients/pages/PatientEmergencyContacts.jsx';
import AppointmentList from './hospitalPages/Appointment/AppointmentList.jsx';
import AppointmentDetails from './hospitalPages/Appointment/AppointmentDetails.jsx';
import AppointmentCreate from './hospitalPages/Appointment/AppointmentCreate.jsx';
import AppointmentCalendar from './hospitalPages/Appointment/AppointmentCalendar.jsx';
import DoctorList from './hospitalPages/Dactors/DoctorList.jsx';
import DoctorSchedule from './hospitalPages/Dactors/DoctorSchedule.jsx';
import DoctorSpecialization from './hospitalPages/Dactors/DoctorSpecialization.jsx';
import WardList from './hospitalPages/wards/pages/WardList.jsx';
import BedAllocation from './hospitalPages/wards/pages/BedAllocation.jsx';
import BedAvailability from './hospitalPages/wards/pages/BedAvailability.jsx';
import WardDetails from './hospitalPages/wards/pages/WardDetails.jsx';
import ICUManagement from './hospitalPages/wards/pages/ICUManagement.jsx';
import LabDashboard from './hospitalPages/lab/pages/LabDashboard.jsx';
import LabTestList from './hospitalPages/lab/pages/LabTestList.jsx';
import CreateLabTest from './hospitalPages/lab/pages/CreateLabTest.jsx';
import LabResultsEntry from './hospitalPages/lab/pages/LabResultsEntry.jsx';
import LabResultsView from './hospitalPages/lab/pages/LabResultsView.jsx';
import PendingTests from './hospitalPages/lab/pages/PendingTests.jsx';
import LabOrderCreateTest from './hospitalPages/lab/pages/LabOrderCreateTest.jsx';
import LabOrderList from './hospitalPages/lab/pages/LabOrderList.jsx';
import LabOrderResultsView from './hospitalPages/lab/pages/LabOrderResultsView.jsx';
import LabResultEntryNew from './hospitalPages/lab/pages/LabResultEntryNew.jsx';
import BillingDashboard from './hospitalPages/billing/pages/BillingDashboard.jsx';
import InvoiceList from './hospitalPages/billing/pages/InvoiceList.jsx';
import CreateInvoice from './hospitalPages/billing/pages/CreateInvoice.jsx';
import PaymentProcessing from './hospitalPages/billing/pages/PaymentProcessing.jsx';
import InsuranceClaims from './hospitalPages/billing/pages/InsuranceClaims.jsx';
import RevenueReports from './hospitalPages/billing/pages/RevenueReports.jsx';
import BillingSettings from './hospitalPages/billing/pages/BillingSettings.jsx';
import InvoiceView from './hospitalPages/billing/pages/InvoiceView.jsx';
import HospitalReportDashboard from './hospitalPages/reports/pages/HospitalReportDashboard.jsx';
import AuditLogs from './hospitalPages/reports/pages/AuditLogs.jsx';
import DepartmentReports from './hospitalPages/reports/pages/DepartmentReports.jsx';
import FinancialReports from './hospitalPages/reports/pages/FinancialReports.jsx';
import LabReports from './hospitalPages/reports/pages/LabReports.jsx';
import PatientReports from './hospitalPages/reports/pages/PatientReports.jsx';
import MedicalRecordReports from './hospitalPages/reports/pages/MedicalRecordReports.jsx';
import AdmissionList from './hospitalPages/admissions/pages/AdmissionList.jsx';
import AdmitPatient from './hospitalPages/admissions/pages/AdmitPatient.jsx';
import DischargePatient from './hospitalPages/admissions/pages/DischargePatient.jsx';
import AdmissionDetails from './hospitalPages/admissions/pages/AdmissionDetails.jsx';
import TransferPatient from './hospitalPages/admissions/pages/TransferPatient.jsx';
import MedicalRecordList from './hospitalPages/medical-records/MedicalRecordList.jsx';
import CreateMedicalRecord from './hospitalPages/medical-records/CreateMedicalRecord.jsx';
import ViewMedicalRecord from './hospitalPages/medical-records/ViewMedicalRecord.jsx';
import DiagnosisEntry from './hospitalPages/medical-records/DiagnosisEntry.jsx';
import PrescriptionEntry from './hospitalPages/medical-records/PrescriptionEntry.jsx';
import PrescriptionListMedical from './hospitalPages/medical-records/PrescriptionList.jsx';
import SurgeryRecord from './hospitalPages/medical-records/SurgeryRecord.jsx';
import SurgeryList from './hospitalPages/medical-records/SurgeryList.jsx';
import TreatmentPlanList from './hospitalPages/medical-records/TreatmentPlanList.jsx';
import VitalSigns from './hospitalPages/medical-records/VitalSigns.jsx';
import VitalSignsTrends from './hospitalPages/medical-records/VitalSignsTrends.jsx';
import TreatmentPlan from './hospitalPages/medical-records/TreatmentPlan.jsx';
import DepartmentList from './hospitalPages/departments/DepartmentList.jsx';
import DepartmentCreate from './hospitalPages/departments/DepartmentCreate.jsx';
import DepartmentDetails from './hospitalPages/departments/DepartmentDetails.jsx';
import AssignHeadOfDepartment from './hospitalPages/departments/AssignHeadOfDepartment.jsx';
import DepartmentStatistics from './hospitalPages/departments/DepartmentStatistics.jsx';
import DoctorListNew from './hospitalPages/doctors/pages/DoctorList.jsx';
import CreateDoctor from './hospitalPages/doctors/pages/CreateDoctor.jsx';
import DoctorProfileNew from './hospitalPages/doctors/pages/DoctorProfile.jsx';
import EditDoctor from './hospitalPages/doctors/pages/EditDoctor.jsx';
import DoctorScheduleNew from './hospitalPages/doctors/pages/DoctorSchedule.jsx';

// Hospital Admin Pages
import HospitalAdminDashboard from './hospitalPages/admin/pages/HospitalAdminDashboard.jsx';
import UserManagement from './hospitalPages/admin/pages/UserManagement.jsx';
import DepartmentManagement from './hospitalPages/admin/pages/DepartmentManagement.jsx';
import StaffManagement from './hospitalPages/admin/pages/StaffManagement.jsx';
import PatientManagement from './hospitalPages/admin/pages/PatientManagement.jsx';
import AppointmentSystem from './hospitalPages/admin/pages/AppointmentSystem.jsx';
import SubAdminManagement from './hospitalPages/admin/pages/SubAdminManagement.jsx';
import AccessControl from './hospitalPages/admin/pages/AccessControl.jsx';
import AdminProfile from './hospitalPages/admin/pages/AdminProfile.jsx';
import AdminSettings from './hospitalPages/admin/pages/AdminSettings.jsx';
import AdminAnalytics from './hospitalPages/admin/pages/AdminAnalytics.jsx';
import AdminProtectedRoute from './components/hospital/AdminProtectedRoute.jsx';

// Pharmacy Pages
import PharmacyLayout from './pharmacy/components/PharmacyLayout.jsx';
import PharmacyDashboard from './pharmacy/pages/dashboard/PharmacyDashboard.jsx';
import PharmaciesPage from './pharmacy/pages/doctors/Pharmacies.jsx';
import PrescriptionList from './pharmacy/pages/prescriptions/PrescriptionList.jsx';
import QuoteList from './pharmacy/pages/quotes/QuoteList.jsx';
import OrderList from './pharmacy/pages/orders/OrderList.jsx';
import CallCenter from './pharmacy/pages/callcenter/CallCenter.jsx';
import PharmacySettings from './pharmacy/pages/settings/PharmacySettings.jsx';

// HR Pages
import HRLayout from './hrPages/HRLayout.jsx';
import HRDashboard from './hrPages/HRDashboard.jsx';
import HRSettings from './hrPages/HRSettings.jsx';
import Employees from './hrPages/Employees.jsx';
import Departments from './hrPages/Departments.jsx';
import Attendance from './hrPages/Attendance.jsx';
import LeaveManagement from './hrPages/LeaveManagement.jsx';
import Payroll from './hrPages/Payroll.jsx';
import Contracts from './hrPages/Contracts.jsx';
import Performance from './hrPages/Performance.jsx';

// Property Pages
import PropertyLayout from './components/property/PropertyLayout.jsx';
import PropertyDashboard from './propertyPages/dashboard/PropertyDashboard.jsx';
import PropertiesList from './propertyPages/properties/PropertiesList.jsx';
import PropertyForm from './propertyPages/properties/PropertyForm.jsx';
import PropertyDetails from './propertyPages/properties/PropertyDetails.jsx';
import UnitsList from './propertyPages/units/UnitsList.jsx';
import TenantsList from './propertyPages/tenants/TenantsList.jsx';
import TenantForm from './propertyPages/tenants/TenantForm.jsx';
import LeasesList from './propertyPages/leases/LeasesList.jsx';
import LeaseForm from './propertyPages/leases/LeaseForm.jsx';
import PropertyBillingDashboard from './propertyPages/billing/BillingDashboard.jsx';
import BillingForm from './propertyPages/billing/BillingForm.jsx';
import PropertyInvoiceView from './propertyPages/billing/InvoiceView.jsx';
import MaintenanceList from './propertyPages/maintenance/MaintenanceList.jsx';
import StaffList from './propertyPages/staff/StaffList.jsx';
import PropertyReportsDashboard from './propertyPages/reports/ReportsDashboard.jsx';
import Communication from './propertyPages/communication/Communication.jsx';
import PropertySettings from './propertyPages/settings/PropertySettings.jsx';
import OwnerPortal from './propertyPages/owner/OwnerPortal.jsx';
import TenantPortal from './propertyPages/tenant-portal/TenantPortal.jsx';

// Service Selection and Dashboards
import GetStartedPage from './pages/GetStartedPage.jsx';
import ServiceRegisterPage from './pages/ServiceRegisterPage.jsx';
import ProcessPaymentPage from './pages/ProcessPaymentPage.jsx';
import ModernLandingPage from './pages/ModernLandingPage.jsx';
import StockDashboard from './pages/StockDashboard.jsx';
import PharmacyServicesDashboard from './pages/PharmacyServicesDashboard.jsx';

// Auth Pages
import HospitalLogin from './pages/auth/HospitalLogin.jsx';
import StockRegister from './pages/auth/StockRegister.jsx';
import CentralLogin from './pages/CentralLogin.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import AuthDebug from './pages/AuthDebug.jsx';

// Super Admin Pages
import SuperAdminDashboard from './pages/superAdmin/SuperAdminDashboard.jsx';
import HospitalManagement from './pages/superAdmin/HospitalManagement.jsx';
import HospitalAdminManagement from './pages/superAdmin/HospitalAdminManagement.jsx';
import SystemActivity from './pages/superAdmin/SystemActivity.jsx';
import SuperAdminSettings from './pages/superAdmin/SuperAdminSettings.jsx';
import CurrencyManagement from './pages/superAdmin/CurrencyManagement.jsx';
import StockManagement from './pages/superAdmin/StockManagement.jsx';
import PharmacyManagement from './pages/superAdmin/PharmacyManagement.jsx';
import HRManagement from './pages/superAdmin/HRManagement.jsx';
import PayrollManagement from './pages/superAdmin/PayrollManagement.jsx';
import NGOManagement from './pages/superAdmin/NGOManagement.jsx';
import PropertyManagement from './pages/superAdmin/PropertyManagement.jsx';
import RoleManagement from './pages/superAdmin/RoleManagement.jsx';
import PlatformUserManagement from './pages/superAdmin/PlatformUserManagement.jsx';
import NGODashboard from './pages/ngo/NGODashboard.jsx';
import NGOAnalyticsDashboard from './pages/ngo/Dashboard.jsx';

// NGO Pages
import NGOLayout from './components/ngo/NGOLayout.jsx';
import NgoHomeRedirect from './components/ngo/NgoHomeRedirect.jsx';
import AccessPending from './pages/ngo/AccessPending.jsx';
import Organizations from './pages/ngo/Organizations.jsx';
import Branches from './pages/ngo/Branches.jsx';
import NGODepartments from './pages/ngo/Departments.jsx';
import NGORoles from './pages/ngo/Roles.jsx';
import NGOStaff from './pages/ngo/Staff.jsx';
import NGOProjects from './pages/ngo/Projects.jsx';
import NGOFinance from './pages/ngo/Finance.jsx';
import NGOContracts from './pages/ngo/Contracts.jsx';
import Impact from './pages/ngo/Impact.jsx';
import ChurchManagement from './pages/ngo/ChurchManagement.jsx';
import NGOSettings from './pages/ngo/Settings.jsx';

function AppContent() {
  return (
    <Routes>
      {/* Modern Landing Page - Main Entry Point */}
      <Route path='/' element={<ModernLandingPage />} />
      <Route path='/services' element={<GetStartedPage />} />
      <Route path='/get-started' element={<GetStartedPage />} />
      <Route path='/get-started/register' element={<ServiceRegisterPage />} />
      <Route path='/get-started/register/:serviceId' element={<ServiceRegisterPage />} />
      <Route path='/process-payment' element={<ProcessPaymentPage />} />

      {/* Authentication Routes — centralized login with role-based redirect */}
      <Route path='/login' element={<CentralLogin />} />
      <Route path='/stock/login' element={<Navigate to='/login' replace />} />
      <Route path='/hospital/login' element={<HospitalLogin />} />
      <Route path='/pharmacy/login' element={<Navigate to='/login' replace />} />
      <Route path='/hr/login' element={<Navigate to='/login' replace />} />
      <Route path='/super-admin/login' element={<Navigate to='/login' replace />} />
      <Route path='/stock/register' element={<StockRegister />} />
      <Route path='/unauthorized' element={<Unauthorized />} />
      <Route path='/debug' element={<AuthDebug />} />

      {/* Super Admin Routes */}
      <Route element={<ProtectedRoute service="superAdmin"><Outlet /></ProtectedRoute>}>
        <Route path='/super-admin/dashboard' element={<SuperAdminDashboard />} />
        <Route path='/super-admin/hospitals' element={<HospitalManagement />} />
        <Route path='/super-admin/hospital-admins' element={<HospitalAdminManagement />} />
        <Route path='/super-admin/roles' element={<RoleManagement />} />
        <Route path='/super-admin/users' element={<PlatformUserManagement />} />
        <Route path='/super-admin/stocks' element={<StockManagement />} />
        <Route path='/super-admin/ngos' element={<NGOManagement />} />
        <Route path='/super-admin/pharmacies' element={<PharmacyManagement />} />
        <Route path='/super-admin/hr' element={<HRManagement />} />
        <Route path='/super-admin/properties' element={<PropertyManagement />} />
        <Route path='/super-admin/payroll' element={<PayrollManagement />} />
        <Route path='/super-admin/currency' element={<CurrencyManagement />} />
        <Route path='/super-admin/activity' element={<SystemActivity />} />
        <Route path='/super-admin/settings' element={<SuperAdminSettings />} />
      </Route>

      {/* Stock Routes */}
      <Route path='/stock/*' element={<ProtectedRoute service="stock"><StockLayout /></ProtectedRoute>}>
        <Route index element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","PRODUCTION_MANAGER","FINANCE_MANAGER","SALE_MANAGER","MARKETTING_MANAGER","ACCOUNTANT","STOCK_KEEPER","PROCUREMENT","SALES"]}><StockDashboardOverview /></StockProtectedRoute>} />
        <Route path='inventory' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","STOCK_KEEPER","ACCOUNTANT"]} departments={["Warehouse","Finance"]}><InventoryPage /></StockProtectedRoute>} />
        <Route path='purchases' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","PROCUREMENT","ACCOUNTANT"]} departments={["Purchasing","Finance"]}><PurchasesPage /></StockProtectedRoute>} />
        <Route path='customers' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","SALE_MANAGER","SALES","ACCOUNTANT"]} departments={["Sales","Finance"]}><CustomerPage /></StockProtectedRoute>} />
        <Route path='sales' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","SALE_MANAGER","SALES","ACCOUNTANT"]} departments={["Sales","Finance"]}><SalesPage /></StockProtectedRoute>} />
        <Route path="invoice/:id" element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","SALE_MANAGER","SALES","ACCOUNTANT"]} departments={["Sales","Finance"]}><InvoicePage /></StockProtectedRoute>} />
        <Route path='dispense' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","STOCK_KEEPER","ACCOUNTANT"]} departments={["Warehouse","Finance"]}><DispensePage /></StockProtectedRoute>} />
        <Route path='transfers' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","STOCK_KEEPER","ACCOUNTANT"]} departments={["Warehouse","Finance"]}><TransfersPage /></StockProtectedRoute>} />
        <Route path='adjustments' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","FINANCE_MANAGER","ACCOUNTANT"]} departments={["Finance","Warehouse"]}><AdjustmentsPage /></StockProtectedRoute>} />
        <Route path='returns' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","STOCK_KEEPER","ACCOUNTANT"]} departments={["Warehouse","Finance"]}><ReturnsPage /></StockProtectedRoute>} />
        <Route path='general-journal' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","FINANCE_MANAGER","ACCOUNTANT"]} departments={["Finance"]}><GeneralJournalPage /></StockProtectedRoute>} />
        <Route path='Product-Settings' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER"]}><ProductSettingsPage /></StockProtectedRoute>} />
        <Route path='tax-settings' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","FINANCE_MANAGER","ACCOUNTANT"]} departments={["Finance"]}><TaxSettingsPage /></StockProtectedRoute>} />
        <Route path='tax-reports' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","FINANCE_MANAGER","ACCOUNTANT"]} departments={["Finance"]}><TaxReportsPage /></StockProtectedRoute>} />
        <Route path='charts-of-accounts' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","FINANCE_MANAGER","ACCOUNTANT"]} departments={["Finance"]}><ChartOfAccountsPage /></StockProtectedRoute>} />
        <Route path='user-settings' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","PRODUCTION_MANAGER","FINANCE_MANAGER","SALE_MANAGER","MARKETTING_MANAGER","ACCOUNTANT","STOCK_KEEPER","PROCUREMENT","SALES"]}><StockSettingsPage /></StockProtectedRoute>} />
        <Route path='expenses' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","FINANCE_MANAGER","ACCOUNTANT"]} departments={["Finance"]}><ExpensesPage /></StockProtectedRoute>} />
        <Route path='reports-dashboard' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","FINANCE_MANAGER","ACCOUNTANT"]}><ReportsDashboard /></StockProtectedRoute>} />
        <Route path='fixed-assets' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","FINANCE_MANAGER","ACCOUNTANT"]} departments={["Finance"]}><FixedAssetsPage /></StockProtectedRoute>} />
        <Route path='production-plan' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","PRODUCTION_MANAGER"]} departments={["Production"]}><ProductionPlanPage /></StockProtectedRoute>} />
        <Route path='production-cost' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","PRODUCTION_MANAGER","ACCOUNTANT"]} departments={["Production","Finance"]}><ProductionCostPage /></StockProtectedRoute>} />
        <Route path='production-planning' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","PRODUCTION_MANAGER"]} departments={["Production"]}><ProductionPlanningPage /></StockProtectedRoute>} />
        <Route path='finished-goods' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","PRODUCTION_MANAGER","STOCK_KEEPER","ACCOUNTANT"]} departments={["Production","Warehouse","Finance"]}><FinishedGoodsStockPage /></StockProtectedRoute>} />
        <Route path='production-reports' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","PRODUCTION_MANAGER","ACCOUNTANT"]} departments={["Production","Finance"]}><ProductionReportsPage /></StockProtectedRoute>} />
        <Route path='Material-consumptions' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","PRODUCTION_MANAGER","STOCK_KEEPER","ACCOUNTANT"]} departments={["Production","Warehouse","Finance"]}><MaterialConsumptionPage /></StockProtectedRoute>} />
        <Route path='production-cycle' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER","PRODUCTION_MANAGER"]} departments={["Production"]}><ProductionCyclePage /></StockProtectedRoute>} />
        <Route path='hr/employees' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER"]}><Employees /></StockProtectedRoute>} />
        <Route path='hr/departments' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER"]}><Departments /></StockProtectedRoute>} />
        <Route path='hr/attendance' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER"]}><Attendance /></StockProtectedRoute>} />
        <Route path='hr/leave' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER"]}><LeaveManagement /></StockProtectedRoute>} />
        <Route path='hr/payroll' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER"]}><Payroll /></StockProtectedRoute>} />
        <Route path='hr/contracts' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER"]}><Contracts /></StockProtectedRoute>} />
        <Route path='hr/performance' element={<StockProtectedRoute roles={["SUPER_ADMIN","ADMIN","DIRECTOR_MANAGER"]}><Performance /></StockProtectedRoute>} />
      </Route>

      {/* Hospital Routes — RBAC Protected with comprehensive role and department access control */}
      <Route path='/hospital/*' element={<ProtectedRoute service="hospital"><HospitalRoutes /></ProtectedRoute>} />

      {/* Pharmacy Routes */}
      <Route path='/pharmacy/*' element={<ProtectedRoute service="pharmacy"><PharmacyLayout /></ProtectedRoute>}>
        <Route path='doctors' element={<PharmaciesPage />} />
        <Route path='prescriptions' element={<PrescriptionList />} />
        <Route path='prescriptions/create' element={<PrescriptionList />} />
        <Route path='prescriptions/verify' element={<PrescriptionList />} />
        <Route path='quotes' element={<QuoteList />} />
        <Route path='quotes/create' element={<QuoteList />} />
        <Route path='quotes/pending' element={<QuoteList />} />
        <Route path='orders' element={<OrderList />} />
        <Route path='orders/create' element={<OrderList />} />
        <Route path='orders/tracking' element={<OrderList />} />
        <Route path='branding' element={<PharmacyDashboard />} />
        <Route path='branding/campaigns' element={<PharmacyDashboard />} />
        <Route path='payments' element={<PharmacyDashboard />} />
        <Route path='payments/process' element={<PharmacyDashboard />} />
        <Route path='payments/reports' element={<PharmacyDashboard />} />
        <Route path='settings' element={<PharmacySettings />} />
        <Route path='callcenter' element={<CallCenter />} />
        <Route path='hr/employees' element={<Employees />} />
        <Route path='hr/departments' element={<Departments />} />
        <Route path='hr/attendance' element={<Attendance />} />
        <Route path='hr/leave' element={<LeaveManagement />} />
        <Route path='hr/payroll' element={<Payroll />} />
        <Route path='hr/contracts' element={<Contracts />} />
        <Route path='hr/performance' element={<Performance />} />
      </Route>

      {/* HR Routes */}
      <Route path='/hr/*' element={<ProtectedRoute service="hr"><HRLayout /></ProtectedRoute>}>
        <Route path='dashboard' element={<HRProtectedRoute><HRDashboard /></HRProtectedRoute>} />
        <Route path='employees' element={<HRProtectedRoute><Employees /></HRProtectedRoute>} />
        <Route path='departments' element={<HRProtectedRoute><Departments /></HRProtectedRoute>} />
        <Route path='attendance' element={<HRProtectedRoute><Attendance /></HRProtectedRoute>} />
        <Route path='leave' element={<HRProtectedRoute><LeaveManagement /></HRProtectedRoute>} />
        <Route path='payroll' element={<HRProtectedRoute><Payroll /></HRProtectedRoute>} />
        <Route path='contracts' element={<HRProtectedRoute><Contracts /></HRProtectedRoute>} />
        <Route path='shifts' element={<HRProtectedRoute><HRDashboard /></HRProtectedRoute>} />
        <Route path='payslips' element={<HRProtectedRoute><Payroll /></HRProtectedRoute>} />
        <Route path='performance' element={<HRProtectedRoute><Performance /></HRProtectedRoute>} />
        <Route path='documents' element={<HRProtectedRoute><HRDashboard /></HRProtectedRoute>} />
        <Route path='recruitment' element={<HRProtectedRoute><HRDashboard /></HRProtectedRoute>} />
        <Route path='reports' element={<HRProtectedRoute><HRDashboard /></HRProtectedRoute>} />
        <Route path='settings' element={<HRProtectedRoute><HRSettings /></HRProtectedRoute>} />
        <Route path='organizations' element={<HRProtectedRoute><HRDashboard /></HRProtectedRoute>} />
      </Route>

      {/* Property Management Routes */}
      <Route path='/property/*' element={<ProtectedRoute service="property"><PropertyLayout /></ProtectedRoute>}>
        <Route index element={<PropertyDashboard />} />
        <Route path='properties' element={<PropertiesList />} />
        <Route path='properties/create' element={<PropertyForm />} />
        <Route path='properties/:id' element={<PropertyDetails />} />
        <Route path='properties/:id/edit' element={<PropertyForm />} />
        <Route path='units' element={<UnitsList />} />
        <Route path='tenants' element={<TenantsList />} />
        <Route path='tenants/create' element={<TenantForm />} />
        <Route path='tenants/:id' element={<TenantForm />} />
        <Route path='tenants/:id/edit' element={<TenantForm />} />
        <Route path='leases' element={<LeasesList />} />
        <Route path='leases/create' element={<LeaseForm />} />
        <Route path='leases/:id' element={<LeaseForm />} />
        <Route path='leases/:id/edit' element={<LeaseForm />} />
        <Route path='billing' element={<PropertyBillingDashboard />} />
        <Route path='billing/create' element={<BillingForm />} />
        <Route path='billing/:id' element={<PropertyInvoiceView />} />
        <Route path='billing/:id/edit' element={<BillingForm />} />
        <Route path='maintenance' element={<MaintenanceList />} />
        <Route path='maintenance/create' element={<MaintenanceList />} />
        <Route path='maintenance/:id' element={<MaintenanceList />} />
        <Route path='staff' element={<StaffList />} />
        <Route path='staff/create' element={<StaffList />} />
        <Route path='staff/:id' element={<StaffList />} />
        <Route path='staff/:id/schedule' element={<StaffList />} />
        <Route path='reports' element={<PropertyReportsDashboard />} />
        <Route path='reports/:reportType' element={<PropertyReportsDashboard />} />
        <Route path='communication' element={<Communication />} />
        <Route path='settings' element={<PropertySettings />} />
        <Route path='owner-portal' element={<OwnerPortal />} />
        <Route path='tenant-portal' element={<TenantPortal />} />
      </Route>

      {/* NGO Management Routes */}
      <Route path='/ngo' element={<ProtectedRoute service="ngo"><NGOLayout /></ProtectedRoute>}>
        <Route index element={<NgoHomeRedirect />} />
        <Route path='dashboard' element={<NGOAnalyticsDashboard />} />
        <Route path='access-pending' element={<AccessPending />} />
        <Route path='organizations' element={<Organizations />} />
        <Route path='branches' element={<Branches />} />
        <Route path='departments' element={<NGODepartments />} />
        <Route path='roles' element={<NGORoles />} />
        <Route path='staff' element={<NGOStaff />} />
        <Route path='org-chart' element={<Navigate to='staff' replace />} />
        <Route path='users' element={<Navigate to='staff' replace />} />
        <Route path='projects' element={<NGOProjects />} />
        <Route path='contracts' element={<NGOContracts />} />
        <Route path='gis' element={<Navigate to='/ngo/dashboard' replace />} />
        <Route path='finance' element={<NGOFinance />} />
        <Route path='impact' element={<Impact />} />
        <Route path='church' element={<ChurchManagement />} />
        <Route path='audit' element={<Navigate to='/ngo/dashboard' replace />} />
        <Route path='beneficial-owners' element={<Navigate to='/ngo/dashboard' replace />} />
        <Route path='service-control' element={<Navigate to='/ngo/dashboard' replace />} />
        <Route path='settings' element={<NGOSettings />} />
        <Route path='donors' element={<Navigate to='projects' replace />} />
        <Route path='reports' element={<Navigate to='impact' replace />} />
      </Route>
      
      {/* Legacy NGO Dashboard Route (for backwards compatibility) */}
      <Route path='/ngo/old-dashboard' element={<ProtectedRoute service="ngo"><NGODashboard /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PopupProvider>
      <AppProvider>
        <CurrencyProvider>
          <HospitalAuthProvider>
            <HospitalProvider>
              <HRAuthProvider>
                <StockAuthProvider>
                  <StockProvider>
                    <JournalProvider>
                      <ExpenseProvider>
                        <ReportsProvider>
                          <FixedAssetProvider>
                            <ProductionProvider>
                              <AppContent />
                            </ProductionProvider>
                          </FixedAssetProvider>
                        </ReportsProvider>
                      </ExpenseProvider>
                    </JournalProvider>
                  </StockProvider>
                </StockAuthProvider>
              </HRAuthProvider>
            </HospitalProvider>
          </HospitalAuthProvider>
        </CurrencyProvider>
      </AppProvider>
      </PopupProvider>
    </AuthProvider>
  );
}

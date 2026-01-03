// frontend/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

import UnifiedLogin from './pages/UnifiedLogin.jsx';
import UnifiedRegister from './pages/UnifiedRegister.jsx';
import Home from './pages/Home.jsx';
import Pharmacies from './pages/Pharmacies.jsx';
import Prescription from './pages/Prescription.jsx';
import Quotes from './pages/Quotes.jsx';
import Orders from './pages/Orders.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Clinics from './pages/Clinics.jsx';
import Branding from './pages/Branding.jsx';
import Payments from './pages/Payments.jsx';
import PharmacyRx from './pages/PharmacyRx.jsx';
import CallCenterDashboard from './pages/CallCenterDashboard.jsx';

import AppLayout from "./AppLayout.jsx";
import InventoryPage from './pages/stock/ProductsPage.jsx';
import PurchasesPage from './pages/stock/PurchasesPage.jsx';
import DispensePage from './pages/stock/DispensePage.jsx';
import TransfersPage from './pages/stock/TransfersPage.jsx';
import AdjustmentsPage from './pages/stock/AdjustmentsPage.jsx';
import ReturnsPage from './pages/stock/ReturnsPage.jsx';
import GeneralJournalPage from './pages/stock/JournalsPage.jsx';
import ProductSettingsPage from './pages/stock/ProductSettingsPage.jsx';
import ChartOfAccountsPage from './pages/stock/ChartOfAccountsPage.jsx';
import SalesPage from './pages/stock/SalesPage.jsx';
import ExpensesPage from './pages/stock/ExpensesPage.jsx';
import ReportsDashboard from './pages/stock/ReportsDashboard.jsx';
import FixedAssetsPage from './pages/stock/FixedAssetsPage.jsx';
import ProductionPlanPage from './pages/production/ProductionPlanPage.jsx';
import ProductionCostPage from './pages/production/ProductionCostPage.jsx';
import ProductionPlanningPage from './pages/production/ProductionPlanningPage.jsx';
import ProductionReportsPage from './pages/production/ProductionReportsPage.jsx';
import FinishedGoodsPage from './pages/production/FinishedGoodsPage.jsx';
import MaterialConsumptionPage from './pages/production/MaterialConsumptionPage.jsx';
import ProductionCyclePage from './pages/production/ProductionCyclePage.jsx';
import InvoicePage from './pages/stock/InvoicePage.jsx';

import UserSettingsPage from './pages/stock/UserSettingsPage.jsx';

import { AuthProvider } from './context/AuthContext.jsx';
import { AppProvider } from './context/AppStateContext.jsx';
import { StockProvider } from './context/stockContext.jsx';
import { StockAuthProvider } from './context/StockAuthContext.jsx';
import { JournalProvider } from "./context/JournalContext";
import { ExpenseProvider } from './context/ExpenseContext';
import { ReportsProvider } from './context/ReportsContext.jsx';
import { FixedAssetProvider } from './context/FixedAssetContext.jsx';
import { ProductionProvider } from './context/ProductionContext.jsx';
import StockProtectedRoute from './components/stock/StockProtectedRoute.jsx';

function AppContent() {
  return (
    <Routes>
      {/* Public / top-level pages */}
      <Route path='/' element={
        <>
          <Navbar />
          <main className="pt-16 pb-16 min-h-screen bg-gray-100">
            <Home />
          </main>
          <Footer />
        </>
      } />
      <Route path='/login' element={<UnifiedLogin />} />
      <Route path='/register' element={<UnifiedRegister />} />
      <Route path='/pharmacies' element={<Pharmacies />} />
      <Route path='/prescription' element={<Prescription />} />
      <Route path='/quotes' element={<Quotes />} />
      <Route path='/orders' element={<Orders />} />
      <Route path='/clinics' element={<Clinics />} />
      <Route path='/branding' element={<Branding />} />
      <Route path='/payments' element={<Payments />} />
      <Route path='/admin' element={<AdminDashboard />} />
      <Route path='/pharmacy-rx' element={<PharmacyRx />} />
      <Route path='/callcenter' element={<CallCenterDashboard />} />

      {/* Stock Dashboard pages */}
      <Route path='/stock/*' element={<AppLayout />}>
        <Route path='inventory' element={
          <StockProtectedRoute roles={["ADMIN","MANAGER","STOREKEEPER","ACCOUNTANT"]} departments={["Warehouse","Finance"]}>
            <InventoryPage />
          </StockProtectedRoute>
        } />
        <Route path='purchases' element={
          <StockProtectedRoute roles={["ADMIN","PURCHASER","MANAGER","ACCOUNTANT"]} departments={["Purchasing","Finance"]}>
            <PurchasesPage />
          </StockProtectedRoute>
        } />
        <Route path='sales' element={
          <StockProtectedRoute roles={["ADMIN","SALES","MANAGER","ACCOUNTANT"]} departments={["Sales","Finance"]}>
            <SalesPage />
          </StockProtectedRoute>
        } />
        <Route path="invoice/:id" element={
          <StockProtectedRoute roles={["ADMIN","SALES","MANAGER","ACCOUNTANT"]} departments={["Sales","Finance"]}>
            <InvoicePage />
          </StockProtectedRoute>
        } />
        <Route path='dispense' element={
          <StockProtectedRoute roles={["ADMIN","STOREKEEPER","MANAGER","ACCOUNTANT"]} departments={["Warehouse","Finance"]}>
            <DispensePage />
          </StockProtectedRoute>
        } />
        <Route path='transfers' element={
          <StockProtectedRoute roles={["ADMIN","STOREKEEPER","MANAGER","ACCOUNTANT"]} departments={["Warehouse","Finance"]}>
            <TransfersPage />
          </StockProtectedRoute>
        } />
        <Route path='adjustments' element={
          <StockProtectedRoute roles={["ADMIN","ACCOUNTANT","MANAGER","ACCOUNTANT"]} departments={["Finance","Warehouse","Finance"]}>
            <AdjustmentsPage />
          </StockProtectedRoute>
        } />
        <Route path='returns' element={
          <StockProtectedRoute roles={["ADMIN","STOREKEEPER","MANAGER","ACCOUNTANT"]} departments={["Warehouse","Finance"]}>
            <ReturnsPage />
          </StockProtectedRoute>
        } />
        <Route path='general-journal' element={
          <StockProtectedRoute roles={["ADMIN","ACCOUNTANT","MANAGER"]} departments={["Finance"]}>
            <GeneralJournalPage />
          </StockProtectedRoute>
        } />
        <Route path='Product-Settings' element={
          <StockProtectedRoute roles={["ADMIN","MANAGER"]}>
            <ProductSettingsPage />
          </StockProtectedRoute>
        } />
        <Route path='charts-of-accounts' element={
          <StockProtectedRoute roles={["ADMIN","ACCOUNTANT","MANAGER"]} departments={["Finance"]}>
            <ChartOfAccountsPage />
          </StockProtectedRoute>
        } />
        <Route path='user-settings' element={
          <StockProtectedRoute roles={["ADMIN","MANAGER","STOREKEEPER","ACCOUNTANT","PURCHASER","SALES","PRODUCTIONMANAGER"]}>
            <UserSettingsPage />
          </StockProtectedRoute>
        } />
        <Route path='expenses' element={
          <StockProtectedRoute roles={["ADMIN","ACCOUNTANT","MANAGER"]} departments={["Finance"]}>
            <ExpensesPage />
          </StockProtectedRoute>
        } />
        <Route path='reports-dashboard' element={
          <StockProtectedRoute roles={["ADMIN","MANAGER","ACCOUNTANT"]}>
            <ReportsDashboard />
          </StockProtectedRoute>
        } />
        <Route path='fixed-assets' element={
          <StockProtectedRoute roles={["ADMIN","ACCOUNTANT","MANAGER"]} departments={["Finance"]}>
            <FixedAssetsPage />
          </StockProtectedRoute>
        } />
        {/* Production Pages */}
        <Route path='production-plan' element={
          <StockProtectedRoute roles={["ADMIN","PRODUCTIONMANAGER","MANAGER"]} departments={["Production"]}>
            <ProductionPlanPage />
          </StockProtectedRoute>
        } />
        <Route path='production-cost' element={
          <StockProtectedRoute roles={["ADMIN","PRODUCTIONMANAGER","ACCOUNTANT"]} departments={["Production","Finance"]}>
            <ProductionCostPage />
          </StockProtectedRoute>
        } />
        <Route path='production-planning' element={
          <StockProtectedRoute roles={["ADMIN","PRODUCTIONMANAGER","MANAGER"]} departments={["Production"]}>
            <ProductionPlanningPage />
          </StockProtectedRoute>
        } />
        <Route path='finished-goods' element={
          <StockProtectedRoute roles={["ADMIN","PRODUCTIONMANAGER","STOREKEEPER","ACCOUNTANT"]} departments={["Production","Warehouse","Finance"]}>
            <FinishedGoodsPage />
          </StockProtectedRoute>
        } />
        <Route path='production-reports' element={
          <StockProtectedRoute roles={["ADMIN","PRODUCTIONMANAGER","MANAGER","ACCOUNTANT"]} departments={["Production","Finance"]}>
            <ProductionReportsPage />
          </StockProtectedRoute>
        } />
        <Route path='Material-consumptions' element={
          <StockProtectedRoute roles={["ADMIN","PRODUCTIONMANAGER","STOREKEEPER","ACCOUNTANT"]} departments={["Production","Warehouse","Finance"]}>
            <MaterialConsumptionPage />
          </StockProtectedRoute>
        } />
        <Route path='production-cycle' element={
          <StockProtectedRoute roles={["ADMIN","PRODUCTIONMANAGER","MANAGER"]} departments={["Production"]}>
            <ProductionCyclePage />
          </StockProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
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
      </AppProvider>
    </AuthProvider>
  );
}

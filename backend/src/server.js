import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initFirebase } from '../utils/firebase.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import rxRoutes from './routes/rx.routes.js';
import pharmacyRoutes from './routes/pharmacy.routes.js';
import callcenterRoutes from './routes/callcenter.routes.js';
import statusRoutes from './routes/status.routes.js'; // ✅ add thi
//import dispenseRouter from"./routes/stock/dispense.routes.js";
import productRouter from './routes/stock/product.routes.js';
import purchaseRouter from './routes/stock/purchase.routes.js';
import dispenseRouter from './routes/stock/dispense.routes.js';
import transferRouter from './routes/stock/transfer.routes.js';
import journalRouter from './routes/stock/journal.routes.js';
import productSettingRouter from './routes/stock/productSetting.routes.js';
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
// import stockAdminRoutes from "./routes/stock/StockAdmin.routes.js";
import purchaseRoutes from './routes/stock/purchase.routes.js';
import supplierRoutes from './routes/stock/supplier.routes.js';
import supplierInvoiceRoutes from './routes/stock/supplierInvoice.routes.js';
import customerRoutes from './routes/stock/customer.routes.js';
import customerInvoiceRoutes from './routes/stock/customerInvoice.routes.js';
import paymentRoutes from './routes/stock/payment.routes.js';

dotenv.config();

// Initialize Firebase
await initFirebase(process.env.SERVICE_ACCOUNT_PATH);

const app = express();

// Middlewares
app.use(
  helmet(),
  express.json(),
  express.urlencoded({ extended: true }),
  cors({ origin: process.env.CORS_ORIGIN || '*' }),
  morgan('dev')
);

// Health check
app.get('/api/v1/health', (_req, res) => res.json({ ok: true }));

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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

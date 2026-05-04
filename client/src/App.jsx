import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './pages/Public/PublicLayout'; 
import AdminLayout from './components/layout/AdminLayout';

// Auth & Public Pages
import Login from './pages/auth/login'; 
import Signup from './pages/auth/signup';
import Welcome from './pages/Public/Welcome';
import Overview from './pages/Public/PublicOverview';
import Ledger from './pages/Public/PublicTL';
import Documents from './pages/Public/PublicDocu';

// Admin Pages (Ensure each one is here ONLY ONCE)
import AdminOverview from './pages/admin/AdminOverview';
import ValidationCenter from './pages/admin/ValidationCenter';
import BudgetAllocation from './pages/admin/BudgetAllocation';
import RecordExpense from './pages/admin/RecordExpense';
import UserMngmnt from './pages/admin/UserMngmnt';
import TransactionLedger from './pages/admin/TransactionLedger';
import DocumentMngmt from './pages/admin/DocumentMngmt';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Standalone Pages (No Dashboard Header) */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        
        {/* 2. DITO MO IDADAGDAG YUNG ADMIN ROUTE MO: */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="overview" element={<AdminOverview />} />
          <Route path="validation" element={<ValidationCenter />} />
          <Route path="budget-allocation" element={<BudgetAllocation />} />
          <Route path="record-expense" element={<RecordExpense />} />
          <Route path="user-management" element={<UserMngmnt />} />
          <Route path="transaction-ledger" element={<TransactionLedger />} />
          <Route path="documents" element={<DocumentMngmt />} />  
        </Route>

        {/* Redirect root (/) to the Welcome splash screen */}
        <Route path="/" element={<Navigate to="/welcome" replace />} />

        {/* 2. Public Dashboard Group (Uses PublicLayout with Tabs) */}
        <Route path="/public" element={<PublicLayout />}>
          {/* These child routes render inside the <Outlet /> of PublicLayout */}
          <Route path="overview" element={<Overview />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="documents" element={<Documents />} />
          
          {/* Default to Overview if someone visits /public directly */}
          <Route index element={<Navigate to="overview" replace />} />
        </Route>

        {/* 3. Safety Catch-All Route */}
        {/* If any URL is typed incorrectly, redirect back to Welcome instead of a blank screen */}
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
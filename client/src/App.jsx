import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts and Pages
import AdminOverview from './pages/admin/AdminOverview';
import ValidationCenter from './pages/admin/ValidationCenter';
import PublicLayout from './pages/Public/PublicLayout'; 
import Overview from './pages/Public/PublicOverview';
import Welcome from './pages/Public/Welcome';
import Ledger from './pages/Public/PublicTL';
import Documents from './pages/Public/PublicDocu';
import Login from './pages/auth/login'; 
import Signup from './pages/auth/signup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Standalone Pages (No Dashboard Header) */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        
        {/* 2. DITO MO IDADAGDAG YUNG ADMIN ROUTE MO: */}
        <Route path="/admin/overview" element={<AdminOverview />} />
        <Route path="/admin/validation" element={<ValidationCenter />} />
        
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
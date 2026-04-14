import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Overview from './pages/Public/Overview';
import Ledger from './pages/Public/Ledger';
import Documents from './pages/Public/Documents';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The PublicLayout contains your Header and Nav Tabs */}
        <Route path="/" element={<Navigate to="/public/overview" replace />} />
        <Route path="/public" element={<PublicLayout />}>
          <Route path="overview" element={<Overview />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="documents" element={<Documents />} />
          
          {/* Default to Overview if someone just goes to /public */}
          <Route index element={<Navigate to="overview" />} />
        </Route>

        {/* You can add your Admin/Validator login routes here later */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
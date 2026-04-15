import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from './pages/Public/PublicLayout'; 
import Overview from './pages/Public/PublicOverview';
import Ledger from './pages/Public/PublicTL';
import Documents from './pages/Public/PublicDocu';

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
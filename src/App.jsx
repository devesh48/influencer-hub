import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicProfilePage from './features/profile/public/PublicProfilePage';
import DashboardLayout from './components/layout/DashboardLayout';
import StorePage from './features/profile/dashboard/StorePage';
import AnalyticsPage from './features/profile/dashboard/AnalyticsPage';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public facing link-in-bio style page */}
        <Route path="/:username" element={<PublicProfilePage />} />

        {/* Creator dashboard – protected in real app */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<StorePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="appearance" element={<div>Appearance editor (todo)</div>} />
          <Route path="settings" element={<div>Settings (todo)</div>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
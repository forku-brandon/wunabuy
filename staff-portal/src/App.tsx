import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStaffAuth } from './stores/staffAuthStore';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarNav } from './components/layout/SidebarNav';
import { Header } from './components/layout/Header';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { KYCPage } from './pages/KYCPage';
import { DisputesPage } from './pages/DisputesPage';
import { LogisticsOpsPage } from './pages/LogisticsOpsPage';
import { UsersPage } from './pages/UsersPage';
import { FinancialsPage } from './pages/FinancialsPage';
import { MarketingPage } from './pages/MarketingPage';
import { CommunicationsPage } from './pages/CommunicationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { StaffProfilePage } from './pages/StaffProfilePage';
import { HROpsPage } from './pages/HROpsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useStaffAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <SidebarNav
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<StaffProfilePage />} />
          <Route path="/communications" element={<CommunicationsPage />} />
          <Route path="/hr" element={<HROpsPage />} />
          <Route path="/kyc" element={<KYCPage />} />
          <Route path="/disputes" element={<DisputesPage />} />
          <Route path="/logistics" element={<LogisticsOpsPage />} />
          <Route path="/financials" element={<FinancialsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/marketing" element={<MarketingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;

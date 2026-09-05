import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStaffAuth } from './stores/staffAuthStore';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { SidebarNav } from './components/layout/SidebarNav';
import { Header } from './components/layout/Header';
import { PermissionGuard } from './components/layout/PermissionGuard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useSessionTimeout } from './hooks/useSessionTimeout';

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
import { CalendarPage } from './pages/CalendarPage';
import { NotificationsPage } from './pages/NotificationsPage';

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

  // OWASP A04: Automatic 15-Minute Session Idle Timeout Guard
  useSessionTimeout();

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
          <Route
            path="/"
            element={
              <PermissionGuard permission="view_dashboard">
                <DashboardPage />
              </PermissionGuard>
            }
          />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<StaffProfilePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/communications" element={<CommunicationsPage />} />
          <Route
            path="/hr"
            element={
              <PermissionGuard permission="view_hr_ops">
                <HROpsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="/kyc"
            element={
              <PermissionGuard permission="view_kyc">
                <KYCPage />
              </PermissionGuard>
            }
          />
          <Route
            path="/disputes"
            element={
              <PermissionGuard permission="view_disputes">
                <DisputesPage />
              </PermissionGuard>
            }
          />
          <Route
            path="/logistics"
            element={
              <PermissionGuard permission="view_logistics">
                <LogisticsOpsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="/financials"
            element={
              <PermissionGuard permission="view_financials">
                <FinancialsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="/users"
            element={
              <PermissionGuard permission="manage_users">
                <UsersPage />
              </PermissionGuard>
            }
          />
          <Route
            path="/marketing"
            element={
              <PermissionGuard permission="manage_marketing">
                <MarketingPage />
              </PermissionGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <PermissionGuard permission="manage_settings">
                <SettingsPage />
              </PermissionGuard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/*" element={<ProtectedLayout />} />
              </Routes>
            </BrowserRouter>
          </QueryClientProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;

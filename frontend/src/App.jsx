import { Navigate, Route, Routes } from 'react-router-dom';
import CyberBackground from './components/background/CyberBackground.jsx';
import ToastStack from './components/ui/ToastStack.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AdminSocDashboardPage from './pages/AdminSocDashboardPage.jsx';
import AttackSimulationPage from './pages/AttackSimulationPage.jsx';
import BankingDashboardPage from './pages/BankingDashboardPage.jsx';
import EmailAlertCenterPage from './pages/EmailAlertCenterPage.jsx';
import EmailVerificationPage from './pages/EmailVerificationPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LiveSecurityMonitorPage from './pages/LiveSecurityMonitorPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TransactionPage from './pages/TransactionPage.jsx';
import { useBehaviorTracking } from './hooks/useBehaviorTracking.js';

function App() {
  useBehaviorTracking();

  return (
    <div className="min-h-screen overflow-x-hidden bg-obsidian text-slate-100">
      <CyberBackground fixed />
      <ToastStack />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/banking"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BankingDashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/monitor"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <LiveSecurityMonitorPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout admin>
                <AdminSocDashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/simulation"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout admin>
                <AttackSimulationPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <DashboardLayout admin>
                <EmailAlertCenterPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TransactionPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/banking" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;

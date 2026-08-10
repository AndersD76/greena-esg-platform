import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminGuard } from './components/AdminGuard';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Questionnaire from './pages/Questionnaire';
import Results from './pages/Results';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Insights from './pages/Insights';
import Certificate from './pages/Certificate';
import Consultations from './pages/Consultations';
import ConsultationRoom from './pages/ConsultationRoom';
import Contact from './pages/Contact';
import UserManual from './pages/UserManual';
import Checkout from './pages/Checkout';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import LGPD from './pages/LGPD';
import Cookies from './pages/Cookies';
import Compliance from './pages/Compliance';
import {
  AdminDashboard,
  AdminUsers,
  AdminConsultations,
  AdminSubscriptions,
  AdminDiagnoses,
  AdminReports
} from './pages/admin';
import SimplifiedQuestionnaire from './pages/SimplifiedQuestionnaire';
import PublicProfile from './pages/PublicProfile';
import StakeholderReport from './pages/StakeholderReport';
import AiChat from './pages/AiChat';
import { usePageTracking } from './hooks/usePageTracking';
import { usePlan } from './hooks/usePlan';
import UpgradeRequired from './components/UpgradeRequired';
import FrameworkSelector from './components/FrameworkSelector';
import { useEffect, useState, useCallback } from 'react';
import Onboarding from './components/Onboarding';
import CookieConsent from './components/CookieConsent';
import { initAnalytics } from './lib/analytics';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

/**
 * Rota exclusiva de planos pagos. O bloqueio real é feito no backend
 * (middleware requirePaidPlan); aqui evitamos que o usuário do plano gratuito
 * chegue à tela por link direto, banner do dashboard ou URL digitada.
 */
function PaidRoute({ children }: { children: React.ReactNode }) {
  const { isFreePlan, loading } = usePlan();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isFreePlan ? <UpgradeRequired /> : <>{children}</>;
}

function NewDiagnosisRedirect() {
  const { isFreePlan, loading: planLoading } = usePlan();

  if (planLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return <FrameworkSelector isFreePlan={isFreePlan} />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function needsOnboarding(user: any) {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'superadmin') return false;
  const key = `@greena:onboarding_done:${user.id}`;
  if (localStorage.getItem(key)) return false;
  return !user.companyName || !user.sector || !user.companySize;
}

function AppRoutes() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const hideMainLayout = pathname === '/checkout' || pathname.includes('/stakeholder-report') || pathname.startsWith('/empresa/') || pathname.startsWith('/admin');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && needsOnboarding(user)) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [user]);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
    if (user) {
      localStorage.setItem(`@greena:onboarding_done:${user.id}`, 'true');
    }
  }, [user]);

  usePageTracking();

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {user && !hideMainLayout && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/manual" element={<PrivateRoute><UserManual /></PrivateRoute>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/lgpd" element={<LGPD />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/empresa/:slug" element={<PublicProfile />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/diagnosis/new"
            element={
              <PrivateRoute>
                <NewDiagnosisRedirect />
              </PrivateRoute>
            }
          />
          <Route
            path="/diagnosis/:diagnosisId/questionnaire"
            element={
              <PrivateRoute>
                <PaidRoute>
                  <Questionnaire />
                </PaidRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/diagnosis/:diagnosisId/simplified-questionnaire"
            element={
              <PrivateRoute>
                <SimplifiedQuestionnaire />
              </PrivateRoute>
            }
          />
          <Route
            path="/diagnosis/:diagnosisId/results"
            element={
              <PrivateRoute>
                <PaidRoute>
                  <Results />
                </PaidRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <PaidRoute>
                  <Reports />
                </PaidRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <PrivateRoute>
                <PaidRoute>
                  <Insights />
                </PaidRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/diagnosis/:diagnosisId/insights"
            element={
              <PrivateRoute>
                <PaidRoute>
                  <Insights />
                </PaidRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/certificate/:certificateId"
            element={
              <PrivateRoute>
                <Certificate />
              </PrivateRoute>
            }
          />
          <Route
            path="/diagnosis/:diagnosisId/stakeholder-report"
            element={
              <PrivateRoute>
                <PaidRoute>
                  <StakeholderReport />
                </PaidRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/ai-chat"
            element={
              <PrivateRoute>
                <PaidRoute>
                  <AiChat />
                </PaidRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/consultations"
            element={
              <PrivateRoute>
                <PaidRoute>
                  <Consultations />
                </PaidRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="/consultations/:id"
            element={
              <PrivateRoute>
                <PaidRoute>
                  <ConsultationRoom />
                </PaidRoute>
              </PrivateRoute>
            }
          />
          {/* Admin Routes with Sidebar Layout */}
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="diagnoses" element={<AdminDiagnoses />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="consultations" element={<AdminConsultations />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>
        </Routes>
      </main>
      {user && !hideMainLayout && <Footer />}
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <CookieConsent />
    </div>
  );
}

function App() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

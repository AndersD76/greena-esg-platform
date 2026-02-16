import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
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
import Report from './pages/Report';
import Consultations from './pages/Consultations';
import ConsultationRoom from './pages/ConsultationRoom';
import Contact from './pages/Contact';
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
import { diagnosisService } from './services/diagnosis.service';
import { subscriptionService } from './services/subscription.service';
import { useEffect, useState } from 'react';

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

function NewDiagnosisRedirect() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verificando plano...');

  useEffect(() => {
    async function createDiagnosis() {
      try {
        // Verificar plano do usuário
        const activePlan = await subscriptionService.getActivePlan();
        const isFreePlan = activePlan.isFreePlan;

        setStatus('Criando diagnóstico...');
        const diagnosis = await diagnosisService.create();

        if (isFreePlan) {
          navigate(`/diagnosis/${diagnosis.id}/simplified-questionnaire`);
        } else {
          navigate(`/diagnosis/${diagnosis.id}/questionnaire`);
        }
      } catch (error) {
        console.error('Erro ao criar diagnóstico:', error);
        navigate('/dashboard');
      }
    }
    createDiagnosis();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
        <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>{status}</p>
      </div>
    </div>
  );
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

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {user && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/lgpd" element={<LGPD />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/compliance" element={<Compliance />} />
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
                <Questionnaire />
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
                <Results />
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
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <PrivateRoute>
                <Insights />
              </PrivateRoute>
            }
          />
          <Route
            path="/diagnosis/:diagnosisId/insights"
            element={
              <PrivateRoute>
                <Insights />
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
            path="/diagnosis/:diagnosisId/report"
            element={
              <PrivateRoute>
                <Report />
              </PrivateRoute>
            }
          />
          <Route
            path="/consultations"
            element={
              <PrivateRoute>
                <Consultations />
              </PrivateRoute>
            }
          />
          <Route
            path="/consultations/:id"
            element={
              <PrivateRoute>
                <ConsultationRoom />
              </PrivateRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminGuard>
                <AdminUsers />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/consultations"
            element={
              <AdminGuard>
                <AdminConsultations />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/subscriptions"
            element={
              <AdminGuard>
                <AdminSubscriptions />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/diagnoses"
            element={
              <AdminGuard>
                <AdminDiagnoses />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminGuard>
                <AdminReports />
              </AdminGuard>
            }
          />
        </Routes>
      </main>
      {user && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
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
import About from './pages/About';
import Solutions from './pages/Solutions';
import Contact from './pages/Contact';
import { diagnosisService } from './services/diagnosis.service';
import { useEffect } from 'react';

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

  useEffect(() => {
    async function createDiagnosis() {
      try {
        const diagnosis = await diagnosisService.create();
        navigate(`/diagnosis/${diagnosis.id}/questionnaire`);
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
        <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>Criando diagnóstico...</p>
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
          <Route path="/about" element={<About />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/contact" element={<Contact />} />
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

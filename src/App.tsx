import { useEffect, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import MonthViewPage from './pages/MonthViewPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TasksProvider } from './contexts/TasksContext';
import { ProjectsProvider } from './contexts/ProjectsContext';
import { useLoading } from './contexts/LoadingContext';
import { Analytics } from '@vercel/analytics/react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading, login } = useAuth();
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(loading);
  }, [loading, setLoading]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      login();
    }
  }, [loading, isAuthenticated, login]);

  if (!isAuthenticated) {
    return null; // vai redirecionar via login()
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Layout>
              <MonthViewPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/week"
        element={
          <ProtectedRoute>
            <Layout>
              <MonthViewPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/:projectId"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="surface-panel max-w-md rounded-2xl bg-white p-8 text-center">
              <h1 className="text-5xl font-bold text-slate-900">404</h1>
              <p className="mt-2 text-sm text-slate-500">Pagina nao encontrada.</p>
              <a
                href="/"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#2f6fb2] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#225587]"
              >
                Voltar para a home
              </a>
            </div>
          </div>
        }
      />
    </Routes>

  )
}

const App = () => {
  return (
    <>
      <Analytics />
      <AuthProvider>
        <Router>
          <ProjectsProvider>
            <TasksProvider>
              <AppRoutes />
            </TasksProvider>
          </ProjectsProvider>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App

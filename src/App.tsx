import { useEffect, useState, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { toast } from 'sonner';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import MonthViewPage from './pages/MonthViewPage';
import SettingsProfilePage from './pages/SettingsProfilePage';
import SettingsCustomFieldsPage from './pages/SettingsCustomFieldsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TasksProvider, useTasksContext } from './contexts/TasksContext';
import { ProjectsProvider, useProjectsContext } from './contexts/ProjectsContext';
import { CustomFieldDefinitionsProvider, useCustomFieldDefinitionsContext } from './contexts/CustomFieldDefinitionsContext';
import { useLoading } from './contexts/LoadingContext';
import { Analytics } from '@vercel/analytics/react';

const BootstrapGate = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { fetchProjects } = useProjectsContext();
  const { fetchTasks } = useTasksContext();
  const { fetchCustomFieldDefinitions } = useCustomFieldDefinitionsContext();
  const { setLoading } = useLoading();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsReady(false);
      return;
    }

    let isMounted = true;
    setLoading(true, 'bootstrap');

    void (async () => {
      const results = await Promise.allSettled([
        fetchProjects(),
        fetchTasks(),
        fetchCustomFieldDefinitions(),
      ]);
      const failedResult = results.find((result) => result.status === 'rejected');

      if (failedResult?.status === 'rejected') {
        const error = failedResult.reason as any;
        toast.error(error?.message ?? 'Erro ao carregar dados iniciais');
      }

      if (isMounted) {
        setIsReady(true);
      }
      setLoading(false, 'bootstrap');
    })();

    return () => {
      isMounted = false;
      setLoading(false, 'bootstrap');
    };
  }, [fetchCustomFieldDefinitions, fetchProjects, fetchTasks, isAuthenticated, setLoading]);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
};

const AuthenticatedApp = () => {
  const { isAuthenticated, loading, login } = useAuth();
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(loading, 'auth');
  }, [loading, setLoading]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      login();
    }
  }, [loading, isAuthenticated, login]);

  if (!isAuthenticated) {
    return null; // vai redirecionar via login()
  }

  return (
    <BootstrapGate>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/calendar"
          element={
            <Layout>
              <MonthViewPage />
            </Layout>
          }
        />
        <Route
          path="/week"
          element={
            <Layout>
              <MonthViewPage />
            </Layout>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <Layout>
              <ProjectsPage />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <SettingsProfilePage />
            </Layout>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <Layout>
              <SettingsProfilePage />
            </Layout>
          }
        />
        <Route
          path="/settings/custom-fields"
          element={
            <Layout>
              <SettingsCustomFieldsPage />
            </Layout>
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
    </BootstrapGate>
  );
};

const AppRoutes = () => {
  return <AuthenticatedApp />;
};

const App = () => {
  return (
    <>
      <Analytics />
      <AuthProvider>
        <Router>
          <ProjectsProvider>
            <TasksProvider>
              <CustomFieldDefinitionsProvider>
                <AppRoutes />
              </CustomFieldDefinitionsProvider>
            </TasksProvider>
          </ProjectsProvider>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App

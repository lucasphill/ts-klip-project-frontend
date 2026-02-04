import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import WeekViewPage from './pages/WeekViewPage';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
    </>
  );
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
        path="/week"
        element={
          <ProtectedRoute>
            <Layout>
              <WeekViewPage />
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
      {/* 404 page */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-4">Page not found</p>
            <a href="/" className="btn btn-primary">Voltar para home</a>
          </div>
        </div>
      }
      />
    </Routes>

  )
}

const App = () => {
  return (
    // <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
    // </AuthProvider>
  )
}

export default App

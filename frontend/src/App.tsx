import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LessonViewerPage from './pages/LessonViewerPage';
import QuizPage from './pages/QuizPage';
import CreateCoursePage from './pages/CreateCoursePage';
import EditCoursePage from './pages/EditCoursePage';
import VerifyCertificatePage from './pages/VerifyCertificatePage';

import type { ReactNode } from 'react';

function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  return <div key={location.pathname} className="route-transition">{children}</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1a1a2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* Public routes (no navbar for auth pages) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify/:code" element={<VerifyCertificatePage />} />

          {/* Routes with Navbar */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main className="flex-1">
                <RouteTransition>
                  <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/courses" element={<CourseCatalogPage />} />
                  <Route path="/courses/:id" element={<CourseDetailPage />} />

                  {/* Protected: any logged-in user */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/lessons/:id" element={<ProtectedRoute><LessonViewerPage /></ProtectedRoute>} />
                  <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />

                  {/* Instructor only */}
                  <Route path="/instructor/courses/new" element={
                    <RoleRoute allowedRoles={['instructor']}>
                      <CreateCoursePage />
                    </RoleRoute>
                  } />
                  <Route path="/instructor/courses/:id/edit" element={
                    <RoleRoute allowedRoles={['instructor']}>
                      <EditCoursePage />
                    </RoleRoute>
                  } />

                  <Route path="*" element={
                    <div className="page-container text-center py-20">
                      <p className="text-6xl font-bold text-slate-700 mb-4">404</p>
                      <p className="text-slate-400">Page not found</p>
                    </div>
                  } />
                  </Routes>
                </RouteTransition>
              </main>
            </>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

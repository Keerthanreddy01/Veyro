import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import SmoothScroll from './components/SmoothScroll';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute';

import LandingPage from './pages/LandingPage';
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
      <SmoothScroll />
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
          {/* Landing page - public */}
          <Route path="/" element={<LandingPage />} />
          
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
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/courses" element={<CourseCatalogPage />} />
                    <Route path="/courses/:id" element={<CourseDetailPage />} />
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
                      <div className="page-container text-center py-24 animate-fade-in">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-black/10">
                          <span className="font-syne font-extrabold text-2xl text-slate-800">404</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Page Not Found</h1>
                        <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6">The curriculum or destination you requested does not exist or has been relocated.</p>
                        <Link to="/courses" className="btn-dark-pill text-xs">
                          <span>Explore Courses</span>
                        </Link>
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

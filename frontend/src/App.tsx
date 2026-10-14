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
          style: {
            background: '#171717',
            color: '#FFFFFF',
            border: '1px solid #E7E2DA',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'Manrope, sans-serif',
          },
          success: { iconTheme: { primary: '#556943', secondary: '#fff' } },
          error: { iconTheme: { primary: '#BE123C', secondary: '#fff' } },
        }}
      />
      <div className="min-h-screen flex flex-col bg-[#FAF8F4] font-sans">
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
                      <div className="page-container text-center py-24 animate-fade-in font-sans">
                        <div className="w-16 h-16 rounded-2xl bg-[#F6F2EC] border border-[#E7E2DA] flex items-center justify-center mx-auto mb-4">
                          <span className="font-serif text-2xl text-[#171717]">404</span>
                        </div>
                        <h1 className="font-serif text-3xl font-normal text-[#171717] mb-2">Page Not Found</h1>
                        <p className="text-[#77736D] text-xs max-w-sm mx-auto mb-6">The curriculum or destination you requested does not exist or has been relocated.</p>
                        <Link to="/courses" className="btn-primary text-xs">
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

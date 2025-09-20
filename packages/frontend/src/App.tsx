import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { Sidebar } from './components/Sidebar';
import { AboutPage } from './pages/AboutPage';
import { AuthCallback } from './pages/AuthCallback';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ProjectPage } from './pages/ProjectPage';
import { ProtectedRoute } from './ProtectedRoute';
import { SessionProvider } from './providers/SessionProvider';

function App() {
  return (
    <SessionProvider>
      <Router>
        <Routes>
          {/* Public routes without sidebar */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/callback" element={<AuthCallback />} />

          {/* Protected routes with sidebar */}
          <Route path="/*" element={
            <AppLayout sidebar={<Sidebar />}>
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={<ProtectedRoute><div>Settings</div></ProtectedRoute>} />
                <Route path="/help" element={<ProtectedRoute><div>Help</div></ProtectedRoute>} />
                <Route path="/manage-users" element={<ProtectedRoute><div>Manage Users</div></ProtectedRoute>} />
                <Route path="/about" element={
                  <ProtectedRoute>
                    <AboutPage />
                  </ProtectedRoute>
                } />
                <Route path="/projects/:projectId" element={
                  <ProtectedRoute>
                    <ProjectPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </AppLayout>
          } />
        </Routes>
      </Router>
    </SessionProvider>
  );
}

export { App };

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { AboutPage } from './pages/AboutPage';
import { AuthCallback } from './pages/AuthCallback';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';
import { SessionProvider } from './SessionContext';

function App() {
  return (
    <SessionProvider>
      <Router>
        <AppLayout
          sidebar={<div className="p-4 font-bold">Prompt Kitchen</div>}
        >
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/about" element={
              <ProtectedRoute>
                <AboutPage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/oauth/callback" element={<AuthCallback />} />
          </Routes>
        </AppLayout>
      </Router>
    </SessionProvider>
  );
}

export { App };

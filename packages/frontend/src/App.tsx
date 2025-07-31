import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { AboutPage } from './pages/AboutPage';
import { AuthCallback } from './pages/AuthCallback';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SessionProvider } from './SessionContext';

function App() {
  return (
    <SessionProvider>
      <Router>
        <AppLayout
          sidebar={<div className="p-4 font-bold">Prompt Kitchen</div>}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </AppLayout>
      </Router>
    </SessionProvider>
  );
}

export { App };

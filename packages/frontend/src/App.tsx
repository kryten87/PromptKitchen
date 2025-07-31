import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { AboutPage } from './pages/AboutPage';
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
          </Routes>
        </AppLayout>
      </Router>
    </SessionProvider>
  );
}

export { App };

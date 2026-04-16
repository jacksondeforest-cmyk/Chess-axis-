
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/context/ThemeContext';
import LandingPage from '@/pages/LandingPage';
import DashboardPage from '@/pages/DashboardPage';
import GuidePage from '@/pages/GuidePage';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/player/:platform/:username" element={<DashboardPage />} />
          <Route path="/guide" element={<GuidePage />} />
        </Routes>
        <Toaster richColors position="bottom-right" />
      </BrowserRouter>
    </ThemeProvider>
  );
}

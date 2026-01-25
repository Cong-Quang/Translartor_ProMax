import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './layouts/Layout';
import { HomePage } from './pages/Home';
import { AboutPage } from './pages/About/AboutPage';
import { MeetingNew } from './pages/Meeting/MeetingNew';
import { JoinMeeting } from './pages/Meeting/JoinMeeting';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { UserProfile } from './pages/Profile/UserProfile';
import { ConfigProvider } from './context/ConfigContext';

// Placeholder Pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full relative z-10" style={{ color: '#ffffff' }}>
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p>Đang được phát triển...</p>
  </div>
);

function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Placeholder title="Đăng nhập" />} />

          {/* Main App Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/meeting-new" element={<MeetingNew />} />
            <Route path="/join" element={<JoinMeeting />} />
            <Route path="/schedule" element={<Placeholder title="Lên lịch" />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/guide" element={<Placeholder title="Hướng dẫn" />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>


          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

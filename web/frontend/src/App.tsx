
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './layouts/Layout';
import { HomePage } from './pages/Home';

// Placeholder Pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full relative z-10" style={{ color: '#ffffff' }}>
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p>Đang được phát triển...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Placeholder title="Đăng nhập" />} />

        {/* Main App Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/meeting-new" element={<Placeholder title="Tạo phòng họp" />} />
          <Route path="/join" element={<Placeholder title="Tham gia phòng" />} />
          <Route path="/schedule" element={<Placeholder title="Lên lịch" />} />
          <Route path="/settings" element={<Placeholder title="Cài đặt" />} />
          <Route path="/guide" element={<Placeholder title="Hướng dẫn" />} />
          <Route path="/about" element={<Placeholder title="Giới thiệu" />} />
          <Route path="/profile" element={<Placeholder title="Thông tin người dùng" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

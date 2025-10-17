import { Suspense, useEffect } from "react";
import {
  useRoutes,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Home from "./components/home";
import ProgressPage from "./pages/progress";
import CreatePost from "./pages/create-post";
import LoginPage from "./pages/login";
import { ToastContainer } from "react-toastify";
import Navigation from "./components/Navigation";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuthStore } from "./store/authStore";
function App() {
  // Initialize authentication
  const { isAuthenticated, isLoading } = useAuthStore();
  console.log("App isLoading:", isLoading);
  // Hiển thị loading khi đang kiểm tra authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải ứng dụng...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<p>Đang tải...</p>}>
      {/* Hiển thị Navigation khi đã đăng nhập và không ở trang login */}
      {isAuthenticated && <Navigation />}

      <Routes>
        {/* Trang login - không cần bảo vệ */}
        <Route path="/login" element={<LoginPage />} />

        {/* Các trang được bảo vệ - cần đăng nhập */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-post"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />

        {/* Route mặc định - redirect về login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer />
    </Suspense>
  );
}

export default App;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuthStore } from "@/store/authStore";

interface LoginCredentials {
  username: string;
  password: string;
}
interface response {
  error: boolean;
  message?: string;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with your actual authentication logic
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await login(credentials.username, credentials.password);

      if (response.error) {
        toast.error(response.message || "Đăng nhập thất bại!");
      } else {
        toast.success(`Đăng nhập thành công!`);
        navigate("/"); // Redirect to home page after login
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Đăng nhập vào tài khoản của bạn
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Thông tin đăng nhập demo: admin@example.com / password123
          </p>
        </div>

        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
      </div>
    </div>
  );
}

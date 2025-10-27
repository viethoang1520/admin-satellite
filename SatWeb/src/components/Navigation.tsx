import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  SquarePlus,
  FolderKanban,
  LogOut,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

const Navigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Trang chủ",
      path: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
      action: () => navigate("/"),
    },
    {
      name: "Thêm website vệ tinh",
      path: "/create-site",
      icon: <SquarePlus className="h-5 w-5" />,
      action: () => navigate("/create-site"),
    },
    {
      name: "Quản lý website vệ tinh",
      path: "/viewSat",
      icon: <FolderKanban className="h-5 w-5" />,
      action: () => navigate("/viewSat"),
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-50 via-white to-blue-50 border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">
        {/* Logo */}
        <h1 className="text-xl font-bold text-black tracking-tight">
          Auto Post
        </h1>

        {/* Nav Items */}
        <nav className="hidden md:flex items-center space-x-3">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={item.action}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                window.location.pathname === item.path
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-blue-100 hover:text-blue-700"
              )}
            >
              {item.icon}
              {item.name}
            </button>
          ))}

          {/* Auth Section */}
          <div className="border-l border-gray-300 pl-4 ml-2">
            {!isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
              >
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;

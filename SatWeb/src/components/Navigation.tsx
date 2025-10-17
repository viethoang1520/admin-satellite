import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart2,
  FileText,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  console.log("Navigation isAuthenticated:", isAuthenticated);
  const authData = localStorage.getItem("auth-storage");
  const scrollToPosts = () => {
    const postsSection = document.getElementById("posts-section");
    if (postsSection) {
      postsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

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
  ];
  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 
             flex justify-between items-center 
             w-[500px] px-4 py-2
             bg-transparent backdrop-blur-lg
             border-8 border-white/20 shadow-lg
             rounded-2xl"
    >
      <div className="flex items-center">
        <h1 className="text-xl font-bold">Auto Post</h1>
      </div>
      <nav className="hidden md:flex items-center space-x-4">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={item.action}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              window.location.pathname === item.path ||
                (item.path === "#posts-section" &&
                  window.location.pathname === "/")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <span className="mr-2">{item.icon}</span>
            {item.name}
          </button>
        ))}

        {/* User Authentication Section */}
        <div className="border-l pl-4 ml-2">
          {!isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navigation;

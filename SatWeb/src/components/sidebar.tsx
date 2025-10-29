import React, { useState } from "react";
import { Menu, X, Home, PlusSquare, List, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Trang chủ", icon: Home },
    { to: "/create-post", label: "Đăng bài", icon: PlusSquare },
    { to: "/progress", label: "Tiến trình", icon: List },
    { to: "/create-site", label: "Tạo website mới", icon: Settings },
    { to: "/viewSat", label: "Xem website", icon: Settings },
    { to: "/help/app-password", label: "Application Password", icon: Settings },
  ];

  return (
    <>
      {/* Header nhỏ có nút menu */}
      <div className="md:hidden   top-0 left-0 w-full z-40 bg-white border-b flex items-center justify-between px-4 py-2 shadow-sm">
        <h1 className="font-semibold text-lg text-primary">Auto Post</h1>
        <button onClick={() => setOpen(!open)} className="p-2">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar trượt */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-40 md:hidden`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">Menu</h2>
          <button onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col p-2 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition ${
                location.pathname === to ? "bg-gray-100 font-semibold" : ""
              }`}
              onClick={() => setOpen(false)}
            >
              <Icon size={20} className="mr-3" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

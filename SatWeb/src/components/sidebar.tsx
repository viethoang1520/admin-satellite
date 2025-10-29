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
      {/* Header nhỏ có nút menu (mobile) */}
      <div className="md:hidden top-0 left-0 w-full z-40 bg-black border-b border-gray-800 flex items-center justify-between px-4 py-2 shadow-sm">
        <h1 className="font-semibold text-lg text-white">Auto Post</h1>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 bg-gray-800 rounded text-white hover:bg-gray-700"
        >
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

      {/* Sidebar trượt (mobile) */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-black text-white shadow-lg transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-40 md:hidden`}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="font-semibold text-lg">Menu</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-gray-300 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col p-2 space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center p-3 rounded-lg transition ${
                  active
                    ? "bg-gray-700 font-semibold text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={20} className="mr-3" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

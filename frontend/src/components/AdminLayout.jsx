import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import "../styles/adminLayout.css";

const AdminLayout = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation(); // 🔥 Active highlight magic

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showSidebar &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setShowSidebar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showSidebar]);

  const menuItems = [
    { name: "Dashboard", path: "/admin-dashboard" },
    { name: "Students", path: "/students" },
    { name: "Feedback", path: "/feedbacks" },
    { name: "Reports", path: "/reports" },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`sidebar ${showSidebar ? "show" : ""}`}
      >
        <div>
          <h2 className="logo">EduPulse</h2>

          <div className="admin-profile">
            <img
              src="/student-avatar.png"
              alt="Admin"
              className="admin-avatar"
            />
            <p className="admin-name">Admin</p>
          </div>

          <ul className="menu">
            {menuItems.map((item) => (
              <li
                key={item.path}
                className={
                  location.pathname === item.path ? "active" : ""
                }
                onClick={() => navigate(item.path)}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>

        <button className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main */}
      <main className="main-content">
        <button
          className="menu-toggle"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <Menu size={22} />
        </button>

        {children}
      </main>
    </div>
  );
};

export default AdminLayout;

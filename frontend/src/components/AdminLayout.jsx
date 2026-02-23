import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import "../styles/adminLayout.css";

const AdminLayout = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSidebar]);

  const handleLogout = () => {
    setShowSidebar(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin-dashboard" },
    { name: "Students", path: "/students" },
    { name: "Feedback", path: "/feedbacks" },
    { name: "Reports", path: "/reports" },
  ];

  return (
    <div className="admin-layout">
      <aside ref={sidebarRef} className={`admin-sidebar ${showSidebar ? "show" : ""}`}>
        <div>
          <h2 className="admin-logo">EduPulse</h2>

          <div className="admin-layout-profile">
            <img src="/student-avatar.png" alt="Admin" className="admin-layout-avatar" />
            <p className="admin-layout-name">Admin</p>
          </div>

          <ul className="admin-menu">
            {menuItems.map((item) => (
              <li
                key={item.path}
                className={location.pathname === item.path ? "active" : ""}
                onClick={() => {
                  setShowSidebar(false);
                  navigate(item.path);
                }}
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>

        <button type="button" className="admin-logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {showSidebar && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <main className="admin-main-content">
        <button
          type="button"
          className="admin-menu-toggle"
          aria-label="Toggle sidebar"
          aria-expanded={showSidebar}
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

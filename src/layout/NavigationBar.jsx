import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu_Items } from "./MenuItems";
import { NavLink } from "react-router-dom";
import logo from "../assets/icon.ico";
import settings from "../assets/settings.png";
import white from "../assets/whitese.png";
import { Menu, LogOut } from "lucide-react";
import { X } from "lucide-react";
import { useAuthContext } from "../auth/AuthContext";

const NavigationBar = () => {
  const { logout } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => setIsMobileMode(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when overlay is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = isMenuOpen ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <div className="mx-auto px-2 rounded-xl border border-white/50 bg-white/10 shadow-lg backdrop-blur-xl flex items-center justify-center min-h-[4.5rem] w-[70%]">
        <div className="flex flex-row px-5 rounded-lg items-center justify-between gap-5 w-full">
          <img src={logo} alt="logo" style={{ width: 55, height: 55 }} />

          {!isMobileMode && (
            <div className="flex flex-row gap-3">
              {Menu_Items.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.url}
                  className={({ isActive }) =>
                    `p-2 rounded-md  text-[18px] justify-self-center ${
                      isActive
                        ? "border border-white/40 backdrop-blur-2xl rounded-xl text-[#0e9dc7] bg-white/40"
                        : "hover:bg-white/30"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}

          {!isMobileMode && (
            <LogOut
              alt="settings"
              style={{ width: 45, height: 45, color: "#0e9dc7" }}
              onClick={handleLogout}
            />
          )}

          {/* Hamburger Icon - Only show on mobile */}
          {isMobileMode && (
            <button onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
              <Menu color="#0e9dc7" style={{ width: 40, height: 40 }} />
            </button>
          )}
        </div>
      </div>

      {/* Full-screen overlay rendered to <body> so it covers EVERYTHING */}
      {isMenuOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/35 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={() => setIsMenuOpen(false)}
            // safe-area padding for notches
            style={{
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <div
              // full-height, responsive-safe viewport; stop click from bubbling
              className="mx-auto flex h-dvh min-h-dvh w-full max-w-7xl flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 sm:px-6 md:px-10 md:py-6">
                <img
                  src={white}
                  alt="logo"
                  className="h-[44px] w-[44px] sm:h-[50px] sm:w-[50px] md:h-[55px] md:w-[55px]"
                />
                <button
                  className="p-2 focus:outline-none focus:ring-2 focus:ring-white/70 rounded"
                  aria-label="Close menu"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X
                    className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
                    color="#ffffff"
                  />
                </button>
              </div>

              {/* Content: centers on larger screens, scrolls on small */}
              <nav className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10">
                <ul className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 h-full">
                  {Menu_Items.map((item) => (
                    <li key={item.key}>
                      <NavLink
                        to={item.url}
                        onClick={() => setIsMenuOpen(false)}
                        className="block rounded px-3 py-2 text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white hover:bg-white/10 transition"
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default NavigationBar;

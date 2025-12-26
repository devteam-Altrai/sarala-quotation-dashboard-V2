import React, { use, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu_Items } from "./MenuItems";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/icon.ico";
import white from "../assets/whitese.png";
import se from "../assets/SE_Logo.png";
import { Menu, LogOut, X, PenLine, CloudCheck } from "lucide-react";
import { useAuthContext } from "../auth/AuthContext";
import { BASE_URL } from "../utils/AppConstant";
import settings from "../assets/settings.png";
import api from "../auth/api";
import { SlArrowDown } from "react-icons/sl";
import Avatar from "@mui/material/Avatar";

const roleItem = ["EMPLOYEE", "PROJECT MANAGER", "ADMIN"];

const NavigationBar = () => {
  const { logout, role, username } = useAuthContext();
  const SHOW_REQUEST = [import.meta.env.VITE_ROLE1];
  const BLOCK_QUOTE = [import.meta.env.VITE_ROLE1, import.meta.env.VITE_ROLE2];
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutDrawer, setIsLogoutDrawer] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState(window.innerWidth < 950);

  const [activeOffset, setActiveOffset] = useState(0);
  const [activeWidth, setActiveWidth] = useState(0);
  const [part1, setPart1] = useState("");
  const [part2, setPart2] = useState("");
  const [part3, setPart3] = useState("");

  const tabRefs = useRef([]);
  const roleContainerRef = useRef(null);

  const [loginRequests, setLoginRequests] = useState([]);
  const [formSuccess, setFormSuccess] = useState("");

  const [openRoleStates, setOpenRoleStates] = useState([]);
  const [previlage, setPrevilage] = useState("");

  const [selectedRoles, setSelectedRoles] = useState({});

  // Resize handler
  useEffect(() => {
    const handleResize = () => setIsMobileMode(window.innerWidth < 950);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Fetch the existing one
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch(`${BASE_URL}get_quote/`);
        const data = await res.json();

        if (data?.text) {
          const parts = data.text.split("-");

          setPart1(parts[2] || "");
          setPart2(parts[3] || "");
          setPart3(parts[4] || "");
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchQuote();
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen]);

  // Update sliding tab highlight
  useEffect(() => {
    const index = Menu_Items.findIndex(
      (item) => item.url === location.pathname
    );
    const el = tabRefs.current[index];
    if (el) {
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentNode.getBoundingClientRect();
      setActiveOffset(rect.left - parentRect.left);
      setActiveWidth(rect.width);
    }
  }, [location.pathname, isMobileMode]);

  const handleLogoutClick = () => {
    setIsLogoutDrawer(true);
    fetchLoginRequest();
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate("/");
  };

  const handleQuoteupdate = async () => {
    const fullQuote = `QUOTE-SE-${part1}-${part2}-${part3}`;

    const formData = new URLSearchParams();
    formData.append("text", fullQuote);

    try {
      const response = await fetch(`${BASE_URL}quote/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });
      setFormSuccess("✅ Quotation updated");
    } catch (error) {
      setFormSuccess(error.toUpperCase());
    }
  };

  const fetchLoginRequest = async () => {
    try {
      const res = await api.get("login-requests/");
      if (res.data.status === "ok") {
        setLoginRequests(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccess = async (id) => {
    const access = selectedRoles[id].trim().toLowerCase().replace(/\s+/g, "_");
    try {
      await api.patch(`approve/${id}/`, { role: access });

      setFormSuccess("✅ Access granted");

      setLoginRequests((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.log("Error approving user:", error);
    }
  };

  const toggleOpenRole = (id) => {
    setOpenRoleStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    if (formSuccess) {
      const timer = setTimeout(() => {
        setFormSuccess("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [formSuccess]);

  useEffect(() => {
    fetchLoginRequest();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        roleContainerRef.current &&
        !roleContainerRef.current.contains(e.target)
      ) {
        setOpenRoleStates({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Navbar Wrapper */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="frosted rounded-xl bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.6),0_16px_32px_rgba(0,0,0,0.12)] flex items-center justify-between py-1 px-4 sm:px-6 md:px-8">
          {/* Logo */}
          <img
            src={logo}
            alt="logo"
            onClick={() => navigate("/dashboard")}
            className="w-12 h-12 sm:w-14 sm:h-14 cursor-pointer"
          />

          {/* Desktop Menu */}
          {!isMobileMode && (
            <div className="relative flex flex-wrap items-center gap-2 sm:gap-3 md:gap-5">
              <div
                className="absolute top-0 left-0 h-full bg-white/20 backdrop-blur-xl rounded-3xl transition-all duration-300"
                style={{
                  width: activeWidth,
                  transform: `translateX(${activeOffset}px)`,
                }}
              />
              {Menu_Items.filter(
                (item) => !item.allowedRoles || item.allowedRoles.includes(role)
              ).map((item, index) => (
                <NavLink
                  key={item.key}
                  to={item.url}
                  ref={(el) => (tabRefs.current[index] = el)}
                  className={({ isActive }) =>
                    `relative z-10 px-3 py-1.5 sm:px-4 sm:py-2 text-[16px] sm:text-[17px] md:text-[18px] font-medium rounded-md transition-colors ${
                      isActive ? "text-[#0e9dc7]" : "text-[#444]"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Desktop Logout */}
          {!isMobileMode && (
            <button
              onClick={handleLogoutClick}
              className="relative group w-12 h-12 bg-[#c8e6f6] rounded-full flex items-center justify-center cursor-pointer"
            >
              <p className="text-2xl leading-none text-[#444]">{username[0]}</p>

              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-[#444] text-lg font-sans px-3 py-1.5 rounded whitespace-nowrap border border-[#0e9dc7] shadow-md">
                {username.replace("_", " ")}
                <span className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-[#0e9dc7]" />
              </span>
            </button>
          )}

          {/* Mobile Hamburger */}
          {isMobileMode && (
            <button onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
              <Menu className="w-10 h-10 text-[#0e9dc7]" />
            </button>
          )}
        </div>
      </div>

      {/* ---------------- LOGOUT DRAWER ---------------- */}
      {isLogoutDrawer &&
        createPortal(
          <div
            className="fixed inset-0 backdrop-blur-xs z-[9998]"
            onClick={() => setIsLogoutDrawer(false)}
          >
            <div
              className="absolute top-0 right-0 h-full w-[85%] sm:w-[45%] md:w-[35%] lg:w-[30%] bg-white shadow-xl p-6 transform transition-transform duration-100 ease-out"
              style={{
                transform: isLogoutDrawer
                  ? "translateX(0)"
                  : "translateX(100%)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* MAIN FLEX WRAPPER */}
              <div className="flex flex-col justify-between h-full">
                {/* CONTENT CENTERED */}
                {BLOCK_QUOTE.includes(role) && (
                  <div className="flex flex-col items-center">
                    <p className="text-start text-[#444] text-xl font-medium w-full">
                      QUOTATION NAME
                    </p>

                    <div className="mt-4 flex flex-col gap-5">
                      <p className="font-normal mt-4 text-[#444]">
                        QUOTE ─ SE ─{" "}
                        <input
                          value={part1}
                          onChange={(e) => setPart1(e.target.value)}
                          className="w-[55px] rounded-lg border border-slate-200 bg-white py-2 text-center text-sm text-slate-700 outline-none transition focus:border-[#0e9dc7] focus:ring-1 focus:ring-[#0e9dc7]"
                        />{" "}
                        ─{" "}
                        <input
                          value={part2}
                          onChange={(e) => setPart2(e.target.value)}
                          className="w-[55px] rounded-lg border border-slate-200 bg-white py-2 text-center  text-sm text-slate-700 outline-none transition focus:border-[#0e9dc7] focus:ring-1 focus:ring-[#0e9dc7]"
                        />{" "}
                        ─{" "}
                        <input
                          value={part3}
                          onChange={(e) => setPart3(e.target.value)}
                          className="w-[55px] rounded-lg border border-slate-200 bg-white py-2 text-center text-sm text-slate-700 outline-none transition focus:border-[#0e9dc7] focus:ring-1 focus:ring-[#0e9dc7]"
                        />
                      </p>

                      <div className="w-full flex justify-center">
                        <button
                          className="m-3 relative group"
                          onClick={handleQuoteupdate}
                        >
                          <div className="absolute top-1/2 right-1 -translate-y-1/2 duration-5 w-10 group-hover:w-[92.7%] h-[82%] bg-white flex justify-center items-center rounded-md p-1">
                            <PenLine
                              color="#0e9dc7"
                              style={{ width: 20, height: 20 }}
                            />
                          </div>
                          <div className="bg-[#3da5c5] w-26 h-10 flex justify-start items-center rounded-lg">
                            <p className="ml-4 text-white">EDIT</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {SHOW_REQUEST.includes(role) && (
                  <div className="w-full h-120 overflow-hidden">
                    <div className="flex flex-col h-full">
                      <div className="flex justify-center p-2">
                        <p className="text-xl text-[#444]">SIGN-IN ALERTS</p>
                      </div>
                      <div className="flex-1 overflow-y-auto bg-black/2 border border-black/15 rounded-xl">
                        <div className="w-full h-40 p-2" ref={roleContainerRef}>
                          {loginRequests.map((user) => (
                            <div
                              key={user.id}
                              className="bg-white border border-[#0e9dc7] rounded-xl w-full h-full hover:shadow-sm p-4 mb-2"
                            >
                              <div className="flex justify-between">
                                <p className="font-semibold text-lg">
                                  {user.username.replace("_", " ")}
                                </p>
                                <p className="text-gray-500">
                                  {new Date(user.date_joined).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex flex-row w-full justify-between pt-6 items-center">
                                <div className="flex flex-row w-full px-3 gap-3">
                                  <div className="relative w-[150px]">
                                    <button
                                      onClick={() => toggleOpenRole(user.id)}
                                      className="h-[40px] w-full bg-white border border-slate-300 rounded-lg px-3 flex justify-between items-center shadow-sm"
                                    >
                                      <p className="text-sm text-[#444]">
                                        {selectedRoles[user.id] ||
                                          "Select role"}
                                      </p>

                                      <SlArrowDown
                                        className={`text-lg text-[#0e9dc7] transition ${
                                          openRoleStates[user.id]
                                            ? "rotate-180"
                                            : ""
                                        }`}
                                      />
                                    </button>

                                    {openRoleStates[user.id] && (
                                      <div className="absolute left-0 mt-1 w-full bg-white border border-[#0e9dc7] rounded-lg shadow-xl z-50">
                                        {roleItem.map((item) => (
                                          <div
                                            key={item}
                                            className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                                            onClick={() => {
                                              setSelectedRoles((prev) => ({
                                                ...prev,
                                                [user.id]: item,
                                              }));
                                              toggleOpenRole(user.id);
                                            }}
                                          >
                                            {item}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-center">
                                  <button
                                    className="m-3 relative group"
                                    onClick={() => handleAccess(user.id)}
                                  >
                                    <div className="absolute top-1/2 right-1 -translate-y-1/2 duration-5 w-10 group-hover:w-[95.5%] h-[82%] bg-white flex justify-center items-center rounded-md p-1">
                                      <CloudCheck
                                        color="#0e9dc7"
                                        style={{ width: 20, height: 20 }}
                                      />
                                    </div>
                                    <div className="bg-[#3da5c5] w-46 h-10 flex justify-start items-center rounded-lg">
                                      <p className="ml-4 text-white">
                                        GRANT ACCESS
                                      </p>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {formSuccess && (
                          <div className="fixed top-5 right-5 z-50 w-auto rounded-lg border bg-emerald-50 text-emerald-700 px-2 py-2.5 text-center text-lg shadow-lg animate-slide-in">
                            {formSuccess}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full flex flex-col">
                  <div className="w-full flex justify-center">
                    <button
                      className="m-3 relative group"
                      onClick={handleLogoutConfirm}
                    >
                      <div className="absolute top-1/2 right-1 -translate-y-1/2 duration-5 w-10 group-hover:w-[93.9%] h-[82%] bg-white flex justify-center items-center rounded-md p-1">
                        <LogOut
                          color="#0e9dc7"
                          style={{ width: 20, height: 20 }}
                        />
                      </div>
                      <div className="bg-[#3da5c5] w-33 h-10 flex justify-start items-center rounded-lg">
                        <p className="ml-4 text-white">LOGOUT</p>
                      </div>
                    </button>
                  </div>
                  <div className="flex justify-center items-center">
                    <img src={se} alt="logo" className="w-70" />
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {isMenuOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            onClick={() => setIsMenuOpen(false)}
          >
            <div
              className="mx-auto flex h-dvh w-full max-w-7xl flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-4 sm:px-6 md:px-10 md:py-6">
                <img
                  src={white}
                  alt="logo"
                  className="h-[44px] w-[44px] sm:h-[50px] sm:w-[50px]"
                />

                <div className="flex items-center gap-4">
                  <LogOut
                    className="w-8 h-8 sm:w-9 sm:h-9 text-white cursor-pointer"
                    onClick={handleLogoutConfirm}
                  />
                  <X
                    className="w-8 h-8 sm:w-9 sm:h-9 text-white cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  />
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10">
                <ul className="flex flex-col items-center justify-center gap-8 md:gap-10 lg:gap-12 h-full">
                  {Menu_Items.map((item) => (
                    <li key={item.key}>
                      <NavLink
                        to={item.url}
                        onClick={() => setIsMenuOpen(false)}
                        className="block rounded px-3 py-2 text-center text-xl sm:text-2xl md:text-3xl text-white hover:bg-white/10 transition"
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

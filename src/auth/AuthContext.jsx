import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for token in localStorage
  useEffect(() => {
    const access = localStorage.getItem("access");
    const storedRole = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");
    setIsAuthenticated(!!access);
    setRole(storedRole);
    setUsername(storedUsername);
    setLoading(false);
  }, []);

  const login = (access, refresh, role, username) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);
    setIsAuthenticated(true);
    setRole(role);
    setUsername(username);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setRole(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, role, username, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);

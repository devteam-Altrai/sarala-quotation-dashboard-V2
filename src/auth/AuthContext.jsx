import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [user_id, setUser_Id] = useState(null)
  const [loading, setLoading] = useState(true);

  // Check for token in localStorage
  useEffect(() => {
    const access = localStorage.getItem("access");
    const storedRole = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");
    const storedUserId = localStorage.getItem("user_id")
    setIsAuthenticated(!!access);
    setRole(storedRole);
    setUsername(storedUsername);
    setUser_Id(storedUserId)
    setLoading(false);
  }, []);

  const login = (access, refresh, role, username, id) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);
    localStorage.setItem("user_id", id)
    setIsAuthenticated(true);
    setRole(role);
    setUsername(username);
    setUser_Id(id)
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id")
    setIsAuthenticated(false);
    setRole(null);
    setUsername(null);
    setUser_Id(null)
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, role, username, user_id, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);

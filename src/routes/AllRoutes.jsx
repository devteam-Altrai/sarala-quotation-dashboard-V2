import React from "react";
import { authProtectedRoutes, publicRoutes } from "./Index";
import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "../layout/Layout";
import { useAuthContext } from "../auth/AuthContext";

const AllRoutes = () => {
  const { isAuthenticated, loading, role } = useAuthContext();
  const jobaccess = import.meta.env.VITE_ROLE3;

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <Routes>
      {publicRoutes.map((route, idx) => (
        <Route
          path={route.path}
          element={route.element}
          key={`public-${idx}`}
        />
      ))}
      {authProtectedRoutes.map((route, idx) => {
        if (role === jobaccess && !route.path.startsWith("/job")) {
          return (
            <Route
              key={`auth-redirect-${idx}`}
              path={route.path}
              element={
                isAuthenticated ? (
                  <Navigate to="/job" replace />
                ) : (
                  <Navigate to={{ pathname: "/" }} />
                )
              }
            />
          );
        }

        return (
          <Route
            key={`auth-${idx}`}
            path={route.path}
            element={
              isAuthenticated ? (
                <Layout>{route.element}</Layout>
              ) : (
                <Navigate to={{ pathname: "/" }} />
              )
            }
          />
        );
      })}
    </Routes>
  );
};

export default AllRoutes;

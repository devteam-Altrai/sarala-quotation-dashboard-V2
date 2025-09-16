import React from "react";
import { authProtectedRoutes, publicRoutes } from "./Index";
import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "../layout/Layout";
import { useAuthContext } from "../auth/AuthContext";

const AllRoutes = () => {
  const { isAuthenticated, loading } = useAuthContext();

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
      {authProtectedRoutes.map((route, idx) => (
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
      ))}
    </Routes>
  );
};

export default AllRoutes;

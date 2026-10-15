import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ component, user, role }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return component;
}

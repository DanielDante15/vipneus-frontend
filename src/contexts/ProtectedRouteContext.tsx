import { authService } from "@/api/auth";
import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
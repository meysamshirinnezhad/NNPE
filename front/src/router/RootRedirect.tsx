import { Navigate } from "react-router-dom";

export default function RootRedirect() {
  const token = localStorage.getItem("access_token");
  // If logged in, go straight to dashboard; otherwise show landing
  return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/landing" replace />;
}
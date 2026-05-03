import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const normalizeUserRole = (user = {}) => {
  const roleCandidates = [
    user?.role,
    user?.level,
    user?.jabatan?.nama,
    user?.jabatan_nama,
    user?.jabatan,
  ];

  const firstRole = roleCandidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  return String(firstRole ?? "")
    .trim()
    .toLowerCase();
};

const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = "/" }) => {
  const { isAuthenticated, authLoading, currentUser } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        Memuat sesi pengguna...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const normalizedAllowedRoles = allowedRoles
      .map((role) =>
        String(role ?? "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean);
    const normalizedCurrentRole = normalizeUserRole(currentUser);

    if (!normalizedAllowedRoles.includes(normalizedCurrentRole)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

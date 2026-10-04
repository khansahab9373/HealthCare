import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import PatientTestsPage from "../pages/PatientTestsPage.jsx";
import PatientAppointmentsPage from "../pages/PatientAppointmentsPage.jsx";
import TechnicianAppointmentsPage from "../pages/TechnicianAppointmentsPage.jsx";
import AdminAppointmentsPage from "../pages/AdminAppointmentsPage.jsx";
import TechnicianReportPage from "../pages/TechnicianReportPage.jsx";
import PatientReportsPage from "../pages/PatientReportsPage.jsx";
import AdminReportsPage from "../pages/AdminReportsPage.jsx";
import AdminTechniciansPage from "../pages/AdminTechniciansPage.jsx";
import AdminTestsPage from "../pages/AdminTestsPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import TechnicianAvailabilityPage from "../pages/TechnicianAvailabilityPage.jsx";
import NotificationsPage from "../pages/NotificationsPage.jsx";
import AdminAnalyticsPage from "../pages/AdminAnalyticsPage.jsx";
import AdminAuditPage from "../pages/AdminAuditPage.jsx";
import MobileNavigation from "../components/MobileNavigation.jsx";
import ToastHost from "../components/ToastHost.jsx";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-lg font-semibold text-slate-700">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <>
      <MobileNavigation />
      <ToastHost />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/register/technician"
          element={<RegisterPage technicianOnly />}
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["PATIENT", "TECHNICIAN", "ADMIN"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/tests"
          element={
            <ProtectedRoute allowedRoles={["PATIENT"]}>
              <PatientTestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute allowedRoles={["PATIENT"]}>
              <PatientAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/appointments"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
              <TechnicianAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/reports/:appointmentId"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
              <TechnicianReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/reports"
          element={
            <ProtectedRoute allowedRoles={["PATIENT"]}>
              <PatientReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/technicians"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminTechniciansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tests"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminTestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["PATIENT", "TECHNICIAN", "ADMIN"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technician/availability"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
              <TechnicianAvailabilityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["PATIENT", "TECHNICIAN", "ADMIN"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminAuditPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;

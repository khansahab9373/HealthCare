import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
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
  const location = useLocation();

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
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase text-cyan-800">
          HealthCare
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Access denied
        </h1>
        <p className="mt-2 text-slate-600">
          You don&apos;t have permission to access this page.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="rounded-lg bg-cyan-800 px-4 py-2 font-semibold text-white"
            to="/dashboard"
          >
            Go to dashboard
          </Link>
          <button
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
            onClick={() =>
              location.key === "default"
                ? navigate("/dashboard", { replace: true })
                : navigate(-1)
            }
          >
            Go back
          </button>
        </div>
      </section>
    </main>
  );
};

const AppRoutes = () => {
  return (
    <>
      <MobileNavigation />
      <ToastHost />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
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

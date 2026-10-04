import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (user?.role === "PATIENT") {
          const [appointmentsResponse, reportsResponse, notificationsResponse] =
            await Promise.all([
              api.get("/appointments/my"),
              api.get("/reports/my"),
              api.get("/notifications/my"),
            ]);
          setAppointments(appointmentsResponse.data.data || []);
          setReports(reportsResponse.data.data || []);
          setUnreadNotifications(
            notificationsResponse.data.data.unreadCount || 0,
          );
        }

        if (user?.role === "TECHNICIAN") {
          const [response, notificationsResponse] = await Promise.all([
            api.get("/appointments/technician"),
            api.get("/notifications/my"),
          ]);
          setAppointments(response.data.data || []);
          setUnreadNotifications(
            notificationsResponse.data.data.unreadCount || 0,
          );
        }

        if (user?.role === "ADMIN") {
          const [appointmentsResponse, reportsResponse, notificationsResponse] =
            await Promise.all([
              api.get("/appointments/admin"),
              api.get("/reports/admin"),
              api.get("/notifications/my"),
            ]);
          setAppointments(appointmentsResponse.data.data || []);
          setReports(reportsResponse.data.data || []);
          setUnreadNotifications(
            notificationsResponse.data.data.unreadCount || 0,
          );
        }
      } catch {
        setAppointments([]);
        setReports([]);
      }
    };

    if (user) loadDashboardData();
  }, [user]);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              BloodCare
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Welcome, {user?.name || "Patient"}
            </h1>
          </div>
          <div className="flex gap-3">
            <Link
              to="/"
              className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
            >
              Home
            </Link>
            <Link
              to="/profile"
              className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className="rounded-full bg-rose-600 px-4 py-2 font-medium text-white"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-cyan-700 p-5 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-100">
              Upcoming
            </p>
            <h2 className="mt-3 text-3xl font-bold">{appointments.length}</h2>
            <p className="mt-2 text-cyan-100">Appointments</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">
              Reports
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              {reports.length}
            </h2>
            {user?.role === "PATIENT" ? (
              <Link
                to="/patient/reports"
                className="mt-2 inline-block text-cyan-700"
              >
                {reports.length} approved reports
              </Link>
            ) : (
              <p className="mt-2 text-slate-600">
                {reports.length} reports in queue
              </p>
            )}
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-violet-600">
              Alerts
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              {unreadNotifications}
            </h2>
            <Link
              to="/notifications"
              className="mt-2 inline-flex items-center gap-2 text-cyan-700"
            >
              <span aria-hidden="true">&#128276;</span> Notifications{" "}
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                {unreadNotifications}
              </span>
            </Link>
          </div>
        </section>

        {user?.role === "PATIENT" && (
          <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
                  Patient actions
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Book a lab test or review scheduled visits
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/patient/tests"
                  className="rounded-full bg-cyan-700 px-4 py-2 font-medium text-white"
                >
                  Book tests
                </Link>
                <Link
                  to="/patient/appointments"
                  className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
                >
                  My appointments
                </Link>
              </div>
            </div>
          </section>
        )}

        {user?.role === "TECHNICIAN" && (
          <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              Technician workspace
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Process today&apos;s assigned samples
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/technician/appointments"
                className="rounded-full bg-cyan-700 px-4 py-2 font-medium text-white"
              >
                Open assignments
              </Link>
              <Link
                to="/technician/availability"
                className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
              >
                Manage availability
              </Link>
            </div>
          </section>
        )}

        {user?.role === "ADMIN" && (
          <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              Admin workspace
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Review appointments and approve reports
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/admin/appointments"
                className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
              >
                Appointments
              </Link>
              <Link
                to="/admin/reports"
                className="rounded-full bg-cyan-700 px-4 py-2 font-medium text-white"
              >
                Review reports
              </Link>
              <Link
                to="/admin/technicians"
                className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
              >
                Verify technicians
              </Link>
              <Link
                to="/admin/tests"
                className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
              >
                Manage tests
              </Link>
              <Link
                to="/admin/analytics"
                className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
              >
                Analytics
              </Link>
              <Link
                to="/admin/audit"
                className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
              >
                Audit log
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default DashboardPage;

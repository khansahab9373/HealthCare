import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const nextStatusOptions = {
  CONFIRMED: ["SAMPLE_COLLECTED", "NO_SHOW"],
  TECHNICIAN_ASSIGNED: ["SAMPLE_COLLECTED", "NO_SHOW"],
  SAMPLE_COLLECTED: ["SAMPLE_RECEIVED", "NO_SHOW"],
  SAMPLE_RECEIVED: ["TESTING"],
};

const TechnicianAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/appointments/technician");
      setAppointments(data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load assigned appointments.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [retryCount]);

  const updateStatus = async (appointmentId, status) => {
    if (updatingAppointmentId) return;
    setUpdatingAppointmentId(appointmentId);
    setError("");
    try {
      const { data } = await api.patch(
        `/appointments/${appointmentId}/status`,
        { status },
      );
      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === appointmentId ? data.data : appointment,
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update appointment status.",
      );
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              Technician Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Assigned appointments
            </h1>
          </div>
          <Link
            to="/dashboard"
            className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
          >
            Dashboard
          </Link>
        </header>

        {error && (
          <p className="mb-4 rounded-xl bg-rose-50 p-4 text-rose-700">
            {error}
          </p>
        )}
        {loading ? (
          <div className="rounded-2xl bg-white p-7 text-slate-700 shadow-sm">
            Loading assignments...
          </div>
        ) : error && appointments.length === 0 ? (
          <div
            className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
            role="alert"
          >
            <p>{error}</p>
            <button
              onClick={() => setRetryCount((count) => count + 1)}
              className="mt-3 rounded-lg border border-rose-300 px-4 py-2 font-semibold"
            >
              Retry
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl bg-white p-7 text-slate-700 shadow-sm">
            No appointments are assigned to you yet.
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <article
                key={appointment._id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                      {appointment.test?.code}
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-slate-900">
                      {appointment.tests?.length
                        ? appointment.tests.map((test) => test.name).join(", ")
                        : appointment.test?.name}
                    </h2>
                    <p className="mt-1 text-slate-600">
                      Patient: {appointment.patient?.name} ·{" "}
                      {appointment.patient?.phone || appointment.patient?.email}
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-800">
                    {appointment.collectionType}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <div>
                    <span className="font-medium text-slate-800">Date:</span>{" "}
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium text-slate-800">Slot:</span>{" "}
                    {appointment.startTime} - {appointment.endTime}
                  </div>
                  <div>
                    <span className="font-medium text-slate-800">Current:</span>{" "}
                    {appointment.status}
                  </div>
                  <div>
                    <span className="font-medium text-slate-800">
                      Sample ID:
                    </span>{" "}
                    {appointment.sampleId || "Assigned when collected"}
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor={`status-${appointment._id}`}
                  >
                    Update workflow
                  </label>
                  <select
                    id={`status-${appointment._id}`}
                    disabled={
                      updatingAppointmentId === appointment._id ||
                      !(nextStatusOptions[appointment.status] || []).length
                    }
                    value={appointment.status}
                    onChange={(event) =>
                      updateStatus(appointment._id, event.target.value)
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:border-cyan-500"
                  >
                    <option value={appointment.status}>
                      {appointment.status}
                    </option>
                    {(nextStatusOptions[appointment.status] || []).map(
                      (status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ),
                    )}
                  </select>
                  {appointment.status === "TESTING" && (
                    <Link
                      to={`/technician/reports/${appointment._id}`}
                      className="rounded-full bg-slate-900 px-4 py-2 text-center font-medium text-white"
                    >
                      Submit report
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default TechnicianAppointmentsPage;

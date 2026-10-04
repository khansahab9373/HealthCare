import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const adminTransitions = {
  REQUESTED: ["CONFIRMED", "REJECTED", "CANCELLED"],
  CONFIRMED: ["TECHNICIAN_ASSIGNED", "CANCELLED"],
  TECHNICIAN_ASSIGNED: ["CANCELLED"],
  REPORT_APPROVED: ["COMPLETED"],
};

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchAppointments = async () => {
      setLoading(true);
      setError("");
      try {
        const [{ data }, technicianResponse] = await Promise.all([
          api.get("/appointments/admin"),
          api.get("/users/technicians"),
        ]);
        if (active) {
          setAppointments(data.data || []);
          setTechnicians(technicianResponse.data.data || []);
        }
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Unable to load the admin queue.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAppointments();
    return () => { active = false; };
  }, [retryCount]);

  const updateStatus = async (appointmentId, status) => {
    if (updatingAppointmentId) return;
    setUpdatingAppointmentId(appointmentId);
    setError("");
    try {
      const { data } = await api.patch(
        `/appointments/admin/${appointmentId}/status`,
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

  const reassign = async (appointmentId, technicianId) => {
    if (!technicianId) return;
    try {
      const { data } = await api.patch(
        `/appointments/admin/${appointmentId}/reassign`,
        { technicianId },
      );
      setAppointments((current) =>
        current.map((item) => (item._id === appointmentId ? data.data : item)),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reassign technician.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              Admin Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Appointment queue
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
            Loading queue...
          </div>
        ) : error && appointments.length === 0 ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800" role="alert">
            <p>{error}</p>
            <button onClick={() => setRetryCount((count) => count + 1)} className="mt-3 rounded-lg border border-rose-300 px-4 py-2 font-semibold">Retry</button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl bg-white p-7 text-slate-700 shadow-sm">
            No appointments have been booked.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Patient</th>
                  <th className="px-5 py-4">Test</th>
                  <th className="px-5 py-4">Appointment</th>
                  <th className="px-5 py-4">Technician</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="align-top">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {appointment.patient?.name}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {appointment.patient?.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {appointment.test?.name}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <p>
                        {new Date(
                          appointment.appointmentDate,
                        ).toLocaleDateString()}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {appointment.startTime} - {appointment.endTime}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      <select
                        value={appointment.technician?._id || ""}
                        onChange={(event) =>
                          reassign(appointment._id, event.target.value)
                        }
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2"
                      >
                        <option value="">Unassigned</option>
                        {technicians
                          .filter(
                            (technician) =>
                              technician.technicianStatus === "VERIFIED" &&
                              technician.isActive,
                          )
                          .map((technician) => (
                            <option key={technician._id} value={technician._id}>
                              {technician.name}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={appointment.status}
                        disabled={updatingAppointmentId === appointment._id || !(adminTransitions[appointment.status] || []).length}
                        onChange={(event) =>
                          updateStatus(appointment._id, event.target.value)
                        }
                        aria-label={`Status for ${appointment.patient?.name || "appointment"}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:border-cyan-500"
                      >
                        <option value={appointment.status}>{appointment.status}</option>
                        {(adminTransitions[appointment.status] || []).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminAppointmentsPage;

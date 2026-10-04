import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const PatientAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reschedule, setReschedule] = useState(null);
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleSlot, setRescheduleSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    const appointmentTests = reschedule?.appointment.tests?.length
      ? reschedule.appointment.tests.map((test) => test._id || test)
      : [reschedule?.appointment.test?._id].filter(Boolean);
    if (!reschedule?.date || !appointmentTests.length) {
      setRescheduleSlots([]);
      setRescheduleSlot(null);
      return;
    }
    let active = true;
    const loadSlots = async () => {
      setSlotsLoading(true);
      setRescheduleSlots([]);
      setRescheduleSlot(null);
      setError("");
      try {
        const { data } = await api.get(
          `/appointments/slots?testIds=${encodeURIComponent(appointmentTests.join(","))}&date=${reschedule.date}`,
        );
        if (active) setRescheduleSlots(data.data || []);
      } catch (err) {
        if (active) {
          setRescheduleSlots([]);
          setError(
            err.response?.data?.message || "Unable to load replacement slots.",
          );
        }
      } finally {
        if (active) setSlotsLoading(false);
      }
    };
    loadSlots();
    return () => {
      active = false;
    };
  }, [reschedule?.date, reschedule?.appointment.tests, reschedule?.appointment.test?._id]);

  const cancelAppointment = async (appointmentId) => {
    if (cancelingId || !window.confirm("Cancel this appointment?")) return;
    setCancelingId(appointmentId);
    setError("");
    try {
      const { data } = await api.patch(`/appointments/${appointmentId}/cancel`);
      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, ...data.data }
            : appointment,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel appointment.");
    } finally {
      setCancelingId(null);
    }
  };

  const submitReschedule = async () => {
    if (rescheduling) return;
    if (!rescheduleSlot) return setError("Choose a replacement slot first.");
    setRescheduling(true);
    try {
      const { data } = await api.patch(
        `/appointments/${reschedule.appointment._id}/reschedule`,
        {
          appointmentDate: reschedule.date,
          startTime: rescheduleSlot.startTime,
          technicianId: rescheduleSlot.technicianId,
        },
      );
      setAppointments((current) =>
        current.map((item) => (item._id === data.data._id ? data.data : item)),
      );
      setReschedule(null);
      setRescheduleSlots([]);
      setRescheduleSlot(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to reschedule appointment.",
      );
    } finally {
      setRescheduling(false);
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await api.get("/appointments/my");
        setAppointments(data.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load your appointments.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              Patient Portal
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              My appointments
            </h1>
          </div>
          <div className="flex gap-3">
            <Link
              to="/dashboard"
              className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
            >
              Dashboard
            </Link>
            <Link
              to="/patient/tests"
              className="rounded-full bg-cyan-700 px-4 py-2 font-medium text-white"
            >
              Book a test
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="rounded-2xl bg-white p-7 text-slate-700 shadow-sm">
            Loading appointments...
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-rose-50 p-7 text-rose-700 shadow-sm">
            {error}
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl bg-white p-7 text-slate-700 shadow-sm">
            No appointments yet. Book your first blood test to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <article
                key={appointment._id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                      {appointment.tests?.length
                        ? appointment.tests.map((test) => test.name).join(", ")
                        : appointment.test?.name || "Test"}{" "}
                    </p>
                    <h2
                      className={`mt-2 text-xl font-bold ${appointment.status === "CANCELLED" ? "text-rose-700" : "text-slate-900"}`}
                    >
                      {appointment.status.replaceAll("_", " ")}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${appointment.status === "CANCELLED" ? "bg-rose-100 text-rose-800" : "bg-cyan-100 text-cyan-800"}`}
                  >
                    {appointment.collectionType.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <div>
                    <p className="font-medium text-slate-800">Date</p>
                    <p>
                      {new Date(
                        appointment.appointmentDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Time</p>
                    <p>{appointment.startTime}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Technician</p>
                    <p>
                      {appointment.technician?.name || "Pending assignment"}
                    </p>
                  </div>
                </div>
                {appointment.collectionType === "HOME_COLLECTION" &&
                  appointment.address && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                      <p className="font-medium text-slate-800">
                        Collection address
                      </p>
                      <p className="mt-1">
                        {appointment.address.street}, {appointment.address.city}
                        , {appointment.address.state}{" "}
                        {appointment.address.pincode}
                      </p>
                    </div>
                  )}
                {appointment.notes && (
                  <p className="mt-4 text-sm text-slate-600">
                    <span className="font-medium text-slate-800">Notes:</span>{" "}
                    {appointment.notes}
                  </p>
                )}
                {["REQUESTED", "CONFIRMED", "TECHNICIAN_ASSIGNED"].includes(
                  appointment.status,
                ) && (
                  <div className="mt-4">
                    <button
                      type="button"
                      disabled={rescheduling}
                      onClick={() => {
                        setRescheduleSlot(null);
                        setReschedule({
                          appointment,
                          date: new Date(appointment.appointmentDate)
                            .toISOString()
                            .slice(0, 10),
                        });
                      }}
                      className="rounded-full border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700"
                    >
                      Reschedule
                    </button>
                    {reschedule?.appointment._id === appointment._id && (
                      <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-4">
                        {slotsLoading && (
                          <p role="status">Finding available slots...</p>
                        )}
                        {!slotsLoading && rescheduleSlots.length === 0 && (
                          <p className="text-sm text-slate-600">
                            No replacement slots are available for this date.
                          </p>
                        )}
                        <input
                          type="date"
                          min={new Date().toISOString().slice(0, 10)}
                          value={reschedule.date}
                          onChange={(event) =>
                            setReschedule((current) => ({
                              ...current,
                              date: event.target.value,
                            }))
                          }
                          className="rounded-lg border border-slate-200 px-3 py-2"
                        />
                        <div className="flex flex-wrap gap-2">
                          {rescheduleSlots.map((slot) => (
                            <button
                              type="button"
                              key={`${slot.technicianId}-${slot.startTime}`}
                              onClick={() => setRescheduleSlot(slot)}
                              className={`rounded-lg border px-3 py-2 text-sm ${rescheduleSlot === slot ? "border-cyan-500 bg-cyan-100" : "border-slate-200 bg-white"}`}
                            >
                              {slot.startTime} · {slot.technicianName}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={submitReschedule}
                          className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white"
                        >
                          {rescheduling
                            ? "Rescheduling..."
                            : "Confirm reschedule"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {!["CANCELLED", "COMPLETED", "REPORT_APPROVED"].includes(
                  appointment.status,
                ) && (
                  <button
                    type="button"
                    disabled={cancelingId === appointment._id}
                    onClick={() => cancelAppointment(appointment._id)}
                    className="mt-4 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700"
                  >
                    {cancelingId === appointment._id
                      ? "Cancelling..."
                      : "Cancel appointment"}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default PatientAppointmentsPage;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const days = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];
const defaultAvailability = days.map((day) => ({
  day,
  startTime: "08:00",
  endTime: "16:00",
  off: true,
}));

const TechnicianAvailabilityPage = () => {
  const [availability, setAvailability] = useState(defaultAvailability);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [editingBlockId, setEditingBlockId] = useState(null);
  const [block, setBlock] = useState({
    date: "",
    startTime: "12:00",
    endTime: "13:00",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAvailability = async () => {
    try {
      const { data } = await api.get("/users/me/availability");
      const saved = data.data;
      setBlockedSlots(saved.blockedSlots || []);
      setAvailability(
        days.map(
          (day) =>
            saved.availability?.find((item) => item.day === day) || {
              day,
              startTime: "08:00",
              endTime: "16:00",
              off: true,
            },
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load availability.");
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const updateDay = (index, field, value) =>
    setAvailability((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  const saveAvailability = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api.put("/users/me/availability", {
        availability: availability
          .filter((item) => !item.off)
          .map((item) => ({
            day: item.day,
            startTime: item.startTime,
            endTime: item.endTime,
          })),
      });
      setMessage("Weekly availability saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save availability.");
    }
  };
  const addBlock = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = editingBlockId
        ? await api.put(`/users/me/blocked-slots/${editingBlockId}`, block)
        : await api.post("/users/me/blocked-slots", block);
      setBlockedSlots(data.data.blockedSlots || []);
      setBlock({ date: "", startTime: "12:00", endTime: "13:00" });
      setEditingBlockId(null);
      setMessage(
        editingBlockId ? "Blocked period updated." : "Blocked period added.",
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add blocked period.");
    }
  };
  const removeBlock = async (slotId) => {
    try {
      const { data } = await api.delete(`/users/me/blocked-slots/${slotId}`);
      setBlockedSlots(data.data.blockedSlots || []);
      if (editingBlockId === slotId) {
        setEditingBlockId(null);
        setBlock({ date: "", startTime: "12:00", endTime: "13:00" });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to remove blocked period.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              Technician Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Availability
            </h1>
          </div>
          <Link
            to="/dashboard"
            className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
          >
            Dashboard
          </Link>
        </header>
        <form
          onSubmit={saveAvailability}
          className="rounded-2xl bg-white p-5 shadow-sm"
        >
          <h2 className="text-xl font-bold text-slate-900">
            Weekly working hours
          </h2>
          <div className="mt-4 space-y-3">
            {availability.map((item, index) => (
              <div
                key={item.day}
                className="grid items-center gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <span className="font-semibold text-slate-800">{item.day}</span>
                <input
                  type="time"
                  disabled={item.off}
                  value={item.startTime}
                  onChange={(event) =>
                    updateDay(index, "startTime", event.target.value)
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
                />
                <input
                  type="time"
                  disabled={item.off}
                  value={item.endTime}
                  onChange={(event) =>
                    updateDay(index, "endTime", event.target.value)
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-100"
                />
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={item.off}
                    onChange={(event) =>
                      updateDay(index, "off", event.target.checked)
                    }
                  />{" "}
                  Day off
                </label>
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="mt-5 rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white"
          >
            Save hours
          </button>
        </form>
        <form
          onSubmit={addBlock}
          className="mt-6 rounded-2xl bg-white p-5 shadow-sm"
        >
          <h2 className="text-xl font-bold text-slate-900">Block a period</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              type="date"
              required
              value={block.date}
              onChange={(event) =>
                setBlock({ ...block, date: event.target.value })
              }
              className="rounded-lg border border-slate-200 px-3 py-2"
            />
            <input
              type="time"
              required
              value={block.startTime}
              onChange={(event) =>
                setBlock({ ...block, startTime: event.target.value })
              }
              className="rounded-lg border border-slate-200 px-3 py-2"
            />
            <input
              type="time"
              required
              value={block.endTime}
              onChange={(event) =>
                setBlock({ ...block, endTime: event.target.value })
              }
              className="rounded-lg border border-slate-200 px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="mt-4 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
          >
            {editingBlockId ? "Update blocked period" : "Add blocked period"}
          </button>
          {blockedSlots.length > 0 && (
            <div className="mt-5 space-y-2">
              {blockedSlots.map((slot) => (
                <div
                  key={slot._id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  <span>
                    {slot.date} · {slot.startTime} - {slot.endTime}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBlockId(slot._id);
                      setBlock({
                        date: slot.date,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                      });
                    }}
                    className="font-semibold text-cyan-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(slot._id)}
                    className="font-semibold text-rose-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </form>
        {message && <p className="mt-4 text-emerald-700">{message}</p>}
        {error && <p className="mt-4 text-rose-700">{error}</p>}
      </div>
    </main>
  );
};

export default TechnicianAvailabilityPage;

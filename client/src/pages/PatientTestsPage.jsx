import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const PatientTestsPage = () => {
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState("");
  const [date, setDate] = useState("");
  const [selectedSlotKey, setSelectedSlotKey] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [collectionType, setCollectionType] = useState("LAB_VISIT");
  const [address, setAddress] = useState({ street: "", city: "", pincode: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selectedTest = tests.find((test) => test._id === selectedTestId);

  useEffect(() => {
    if (!selectedTestId || !date) {
      setSlots([]);
      return;
    }
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const { data } = await api.get(
          `/appointments/slots?testId=${selectedTestId}&date=${date}`,
        );
        setSlots(data.data || []);
        setSelectedSlotKey(
          data.data?.[0]
            ? `${data.data[0].technicianId}-${data.data[0].startTime}`
            : "",
        );
      } catch (err) {
        setSlots([]);
        setError(
          err.response?.data?.message || "Unable to load available slots.",
        );
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [selectedTestId, date]);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const { data } = await api.get("/tests");
        setTests(data.data || []);
        if (data.data?.[0]) {
          setSelectedTestId(data.data[0]._id);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load blood tests.");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const handleBooking = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const selectedSlot = slots.find(
      (slot) => `${slot.technicianId}-${slot.startTime}` === selectedSlotKey,
    );
    if (!selectedSlot) {
      setError("Choose an available slot before booking.");
      return;
    }

    try {
      const payload = {
        testId: selectedTestId,
        technicianId: selectedSlot.technicianId,
        appointmentDate: date,
        startTime: selectedSlot.startTime,
        collectionType,
        address: collectionType === "HOME_COLLECTION" ? address : undefined,
      };

      const { data } = await api.post("/appointments", payload);
      setMessage(
        `Appointment booked successfully for ${data.data.test?.name || "your selected test"}.`,
      );
      setDate("");
      setSelectedSlotKey("");
      setAddress({ street: "", city: "", pincode: "" });
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not book this appointment.",
      );
    }
  };

  const handleTestChange = (testId) => {
    const test = tests.find((item) => item._id === testId);
    setSelectedTestId(testId);
    if (
      collectionType === "HOME_COLLECTION" &&
      !test?.homeCollectionAvailable
    ) {
      setCollectionType("LAB_VISIT");
    }
    if (collectionType === "LAB_VISIT" && !test?.labVisitAvailable) {
      setCollectionType("HOME_COLLECTION");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              Patient Portal
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Blood tests and booking
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
              to="/patient/appointments"
              className="rounded-full bg-cyan-700 px-4 py-2 font-medium text-white"
            >
              Appointments
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-slate-700 shadow-sm">
            Loading tests...
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-4">
              {tests.map((test) => (
                <article
                  key={test._id}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                        {test.category}
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-slate-900">
                        {test.name}
                      </h2>
                    </div>
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-800">
                      ₹{test.price}
                    </span>
                  </div>
                  <p className="text-slate-600">{test.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                    <span>Sample: {test.sampleType}</span>
                    <span>Prep: {test.preparationInstructions}</span>
                    <span>Report: {test.estimatedReportTime}</span>
                  </div>
                  <button
                    type="button"
                    className="mt-4 rounded-full bg-slate-900 px-4 py-2 font-medium text-white"
                    onClick={() => handleTestChange(test._id)}
                  >
                    Select this test
                  </button>
                </article>
              ))}
            </section>

            <aside className="rounded-2xl bg-slate-900 p-5 text-white shadow-lg">
              <h2 className="text-2xl font-bold">Book appointment</h2>
              <form className="mt-5 space-y-4" onSubmit={handleBooking}>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Test
                  </label>
                  <select
                    value={selectedTestId}
                    onChange={(e) => handleTestChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-white outline-none"
                  >
                    {tests.map((test) => (
                      <option key={test._id} value={test._id}>
                        {test.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Time
                  </label>
                  <p className="mb-2 text-sm text-slate-300">Available slots</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {slotsLoading ? (
                      <p className="col-span-full text-sm text-slate-300">
                        Finding available slots...
                      </p>
                    ) : slots.length === 0 ? (
                      <p className="col-span-full text-sm text-slate-300">
                        Choose a date to see available slots.
                      </p>
                    ) : (
                      slots.map((slot) => (
                        <button
                          type="button"
                          key={`${slot.technicianId}-${slot.startTime}`}
                          onClick={() =>
                            setSelectedSlotKey(
                              `${slot.technicianId}-${slot.startTime}`,
                            )
                          }
                          className={`rounded-lg border px-3 py-2 text-sm ${selectedSlotKey === `${slot.technicianId}-${slot.startTime}` ? "border-cyan-400 bg-cyan-500 text-slate-900" : "border-slate-700 bg-slate-800 text-white"}`}
                        >
                          {slot.startTime} · {slot.technicianName}
                        </button>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Collection type
                  </label>
                  <select
                    value={collectionType}
                    onChange={(e) => setCollectionType(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-white outline-none"
                  >
                    <option
                      value="LAB_VISIT"
                      disabled={selectedTest && !selectedTest.labVisitAvailable}
                    >
                      Lab visit
                    </option>
                    <option
                      value="HOME_COLLECTION"
                      disabled={
                        selectedTest && !selectedTest.homeCollectionAvailable
                      }
                    >
                      Home collection
                    </option>
                  </select>
                </div>
                {collectionType === "HOME_COLLECTION" && (
                  <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-800 p-3">
                    <label className="block text-sm text-slate-300">
                      Street address
                      <input
                        value={address.street}
                        onChange={(e) =>
                          setAddress((current) => ({
                            ...current,
                            street: e.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                        required
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-sm text-slate-300">
                        City
                        <input
                          value={address.city}
                          onChange={(e) =>
                            setAddress((current) => ({
                              ...current,
                              city: e.target.value,
                            }))
                          }
                          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                          required
                        />
                      </label>
                      <label className="block text-sm text-slate-300">
                        Pincode
                        <input
                          value={address.pincode}
                          onChange={(e) =>
                            setAddress((current) => ({
                              ...current,
                              pincode: e.target.value,
                            }))
                          }
                          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                          required
                        />
                      </label>
                    </div>
                  </div>
                )}
                {message && (
                  <p className="text-sm font-medium text-emerald-300">
                    {message}
                  </p>
                )}
                {error && (
                  <p className="text-sm font-medium text-rose-300">{error}</p>
                )}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-900"
                >
                  Book slot
                </button>
              </form>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default PatientTestsPage;

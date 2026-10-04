import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";

const TechnicianReportPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [appointmentLoading, setAppointmentLoading] = useState(true);
  const [results, setResults] = useState([
    {
      test: "",
      marker: "",
      value: "",
      unit: "",
      referenceRange: "",
      remarks: "",
      flag: "NORMAL",
    },
  ]);
  const [interpretation, setInterpretation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const appointmentTests = appointment?.tests?.length
    ? appointment.tests
    : appointment?.test
      ? [appointment.test]
      : [];

  useEffect(() => {
    let active = true;
    const loadAppointment = async () => {
      setAppointmentLoading(true);
      setError("");
      try {
        const { data } = await api.get("/appointments/technician");
        const found = (data.data || []).find(
          (item) => item._id === appointmentId,
        );
        if (!found) {
          if (active) setError("Appointment not found or not assigned to you.");
          return;
        }
        if (active) {
          setAppointment(found);
          const firstTest = found.tests?.[0]?._id || found.test?._id || "";
          setResults((current) =>
            current.map((result) => ({ ...result, test: firstTest })),
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to load appointment tests.",
          );
        }
      } finally {
        if (active) setAppointmentLoading(false);
      }
    };
    loadAppointment();
    return () => {
      active = false;
    };
  }, [appointmentId]);

  const updateResult = (index, field, value) => {
    setResults((current) =>
      current.map((result, resultIndex) =>
        resultIndex === index ? { ...result, [field]: value } : result,
      ),
    );
  };

  const submitReport = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await api.post(`/reports/appointments/${appointmentId}`, {
        results,
        interpretation,
      });
      setMessage("Report submitted for admin approval.");
      setTimeout(() => navigate("/technician/appointments"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              Technician Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Submit report
            </h1>
          </div>
          <Link
            to="/technician/appointments"
            className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
          >
            Back
          </Link>
        </header>
        <form
          onSubmit={submitReport}
          className="space-y-5 rounded-2xl bg-white p-6 shadow-sm"
        >
          {appointmentLoading && (
            <p role="status" className="text-slate-600">
              Loading appointment tests...
            </p>
          )}
          {results.map((result, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-6"
            >
              <select
                required
                aria-label={`Result ${index + 1} test`}
                value={result.test}
                onChange={(event) =>
                  updateResult(index, "test", event.target.value)
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
              >
                <option value="" disabled>
                  Select test
                </option>
                {appointmentTests.map((test) => (
                  <option key={test._id} value={test._id}>
                    {test.name} ({test.code})
                  </option>
                ))}
              </select>
              <input
                required
                aria-label={`Result ${index + 1} marker`}
                placeholder="Marker"
                value={result.marker}
                onChange={(event) =>
                  updateResult(index, "marker", event.target.value)
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <input
                required
                aria-label={`Result ${index + 1} value`}
                placeholder="Value"
                value={result.value}
                onChange={(event) =>
                  updateResult(index, "value", event.target.value)
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <input
                placeholder="Unit"
                aria-label={`Result ${index + 1} unit`}
                value={result.unit}
                onChange={(event) =>
                  updateResult(index, "unit", event.target.value)
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <input
                placeholder="Reference range"
                aria-label={`Result ${index + 1} reference range`}
                value={result.referenceRange}
                onChange={(event) =>
                  updateResult(index, "referenceRange", event.target.value)
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <input
                placeholder="Remarks"
                aria-label={`Result ${index + 1} remarks`}
                value={result.remarks}
                onChange={(event) =>
                  updateResult(index, "remarks", event.target.value)
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <select
                aria-label={`Result ${index + 1} flag`}
                value={result.flag}
                onChange={(event) =>
                  updateResult(index, "flag", event.target.value)
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
              >
                <option>NORMAL</option>
                <option>LOW</option>
                <option>HIGH</option>
                <option>CRITICAL</option>
              </select>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setResults((current) => [
                ...current,
                {
                  test: appointmentTests[0]?._id || "",
                  marker: "",
                  value: "",
                  unit: "",
                  referenceRange: "",
                  remarks: "",
                  flag: "NORMAL",
                },
              ])
            }
            className="rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-700"
          >
            Add result
          </button>
          <textarea
            required
            aria-label="Clinical interpretation"
            value={interpretation}
            onChange={(event) => setInterpretation(event.target.value)}
            placeholder="Clinical interpretation"
            className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-3"
          />
          {message && <p className="text-emerald-700">{message}</p>}
          {error && <p className="text-rose-700">{error}</p>}
          <button
            type="submit"
            disabled={submitting || appointmentLoading || !appointment}
            className="rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white"
          >
            {submitting ? "Submitting..." : "Submit for approval"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default TechnicianReportPage;

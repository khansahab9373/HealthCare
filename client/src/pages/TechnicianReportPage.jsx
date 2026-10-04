import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";

const TechnicianReportPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([
    {
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

  const updateResult = (index, field, value) => {
    setResults((current) =>
      current.map((result, resultIndex) =>
        resultIndex === index ? { ...result, [field]: value } : result,
      ),
    );
  };

  const submitReport = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post(`/reports/appointments/${appointmentId}`, {
        results,
        interpretation,
      });
      setMessage("Report submitted for admin approval.");
      setTimeout(() => navigate("/technician/appointments"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit report.");
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
          {results.map((result, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-5"
            >
              <input
                required
                placeholder="Marker"
                value={result.marker}
                onChange={(event) =>
                  updateResult(index, "marker", event.target.value)
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <input
                required
                placeholder="Value"
                value={result.value}
                onChange={(event) =>
                  updateResult(index, "value", event.target.value)
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <input
                placeholder="Unit"
                value={result.unit}
                onChange={(event) =>
                  updateResult(index, "unit", event.target.value)
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <input
                placeholder="Reference range"
                value={result.referenceRange}
                onChange={(event) =>
                  updateResult(index, "referenceRange", event.target.value)
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <input
                placeholder="Remarks"
                value={result.remarks}
                onChange={(event) =>
                  updateResult(index, "remarks", event.target.value)
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
              />
              <select
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
            value={interpretation}
            onChange={(event) => setInterpretation(event.target.value)}
            placeholder="Clinical interpretation"
            className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-3"
          />
          {message && <p className="text-emerald-700">{message}</p>}
          {error && <p className="text-rose-700">{error}</p>}
          <button
            type="submit"
            className="rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white"
          >
            Submit for approval
          </button>
        </form>
      </div>
    </main>
  );
};

export default TechnicianReportPage;

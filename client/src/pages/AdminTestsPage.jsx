import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const emptyTest = {
  name: "",
  code: "",
  description: "",
  category: "",
  price: "",
  sampleType: "Blood",
  preparationInstructions: "",
  estimatedReportTime: "24 hours",
  fastingRequired: false,
  fastingDuration: "N/A",
  homeCollectionAvailable: true,
  labVisitAvailable: true,
};

const AdminTestsPage = () => {
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState(emptyTest);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingTestId, setEditingTestId] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [togglingTestId, setTogglingTestId] = useState(null);

  useEffect(() => {
    let active = true;
    const loadTests = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/tests/admin");
        if (active) setTests(data.data || []);
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Unable to load tests.");
      } finally {
        if (active) setLoading(false);
      }
    };
    loadTests();
    return () => { active = false; };
  }, [retryCount]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const createTest = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const request = { ...form, price: Number(form.price) };
      const { data } = editingTestId
        ? await api.patch(`/tests/${editingTestId}`, request)
        : await api.post("/tests", request);
      setTests((current) =>
        (editingTestId
          ? current.map((test) =>
              test._id === editingTestId ? data.data : test,
            )
          : [...current, data.data]
        ).sort((first, second) => first.name.localeCompare(second.name)),
      );
      setForm(emptyTest);
      setEditingTestId(null);
      setMessage(
        editingTestId ? "Test updated." : "Test added to the catalog.",
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create test.");
    } finally {
      setSaving(false);
    }
  };

  const toggleTest = async (test) => {
    if (togglingTestId) return;
    setTogglingTestId(test._id);
    try {
      const { data } = await api.patch(`/tests/${test._id}/status`, {
        active: !test.active,
      });
      setTests((current) =>
        current.map((item) => (item._id === test._id ? data.data : item)),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update test status.");
    } finally {
      setTogglingTestId(null);
    }
  };

  const editTest = (test) => {
    setEditingTestId(test._id);
    setForm({ ...test, price: String(test.price) });
    setError("");
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              Admin Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Test catalog
            </h1>
          </div>
          <Link
            to="/dashboard"
            className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
          >
            Dashboard
          </Link>
        </header>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Test catalog</h2>
              <span className="text-sm text-slate-500">
                {tests.filter((test) => test.active).length} active /{" "}
                {tests.length} total
              </span>
            </div>
            {loading ? (
              <div className="rounded-2xl bg-white p-7 shadow-sm">
                Loading catalog...
              </div>
            ) : error && tests.length === 0 ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800" role="alert">
                <p>{error}</p>
                <button onClick={() => setRetryCount((count) => count + 1)} className="mt-3 rounded-lg border border-rose-300 px-4 py-2 font-semibold">Retry</button>
              </div>
            ) : tests.length === 0 ? (
              <div className="rounded-2xl bg-white p-7 text-slate-700 shadow-sm">No tests are in the catalog yet.</div>
            ) : (
              tests.map((test) => (
                <article
                  key={test._id}
                  className={`rounded-2xl bg-white p-5 shadow-sm ${!test.active ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                        {test.code} · {test.category}
                      </p>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">
                        {test.name}
                      </h3>
                    </div>
                    <span className="font-bold text-slate-900">
                      ₹{test.price}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {test.description}
                  </p>
                  <p className="mt-3 text-xs text-slate-500">
                    {test.sampleType} · Report in {test.estimatedReportTime} ·{" "}
                    {test.fastingRequired
                      ? `Fasting: ${test.fastingDuration}`
                      : "No fasting"}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      disabled={Boolean(togglingTestId)}
                      onClick={() => editTest(test)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-cyan-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleTest(test)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      {togglingTestId === test._id ? "Updating..." : test.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
          <form
            onSubmit={createTest}
            className="h-fit space-y-4 rounded-2xl bg-slate-900 p-5 text-white shadow-lg"
          >
            <h2 className="text-2xl font-bold">Add a test</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                placeholder="Test name"
                required
                className="rounded-lg bg-slate-800 px-3 py-2"
              />
              <input
                name="code"
                value={form.code}
                onChange={updateField}
                placeholder="Code"
                required
                className="rounded-lg bg-slate-800 px-3 py-2 uppercase"
              />
              <input
                name="category"
                value={form.category}
                onChange={updateField}
                placeholder="Category"
                required
                className="rounded-lg bg-slate-800 px-3 py-2"
              />
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={updateField}
                placeholder="Price"
                required
                className="rounded-lg bg-slate-800 px-3 py-2"
              />
              <input
                name="sampleType"
                value={form.sampleType}
                onChange={updateField}
                placeholder="Sample type"
                required
                className="rounded-lg bg-slate-800 px-3 py-2"
              />
              <input
                name="estimatedReportTime"
                value={form.estimatedReportTime}
                onChange={updateField}
                placeholder="Report time"
                required
                className="rounded-lg bg-slate-800 px-3 py-2"
              />
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={updateField}
              placeholder="Description"
              required
              className="min-h-24 w-full rounded-lg bg-slate-800 px-3 py-2"
            />
            <textarea
              name="preparationInstructions"
              value={form.preparationInstructions}
              onChange={updateField}
              placeholder="Preparation instructions"
              required
              className="min-h-20 w-full rounded-lg bg-slate-800 px-3 py-2"
            />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                name="fastingRequired"
                type="checkbox"
                checked={form.fastingRequired}
                onChange={updateField}
              />{" "}
              Fasting required
            </label>
            {form.fastingRequired && (
              <input
                name="fastingDuration"
                value={form.fastingDuration}
                onChange={updateField}
                placeholder="Fasting duration"
                className="w-full rounded-lg bg-slate-800 px-3 py-2"
              />
            )}
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <label className="flex items-center gap-2">
                <input
                  name="homeCollectionAvailable"
                  type="checkbox"
                  checked={form.homeCollectionAvailable}
                  onChange={updateField}
                />{" "}
                Home collection
              </label>
              <label className="flex items-center gap-2">
                <input
                  name="labVisitAvailable"
                  type="checkbox"
                  checked={form.labVisitAvailable}
                  onChange={updateField}
                />{" "}
                Lab visit
              </label>
            </div>
            {message && <p className="text-emerald-300">{message}</p>}
            {error && <p className="text-rose-300">{error}</p>}
            <button
              disabled={saving}
              type="submit"
              className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-900 disabled:opacity-60"
            >
              {saving ? "Adding..." : "Add to catalog"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AdminTestsPage;

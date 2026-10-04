import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const { data } = await api.get("/analytics/admin");
        setAnalytics(data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load analytics.");
      }
    };
    loadAnalytics();
  }, []);

  const maxCount = Math.max(
    ...(analytics?.testPopularity || []).map((item) => item.count),
    1,
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              Admin Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Analytics
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
        {!analytics ? (
          <div className="rounded-2xl bg-white p-7 shadow-sm">
            Loading analytics...
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Summary</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-cyan-50 p-4">
                  <p className="text-sm text-cyan-700">Completed tests</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {analytics.completedTests}
                  </p>
                </div>
                <div className="rounded-xl bg-rose-50 p-4">
                  <p className="text-sm text-rose-700">Cancellations</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {analytics.cancellationStats.reduce(
                      (total, item) => total + item.count,
                      0,
                    )}
                  </p>
                </div>
              </div>
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Popular tests
              </h2>
              <div className="mt-4 space-y-3">
                {analytics.testPopularity.length === 0 ? (
                  <p className="text-slate-500">No appointment data yet.</p>
                ) : (
                  analytics.testPopularity.map((item) => (
                    <div key={item.test}>
                      <div className="flex justify-between text-sm text-slate-700">
                        <span>{item.test}</span>
                        <span>{item.count}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-cyan-600"
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Status distribution
              </h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {analytics.statusDistribution.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-600">{item._id}</span>
                    <strong className="text-slate-900">{item.count}</strong>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">
                Technician workload
              </h2>
              <div className="mt-4 space-y-2">
                {analytics.technicianWorkload.length === 0 ? (
                  <p className="text-slate-500">
                    No technician workload data yet.
                  </p>
                ) : (
                  analytics.technicianWorkload.map((item) => (
                    <div
                      key={item.technician}
                      className="flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                    >
                      <span className="text-slate-700">{item.technician}</span>
                      <span className="text-slate-600">
                        {item.count} total · {item.completed} completed
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminAnalyticsPage;

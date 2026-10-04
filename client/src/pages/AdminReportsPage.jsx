import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await api.get("/reports/admin");
        setReports(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const approveReport = async (reportId) => {
    setError("");
    try {
      const { data } = await api.patch(`/reports/${reportId}/approve`);
      setReports((current) =>
        current.map((report) => (report._id === reportId ? data.data : report)),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to approve report.");
    }
  };

  const reviewReport = async (reportId, action) => {
    const reason = window.prompt("Reason for this review action:") || "";
    if (!reason.trim() && action !== "review") return;
    const endpoint =
      action === "review"
        ? "review"
        : action === "reject"
          ? "reject"
          : "correction";
    try {
      const { data } = await api.patch(`/reports/${reportId}/${endpoint}`, {
        reason,
      });
      setReports((current) =>
        current.map((report) => (report._id === reportId ? data.data : report)),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to review report.");
    }
  };

  const publishReport = async (reportId) => {
    try {
      const { data } = await api.patch(`/reports/${reportId}/publish`);
      setReports((current) =>
        current.map((report) => (report._id === reportId ? data.data : report)),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to publish report.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              Admin Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Report review
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
          <div className="rounded-2xl bg-white p-7 shadow-sm">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl bg-white p-7 text-slate-700 shadow-sm">
            No technician reports have been submitted.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <article
                key={report._id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                      {report.test?.code}
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-slate-900">
                      {report.test?.name}
                    </h2>
                    <p className="mt-1 text-slate-600">
                      Patient: {report.patient?.name} · Technician:{" "}
                      {report.technician?.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Sample ID:{" "}
                      {report.appointment?.sampleId || "Not available"} · Report
                      date: {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {report.status}
                    </span>
                    {["SUBMITTED", "UNDER_REVIEW"].includes(report.status) && (
                      <>
                        <button
                          type="button"
                          onClick={() => reviewReport(report._id, "review")}
                          className="rounded-full border border-cyan-200 px-3 py-2 text-sm text-cyan-700"
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          onClick={() => reviewReport(report._id, "correction")}
                          className="rounded-full border border-amber-200 px-3 py-2 text-sm text-amber-700"
                        >
                          Correction
                        </button>
                        <button
                          type="button"
                          onClick={() => reviewReport(report._id, "reject")}
                          className="rounded-full border border-rose-200 px-3 py-2 text-sm text-rose-700"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => approveReport(report._id)}
                          className="rounded-full bg-emerald-600 px-4 py-2 font-medium text-white"
                        >
                          Approve
                        </button>
                      </>
                    )}
                    {report.status === "APPROVED" && (
                      <button
                        type="button"
                        onClick={() => publishReport(report._id)}
                        className="rounded-full bg-cyan-700 px-4 py-2 font-medium text-white"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="py-2 pr-5">Marker</th>
                        <th className="py-2 pr-5">Value</th>
                        <th className="py-2 pr-5">Unit</th>
                        <th className="py-2 pr-5">Reference</th>
                        <th className="py-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.results.map((result, index) => (
                        <tr key={`${report._id}-${index}`}>
                          <td className="py-3 pr-5 font-medium text-slate-800">
                            {result.marker}
                          </td>
                          <td className="py-3 pr-5 text-slate-700">
                            {result.value}
                          </td>
                          <td className="py-3 pr-5 text-slate-600">
                            {result.unit || "-"}
                          </td>
                          <td className="py-3 pr-5 text-slate-600">
                            {result.referenceRange || "-"}
                          </td>
                          <td className="py-3 text-slate-700">
                            {result.remarks || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-slate-600">{report.interpretation}</p>
                {report.rejectionReason && (
                  <p className="mt-2 text-rose-700">
                    Review reason: {report.rejectionReason}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminReportsPage;

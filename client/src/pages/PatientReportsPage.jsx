import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const PatientReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const downloadReport = async (report) => {
    if (downloadingId) return;
    setDownloadingId(report._id);
    setError("");
    try {
      const response = await api.get(`/reports/${report._id}/download`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `healthcare-report-${report.test?.code}.pdf`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      let message = err.response?.data?.message;
      if (!message && err.response?.data instanceof Blob) {
        try {
          message = JSON.parse(await err.response.data.text()).message;
        } catch {
          message = "";
        }
      }
      setError(message || "Unable to download report.");
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await api.get("/reports/my");
        setReports(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              Patient Portal
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Approved reports
            </h1>
          </div>
          <Link
            to="/dashboard"
            className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
          >
            Dashboard
          </Link>
        </header>
        {loading ? (
          <div className="rounded-2xl bg-white p-7 shadow-sm">
            Loading reports...
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-rose-50 p-7 text-rose-700">
            {error}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl bg-white p-7 text-slate-700 shadow-sm">
            No approved reports are available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <article
                key={report._id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                      {report.test?.code}
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-slate-900">
                      {report.tests?.length
                        ? report.tests.map((test) => test.name).join(", ")
                        : report.test?.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                      APPROVED
                    </span>
                    <button
                      type="button"
                      disabled={downloadingId === report._id}
                      onClick={() => downloadReport(report)}
                      className="rounded-full bg-cyan-700 px-3 py-1 text-sm font-semibold text-white"
                    >
                      {downloadingId === report._id
                        ? "Preparing PDF..."
                        : "Download PDF"}
                    </button>
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <div className="mb-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p>
                      <strong>Sample ID:</strong>{" "}
                      {report.appointment?.sampleId || "Not available"}
                    </p>
                    <p>
                      <strong>Technician:</strong>{" "}
                      {report.technician?.name || "HealthCare team"}
                    </p>
                    <p>
                      <strong>Report date:</strong>{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Approval status:</strong> {report.status}
                    </p>
                  </div>
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="py-2 pr-5">Test</th>
                        <th className="py-2 pr-5">Marker</th>
                        <th className="py-2 pr-5">Value</th>
                        <th className="py-2 pr-5">Unit</th>
                        <th className="py-2 pr-5">Flag</th>
                        <th className="py-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.results.map((result, index) => (
                        <tr key={`${report._id}-${index}`}>
                          <td className="py-3 pr-5 text-slate-600">
                            {result.test?.name || report.test?.name || "Test"}
                          </td>
                          <td className="py-3 pr-5 font-medium text-slate-800">
                            {result.marker}
                          </td>
                          <td className="py-3 pr-5 text-slate-700">
                            {result.value}
                          </td>
                          <td className="py-3 pr-5 text-slate-600">
                            {result.unit || "-"}
                          </td>
                          <td className="py-3 pr-5 text-slate-700">
                            {result.flag}
                          </td>
                          <td className="py-3 text-slate-600">
                            {result.remarks || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-slate-600">{report.interpretation}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default PatientReportsPage;

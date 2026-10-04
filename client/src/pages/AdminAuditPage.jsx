import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const AdminAuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const { data } = await api.get("/audit/admin");
        setLogs(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load audit logs.");
      }
    };
    loadLogs();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              Admin Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Audit log
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
        {logs.length === 0 ? (
          <div className="rounded-2xl bg-white p-7 text-slate-700 shadow-sm">
            No audit events recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Time</th>
                  <th className="px-5 py-4">Actor</th>
                  <th className="px-5 py-4">Action</th>
                  <th className="px-5 py-4">Entity</th>
                  <th className="px-5 py-4">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {log.actor?.name || "System"}
                      </p>
                      <p className="text-slate-500">
                        {log.actor?.email || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-cyan-800">
                      {log.action}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {log.entityType} {log.entityId && `· ${log.entityId}`}
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {log.ipAddress || "-"}
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

export default AdminAuditPage;

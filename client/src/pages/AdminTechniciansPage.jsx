import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const technicianStatuses = [
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
  "SUSPENDED",
];

const AdminTechniciansPage = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [tests, setTests] = useState([]);

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const [{ data }, testResponse] = await Promise.all([
          api.get("/users/technicians"),
          api.get("/tests"),
        ]);
        setTechnicians(data.data || []);
        setTests(testResponse.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load technicians.");
      } finally {
        setLoading(false);
      }
    };

    loadTechnicians();
  }, []);

  const updateStatus = async (technicianId, technicianStatus) => {
    setError("");
    let rejectionReason = rejectionReasons[technicianId] || "";
    if (technicianStatus === "REJECTED" && !rejectionReason) {
      rejectionReason =
        window.prompt("Enter the rejection reason:")?.trim() || "";
      if (!rejectionReason) {
        setError("A rejection reason is required.");
        return;
      }
      setRejectionReasons((current) => ({
        ...current,
        [technicianId]: rejectionReason,
      }));
    }
    try {
      const { data } = await api.patch(
        `/users/technicians/${technicianId}/status`,
        { technicianStatus, rejectionReason },
      );
      setTechnicians((current) =>
        current.map((technician) =>
          technician._id === technicianId ? data.data : technician,
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update technician status.",
      );
    }
  };

  const updateQualifications = async (technicianId, event) => {
    const qualifiedTests = Array.from(
      event.target.selectedOptions,
      (option) => option.value,
    );
    try {
      const { data } = await api.patch(
        `/users/technicians/${technicianId}/qualifications`,
        { qualifiedTests },
      );
      setTechnicians((current) =>
        current.map((technician) =>
          technician._id === technicianId ? data.data : technician,
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update qualifications.",
      );
    }
  };

  const openDocument = async (technicianId, documentId, name) => {
    try {
      const response = await api.get(
        `/users/technicians/${technicianId}/documents/${documentId}`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to access verification document.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              Admin Workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Technician verification
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
          <div className="rounded-2xl bg-white p-7 text-slate-700 shadow-sm">
            Loading technicians...
          </div>
        ) : technicians.length === 0 ? (
          <div className="rounded-2xl bg-white p-7 text-slate-700 shadow-sm">
            No technician accounts found.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {technicians.map((technician) => (
              <article
                key={technician._id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {technician.name}
                    </h2>
                    <p className="mt-1 text-slate-600">{technician.email}</p>
                    <p className="mt-1 text-slate-600">
                      {technician.phone || "No phone provided"}
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
                    {technician.technicianStatus}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 text-sm text-slate-600">
                  <p>
                    <strong className="text-slate-800">Qualification:</strong>{" "}
                    {technician.qualification || "Not provided"}
                  </p>
                  <p>
                    <strong className="text-slate-800">Experience:</strong>{" "}
                    {technician.experience || "Not provided"}
                  </p>
                  <label className="block">
                    <strong className="text-slate-800">
                      Qualified test catalog:
                    </strong>
                    <select
                      multiple
                      value={(technician.qualifiedTests || []).map(
                        (test) => test._id || test,
                      )}
                      onChange={(event) =>
                        updateQualifications(technician._id, event)
                      }
                      className="mt-2 min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2"
                    >
                      {tests.map((test) => (
                        <option key={test._id} value={test._id}>
                          {test.name} ({test.code})
                        </option>
                      ))}
                    </select>
                  </label>
                  {technician.rejectionReason && (
                    <p className="text-rose-700">
                      <strong>Rejection reason:</strong>{" "}
                      {technician.rejectionReason}
                    </p>
                  )}
                  {technician.verificationDocuments?.length > 0 && (
                    <div>
                      <strong className="text-slate-800">Documents:</strong>
                      <ul className="mt-1 space-y-1">
                        {technician.verificationDocuments.map((document) => (
                          <li key={document._id}>
                            <button
                              type="button"
                              className="text-cyan-700 underline"
                              onClick={() =>
                                openDocument(
                                  technician._id,
                                  document._id,
                                  document.originalName,
                                )
                              }
                            >
                              {document.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <label
                  className="mt-5 block text-sm font-medium text-slate-700"
                  htmlFor={`technician-${technician._id}`}
                >
                  Verification status
                  <select
                    id={`technician-${technician._id}`}
                    value={technician.technicianStatus}
                    onChange={(event) =>
                      updateStatus(technician._id, event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:border-cyan-500"
                  >
                    {technicianStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {technician.rejectionReason && (
                    <p className="mt-2 text-sm text-rose-700">
                      Current reason: {technician.rejectionReason}
                    </p>
                  )}
                </label>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminTechniciansPage;

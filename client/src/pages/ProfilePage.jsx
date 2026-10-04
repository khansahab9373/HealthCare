import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const ProfilePage = () => {
  const { user, updateProfile, updateUser } = useAuth();
  const technician = user?.role === "TECHNICIAN";
  const admin = user?.role === "ADMIN";
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pincode: user?.address?.pincode || "",
    qualification: user?.qualification || "",
    experience: user?.experience || "",
    professionalSkills: user?.professionalSkills?.join(", ") || "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (saving) return;
    setMessage("");
    setError("");
    setSaving(true);
    try {
      const profile = admin
        ? { name: form.name.trim() }
        : {
            name: form.name.trim(),
            phone: form.phone,
            address: {
              street: form.street,
              city: form.city,
              state: form.state,
              pincode: form.pincode,
            },
            ...(technician && {
              qualification: form.qualification,
              experience: form.experience,
              professionalSkills: form.professionalSkills
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            }),
          };
      await updateProfile(profile);
      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              HealthCare
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Your profile
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
          onSubmit={saveProfile}
          className="space-y-6 rounded-2xl bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {admin ? "Account details" : "Contact details"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {admin
                ? "Administrator account information."
                : "Your email and role are managed securely by HealthCare."}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Full name
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
              />
            </label>
            {!admin && (
              <label className="text-sm font-medium text-slate-700">
                Phone
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  pattern="[+0-9() -]{7,20}"
                  value={form.phone}
                  onChange={updateField}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                />
              </label>
            )}
            {admin && (
              <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:col-span-2 sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="break-all font-semibold text-slate-800">
                    {user.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Role</dt>
                  <dd className="font-semibold text-slate-800">
                    Administrator
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Account status</dt>
                  <dd className="font-semibold text-slate-800">
                    {user.isActive === false ? "Inactive" : "Active"}
                  </dd>
                </div>
                {user.updatedAt && (
                  <div>
                    <dt className="text-slate-500">Last updated</dt>
                    <dd className="font-semibold text-slate-800">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
          {technician && (
            <>
              <div className="rounded-xl bg-cyan-50 p-4">
                <p className="font-bold text-cyan-900">
                  Verification: {user.technicianStatus}
                </p>
                {user.rejectionReason && (
                  <p className="mt-1 text-sm text-rose-700">
                    Reason: {user.rejectionReason}
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  Qualification
                  <input
                    name="qualification"
                    value={form.qualification}
                    onChange={updateField}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Experience
                  <input
                    name="experience"
                    value={form.experience}
                    onChange={updateField}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Professional information
                  <input
                    name="professionalSkills"
                    value={form.professionalSkills}
                    onChange={updateField}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  />
                </label>
              </div>
            </>
          )}
          {!admin && (
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {technician ? "Address" : "Saved collection address"}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                  Street
                  <input
                    name="street"
                    value={form.street}
                    onChange={updateField}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  City
                  <input
                    name="city"
                    value={form.city}
                    onChange={updateField}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  State
                  <input
                    name="state"
                    value={form.state}
                    onChange={updateField}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Pincode
                  <input
                    name="pincode"
                    inputMode="numeric"
                    pattern="[0-9]{5,10}"
                    value={form.pincode}
                    onChange={updateField}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  />
                </label>
              </div>
            </div>
          )}
          {message && <p className="text-emerald-700">{message}</p>}
          {error && <p className="text-rose-700">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
        {technician && (
          <TechnicianDocuments
            user={user}
            updateUser={updateUser}
            setError={setError}
            setMessage={setMessage}
          />
        )}
      </div>
    </main>
  );
};

const TechnicianDocuments = ({ user, updateUser, setError, setMessage }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [documents, setDocuments] = useState(user.verificationDocuments || []);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const fileInput = useRef(null);

  const selectFile = (selectedFile) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (
      !allowedTypes.includes(selectedFile.type) ||
      selectedFile.size > 5 * 1024 * 1024
    ) {
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      setError("Choose a PDF, JPG, PNG, or WEBP file no larger than 5 MB.");
      return;
    }
    setFile(selectedFile);
    setError("");
  };

  const upload = async (event) => {
    event.preventDefault();
    if (!file || uploading) return;
    setUploading(true);
    setError("");
    const body = new FormData();
    body.append("document", file);
    body.append("name", name);
    try {
      const { data } = await api.post("/users/me/verification-documents", body);
      const updatedUser = { ...user, ...data.data };
      updateUser(updatedUser);
      setDocuments(updatedUser.verificationDocuments || []);
      setFile(null);
      setName("");
      if (fileInput.current) fileInput.current.value = "";
      setMessage("Verification document uploaded.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const download = async (document) => {
    setDownloadingId(document._id);
    setError("");
    try {
      const response = await api.get(
        `/users/technicians/${user._id}/documents/${document._id}`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(response.data);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.originalName || document.name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to download document.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">
        Verification documents
      </h2>
      <form onSubmit={upload} className="mt-4 flex flex-wrap gap-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Document name"
          aria-label="Document name"
          required
          className="rounded-xl border border-slate-200 px-3 py-2"
        />
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          ref={fileInput}
          onChange={(event) => selectFile(event.target.files[0])}
          required
          className="rounded-xl border border-slate-200 px-3 py-2"
        />
        <button
          type="submit"
          disabled={!file || uploading}
          className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white"
        >
          {uploading ? "Uploading..." : "Upload document"}
        </button>
      </form>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {documents.map((document) => (
          <li
            key={document._id}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <span>
              {document.name} ({Math.ceil(document.size / 1024)} KB)
            </span>
            <button
              type="button"
              disabled={downloadingId === document._id}
              onClick={() => download(document)}
              className="font-semibold text-cyan-800 underline disabled:opacity-60"
            >
              {downloadingId === document._id ? "Downloading..." : "Download"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProfilePage;

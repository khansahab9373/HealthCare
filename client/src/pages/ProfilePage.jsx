import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const technician = user?.role === "TECHNICIAN";
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

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await updateProfile({
        name: form.name,
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
      });
      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save profile.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              BloodCare
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
              Contact details
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your email and role are managed securely by BloodCare.
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
            <label className="text-sm font-medium text-slate-700">
              Phone
              <input
                name="phone"
                value={form.phone}
                onChange={updateField}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
              />
            </label>
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
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Saved collection address
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
                  value={form.pincode}
                  onChange={updateField}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                />
              </label>
            </div>
          </div>
          {message && <p className="text-emerald-700">{message}</p>}
          {error && <p className="text-rose-700">{error}</p>}
          <button
            type="submit"
            className="rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white"
          >
            Save profile
          </button>
        </form>
        {technician && (
          <TechnicianDocuments
            user={user}
            setError={setError}
            setMessage={setMessage}
          />
        )}
      </div>
    </main>
  );
};

const TechnicianDocuments = ({ user, setError, setMessage }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const upload = async (event) => {
    event.preventDefault();
    const body = new FormData();
    body.append("document", file);
    body.append("name", name);
    try {
      const { data } = await api.post("/users/me/verification-documents", body);
      localStorage.setItem(
        "bloodcare_user",
        JSON.stringify({ ...user, ...data.data }),
      );
      setFile(null);
      setName("");
      setMessage("Verification document uploaded.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to upload document.");
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
          required
          className="rounded-xl border border-slate-200 px-3 py-2"
        />
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={(event) => setFile(event.target.files[0])}
          required
          className="rounded-xl border border-slate-200 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white"
        >
          Upload document
        </button>
      </form>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {(user.verificationDocuments || []).map((document) => (
          <li key={document._id}>
            {document.name} ({Math.ceil(document.size / 1024)} KB)
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProfilePage;

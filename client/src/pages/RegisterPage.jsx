import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const RegisterPage = ({ technicianOnly = false }) => {
  const navigate = useNavigate();
  const { register, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: technicianOnly ? "TECHNICIAN" : "PATIENT",
    qualification: "",
    experience: "",
    professionalSkills: "",
    addressStreet: "",
    addressCity: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tests, setTests] = useState([]);
  const [qualifiedTests, setQualifiedTests] = useState([]);
  const [licenseDocument, setLicenseDocument] = useState(null);
  const [accountCreated, setAccountCreated] = useState(false);

  useEffect(() => {
    let active = true;
    const isTechnician = technicianOnly || form.role === "TECHNICIAN";

    if (!isTechnician) {
      setTests([]);
      setQualifiedTests([]);
      return () => {
        active = false;
      };
    }

    api
      .get("/tests")
      .then(({ data }) => {
        if (active) setTests(data.data || []);
      })
      .catch(() => {
        if (active) setTests([]);
      });

    return () => {
      active = false;
    };
  }, [technicianOnly, form.role]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "role" && value === "PATIENT") {
      setQualifiedTests([]);
      setLicenseDocument(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setError("");

    if (form.role === "TECHNICIAN" && !licenseDocument) {
      setError("Upload your licence or registration document to continue.");
      return;
    }

    setSubmitting(true);

    try {
      const registration = await register({
        ...form,
        professionalSkills: form.professionalSkills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        address: {
          street: form.addressStreet || "",
          city: form.addressCity || "",
        },
        qualifiedTests,
      });
      if (form.role === "TECHNICIAN") {
        const document = new FormData();
        document.append("document", licenseDocument);
        document.append("name", "Licence / Registration Document");
        try {
          const { data } = await api.post(
            "/users/me/verification-documents",
            document,
          );
          updateUser({
            ...registration.data.user,
            verificationDocuments: data.data.verificationDocuments || [],
          });
        } catch (uploadError) {
          const message =
            uploadError.response?.data?.message ||
            "Unable to upload your verification document.";
          setError(
            `Your technician account was created, but the document upload failed: ${message} Sign in and retry the upload from your profile.`,
          );
          setAccountCreated(true);
          return;
        }
      }
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          HealthCare
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Create your account
        </h1>
        <p className="mt-2 text-slate-500">
          Create a patient account or apply as a technician.
        </p>

        <form
          className="mt-6 grid gap-4 md:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-cyan-500"
              placeholder="Jane Doe"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-cyan-500"
              placeholder="jane@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              pattern="[0-9+() -]{7,20}"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-cyan-500"
              placeholder="9876543210"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              minLength={8}
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-cyan-500"
              placeholder="••••••••"
              required
            />
          </div>
          {!technicianOnly && (
            <div>
              <label htmlFor="register-role" className="mb-2 block text-sm font-medium text-slate-700">
                Role
              </label>
              <select
                id="register-role"
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-cyan-500"
              >
                <option value="PATIENT">PATIENT</option>
                <option value="TECHNICIAN">TECHNICIAN</option>
              </select>
            </div>
          )}
          {form.role === "TECHNICIAN" && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Qualification
                </label>
                <input
                  name="qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  placeholder="BSc MLT"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Experience
                </label>
                <input
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  placeholder="3 years"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Professional skills
                </label>
                <input
                  name="professionalSkills"
                  value={form.professionalSkills}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  placeholder="CBC, Lipid Profile"
                  required
                />
              </div>
              <div className="md:col-span-2 grid gap-4 sm:grid-cols-2">
                <input
                  name="addressStreet"
                  onChange={handleChange}
                  placeholder="Street address"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                />
                <input
                  name="addressCity"
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="qualified-tests" className="mb-2 block text-sm font-medium text-slate-700">
                  Qualified tests
                </label>
                <select
                  id="qualified-tests"
                  multiple
                  value={qualifiedTests}
                  onChange={(event) =>
                    setQualifiedTests(
                      Array.from(
                        event.target.selectedOptions,
                        (option) => option.value,
                      ),
                    )
                  }
                  className="min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                  required
                >
                  {tests.map((test) => (
                    <option key={test._id} value={test._id}>
                      {test.name} ({test.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="license-document"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Licence / Registration Document
                </label>
                <input
                  id="license-document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  required
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0] || null;
                    if (!selectedFile) {
                      setLicenseDocument(null);
                      return;
                    }
                    const acceptedTypes = [
                      "application/pdf",
                      "image/jpeg",
                      "image/png",
                    ];
                    if (
                      !acceptedTypes.includes(selectedFile.type) ||
                      selectedFile.size > 5 * 1024 * 1024
                    ) {
                      event.target.value = "";
                      setLicenseDocument(null);
                      setError(
                        "Choose a PDF, JPG, JPEG, or PNG document no larger than 5 MB.",
                      );
                      return;
                    }
                    setError("");
                    setLicenseDocument(selectedFile);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                />
                <p className="mt-2 text-sm text-slate-500">
                  PDF, JPG, JPEG, or PNG. Maximum size 5 MB.
                </p>
              </div>
              <p className="md:col-span-2 text-sm text-slate-500">
                Technician applications remain pending until an administrator
                verifies them.
              </p>
            </>
          )}
          {error && (
            <p className="md:col-span-2 text-sm font-medium text-rose-600">
              {error}
            </p>
          )}
          {accountCreated && (
            <Link
              to="/profile"
              className="md:col-span-2 text-sm font-semibold text-cyan-800 underline"
            >
              Continue to your profile and retry document upload
            </Link>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-2 w-full rounded-xl bg-cyan-700 px-4 py-3 font-semibold text-white"
          >
            {submitting
              ? "Creating account..."
              : technicianOnly
                ? "Submit technician application"
                : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-cyan-700">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
};

export default RegisterPage;

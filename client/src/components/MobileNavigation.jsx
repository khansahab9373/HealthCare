import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const linksByRole = {
  PATIENT: [
    ["Dashboard", "/dashboard"],
    ["Book a test", "/patient/tests"],
    ["Appointments", "/patient/appointments"],
    ["Reports", "/patient/reports"],
  ],
  TECHNICIAN: [
    ["Dashboard", "/dashboard"],
    ["Assignments", "/technician/appointments"],
    ["Availability", "/technician/availability"],
  ],
  ADMIN: [
    ["Dashboard", "/dashboard"],
    ["Appointments", "/admin/appointments"],
    ["Reports", "/admin/reports"],
    ["Technicians", "/admin/technicians"],
    ["Tests", "/admin/tests"],
    ["Analytics", "/admin/analytics"],
    ["Audit log", "/admin/audit"],
  ],
};

const MobileNavigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  if (
    !user ||
    ["/", "/login", "/register", "/register/technician"].includes(
      location.pathname,
    )
  ) return null;

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="mobile-nav-trigger fixed right-4 top-4 z-40 rounded-xl bg-[#0d5c63] px-3 py-2 text-xl text-white shadow-lg"
      >
        <span aria-hidden="true">&#9776;</span>
      </button>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40"
        />
      )}
      <aside
        role="dialog"
        aria-modal={open ? "true" : undefined}
        aria-label="HealthCare navigation"
        aria-hidden={!open}
        className={`mobile-nav-drawer fixed right-0 top-0 z-50 flex h-full w-[min(84vw,20rem)] flex-col bg-white p-5 shadow-2xl ${open ? "is-open" : ""}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
              HealthCare
            </p>
            <p className="mt-1 font-semibold text-slate-900">{user.name}</p>
          </div>
          <button
            type="button"
            ref={closeRef}
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2 text-xl text-slate-500"
          >
            &times;
          </button>
        </div>
        <nav className="mt-5 space-y-1">
          {(linksByRole[user.role] || []).map(([label, href]) => (
            <Link
              key={href}
              to={href}
              onClick={() => setOpen(false)}
              aria-current={location.pathname === href ? "page" : undefined}
              className={`block rounded-xl px-3 py-3 font-semibold hover:bg-cyan-50 hover:text-cyan-800 ${location.pathname === href ? "bg-cyan-50 text-cyan-900" : "text-slate-700"}`}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            aria-current={location.pathname === "/notifications" ? "page" : undefined}
            className={`block rounded-xl px-3 py-3 font-semibold hover:bg-cyan-50 hover:text-cyan-800 ${location.pathname === "/notifications" ? "bg-cyan-50 text-cyan-900" : "text-slate-700"}`}
          >
            Notifications
          </Link>
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            aria-current={location.pathname === "/profile" ? "page" : undefined}
            className={`block rounded-xl px-3 py-3 font-semibold hover:bg-cyan-50 hover:text-cyan-800 ${location.pathname === "/profile" ? "bg-cyan-50 text-cyan-900" : "text-slate-700"}`}
          >
            Profile
          </Link>
        </nav>
        <button
          type="button"
          onClick={logout}
          className="mt-auto rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white"
        >
          Log out
        </button>
      </aside>
    </>
  );
};

export default MobileNavigation;

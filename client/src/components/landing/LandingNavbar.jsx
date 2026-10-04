import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { navigationItems } from "./landingContent.js";
import { Icon } from "./LandingPrimitives.jsx";

const LandingNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 8);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-shadow ${scrolled ? "border-slate-200 bg-white/95 shadow-sm backdrop-blur" : "border-transparent bg-white"}`}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
      >
        <Link
          to="/"
          className="flex min-h-11 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          onClick={() => setMenuOpen(false)}
        >
          <img src="/favicon.svg" alt="" className="h-10 w-10 rounded-xl" />
          <span className="text-lg font-bold text-slate-950 sm:text-xl">
            HealthCare
          </span>
        </Link>

        <button
          type="button"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="landing-navigation-links"
          onClick={() => setMenuOpen((open) => !open)}
          className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 lg:hidden"
        >
          <Icon name={menuOpen ? "close" : "menu"} className="h-5 w-5" />
        </button>

        <div
          id="landing-navigation-links"
          className={`${menuOpen ? "flex" : "hidden"} order-3 w-full flex-col gap-1 border-t border-slate-100 pt-3 lg:order-0 lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-1 lg:border-0 lg:pt-0`}
        >
          {navigationItems.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-teal-700"
            >
              {label}
            </a>
          ))}
          <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 pt-3 lg:ml-3 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-bold text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-700"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-teal-800 px-4 text-sm font-bold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default LandingNavbar;

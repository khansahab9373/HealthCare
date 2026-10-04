import { useState } from "react";
import { Link } from "react-router-dom";
import { faqItems } from "./landingContent.js";
import { Icon, SectionHeading } from "./LandingPrimitives.jsx";

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Frequently asked questions"
            title="Good to know before you begin"
            description="Find out how patients, technicians, and administrators use the platform."
          />
          <Link to="/register" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-teal-800 px-5 py-3 font-bold text-white hover:bg-teal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800">
            Get Started
          </Link>
        </div>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {faqItems.map(([question, answer], index) => {
            const open = openIndex === index;
            const answerId = `faq-answer-${index}`;
            return (
              <article key={question} className="py-1">
                <h3>
                  <button
                    id={`faq-question-${index}`}
                    type="button"
                    aria-expanded={open}
                    aria-controls={answerId}
                    onClick={() => setOpenIndex(open ? null : index)}
                    className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-teal-700"
                  >
                    <span>{question}</span>
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform motion-reduce:transition-none ${open ? "rotate-45 bg-teal-100 text-teal-900" : "bg-slate-100 text-slate-700"}`} aria-hidden="true">
                      <Icon name="close" className="h-4 w-4" />
                    </span>
                  </button>
                </h3>
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  aria-hidden={!open}
                  className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="pb-4 pr-10 leading-7 text-slate-600">{answer}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const FinalCTASection = () => (
  <section className="bg-[#eaf4f1] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div className="mx-auto grid max-w-7xl gap-8 rounded-3xl bg-[#123b40] p-6 text-white shadow-lg sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-14">
      <div>
        <p className="text-sm font-bold uppercase text-teal-100">Start with the next step</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">Ready to Experience Smarter Healthcare Management?</h2>
        <p className="mt-4 max-w-3xl leading-7 text-teal-50">Book appointments, manage laboratory workflows, track samples, and access approved reports through one connected platform.</p>
      </div>
      <div className="flex flex-wrap gap-3 lg:justify-end">
        <Link to="/register" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 py-3 font-bold text-teal-950 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Get Started</Link>
        <a href="#features" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/50 px-5 py-3 font-bold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Explore Features</a>
      </div>
    </div>
  </section>
);

const footerGroups = [
  ["Platform", [["Features", "#features"], ["How It Works", "#how-it-works"], ["Services", "#services"], ["FAQ", "#faq"]]],
  ["For Patients", [["Tests", "/patient/tests"], ["Appointments", "/patient/appointments"], ["Reports", "/patient/reports"], ["Profile", "/profile"]]],
  ["For Technicians", [["Technician Registration", "/register/technician"], ["Appointments", "/technician/appointments"], ["Availability", "/technician/availability"], ["Reports", "/technician/appointments"]]],
  ["Support", [["Notifications", "/notifications"], ["Help", "#faq"], ["Contact / Sign in", "/login"]]],
];

export const LandingFooter = () => (
  <footer className="bg-[#102f33] px-4 pb-6 pt-12 text-slate-200 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-10 border-b border-white/15 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="max-w-sm">
          <Link to="/" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-white">
            <img src="/favicon.svg" alt="" className="h-10 w-10 rounded-xl" />
            <span className="text-xl font-bold text-white">HealthCare</span>
          </Link>
          <p className="mt-4 leading-7 text-slate-300">An integrated web platform for medical laboratory appointment management, technician coordination, sample tracking, and digital diagnostic reports.</p>
        </div>
        {footerGroups.map(([title, links]) => (
          <div key={title}>
            <h2 className="font-bold text-white">{title}</h2>
            <ul className="mt-4 space-y-3">
              {links.map(([label, href]) => (
                <li key={`${title}-${label}`}>
                  {href.startsWith("#") ? (
                    <a className="rounded-sm text-sm text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-white" href={href}>{label}</a>
                  ) : (
                    <Link className="rounded-sm text-sm text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-white" to={href}>{label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 pt-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 HealthCare. All rights reserved.</span>
        <a href="#home" className="inline-flex min-h-10 items-center font-semibold text-slate-200 hover:text-white focus-visible:outline-2 focus-visible:outline-white">Back to top ↑</a>
      </div>
    </div>
  </footer>
);

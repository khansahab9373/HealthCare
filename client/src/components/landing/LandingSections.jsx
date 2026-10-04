import { Link } from "react-router-dom";
import { healthcareImages, services, workflowSteps } from "./landingContent.js";
import { HealthcareImage, Icon, SectionHeading } from "./LandingPrimitives.jsx";

export const HeroSection = () => (
  <section id="home" className="relative scroll-mt-24 overflow-hidden bg-[linear-gradient(115deg,#eff8f5_0%,#ffffff_55%,#eff7fa_100%)]">
    <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:px-8 lg:py-20">
      <div className="relative z-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-sm font-semibold text-teal-900">
          <Icon name="test" className="h-4 w-4" />
          Medical lab appointments and tracking
        </span>
        <h1 aria-label="Smarter Healthcare. Simpler Lab Appointments." className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] text-slate-950 sm:text-5xl lg:text-6xl">
          Smarter Healthcare.<br />Simpler Lab Appointments.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
          HealthCare connects patients, medical laboratory technicians, and administrators through one secure platform for appointment booking, sample tracking, technician management, and digital diagnostic reports.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/patient/tests" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-800 px-5 py-3 font-bold text-white shadow-sm transition-colors hover:bg-teal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800">
            Book an Appointment
          </Link>
          <a href="#services" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 transition-colors hover:border-teal-700 hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800">
            Explore Platform
          </a>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-700">
          {["Patient access", "Technician coordination", "Reviewed digital reports"].map((item) => (
            <span key={item} className="inline-flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-teal-100 text-teal-900" aria-hidden="true">✓</span>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-2xl">
        <div className="absolute -left-4 top-10 hidden h-24 w-24 rounded-3xl border border-teal-200 sm:block" aria-hidden="true" />
        <HealthcareImage
          src={healthcareImages.laboratory}
          alt="Medical laboratory technician working with diagnostic testing equipment"
          loading="eager"
          className="relative aspect-5/4 rounded-3xl shadow-xl ring-1 ring-slate-900/5"
          imageClassName="transition-transform duration-700 hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
        />
        <div className="absolute -bottom-5 left-3 right-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:bottom-6 sm:left-0 sm:right-auto sm:w-[min(82%,24rem)] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-teal-800">Platform workflow preview</p>
              <p className="mt-1 font-bold text-slate-950">Sample journey</p>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-900">Tracking</span>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[11px] font-semibold text-slate-600 sm:text-xs">
            {["Booked", "Collected", "Testing", "Report"].map((stage, index) => (
              <div key={stage} className="min-w-0">
                <span className={`mx-auto grid h-7 w-7 place-items-center rounded-full ${index < 3 ? "bg-teal-800 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {index + 1}
                </span>
                <span className="mt-2 block wrap-break-word">{stage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const capabilityStats = [
  ["3", "supported user roles", "users"],
  ["30 min", "appointment slot structure", "clock"],
  ["5+", "sample status milestones", "activity"],
  ["1", "connected lab workflow", "layout"],
];

export const TrustStrip = () => (
  <section aria-label="HealthCare platform capabilities" className="border-y border-slate-200 bg-white">
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <p className="text-center text-sm font-semibold text-slate-600">Built for modern diagnostic healthcare workflows</p>
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {capabilityStats.map(([value, label, icon]) => (
          <div key={label} className="flex min-w-0 items-center justify-center gap-3 rounded-xl bg-slate-50 px-3 py-4 sm:justify-start sm:px-5">
            <Icon name={icon} className="h-6 w-6 shrink-0 text-teal-800" />
            <div className="min-w-0">
              <p className="text-xl font-bold leading-tight text-slate-950">{value}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">{label}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">Platform capabilities, not customer or outcome claims.</p>
    </div>
  </section>
);

export const ServicesSection = () => (
  <section id="services" className="scroll-mt-24 bg-[#f5f9f8] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <SectionHeading
        eyebrow="Healthcare services"
        title="Everything You Need for Better Lab Management"
        description="A coordinated set of tools supports the steps around diagnostic testing, from the first appointment request to an approved report."
        center
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <article key={service.title} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none">
            <span className={`grid h-12 w-12 place-items-center rounded-xl ${index % 3 === 1 ? "bg-cyan-50 text-cyan-900" : index % 3 === 2 ? "bg-rose-50 text-rose-800" : "bg-teal-50 text-teal-900"}`}>
              <Icon name={service.icon} className="h-6 w-6" />
            </span>
            <h3 className="mt-5 text-xl font-bold text-slate-950">{service.title}</h3>
            <p className="mt-3 leading-7 text-slate-600">{service.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export const HowItWorksSection = () => (
  <section id="how-it-works" className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <SectionHeading
        eyebrow="How HealthCare works"
        title="A clear path through the lab journey"
        description="Each step connects to a defined workflow, with the platform recording appointment and sample progress along the way."
        center
      />
      <div className="relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="absolute left-[12%] right-[12%] top-8 hidden border-t-2 border-dashed border-teal-200 lg:block" aria-hidden="true" />
        {workflowSteps.map(([number, title, description]) => (
          <article key={number} className="relative rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border-4 border-white bg-teal-800 text-sm font-bold text-white shadow-sm">{number}</span>
            <h3 className="mt-5 text-lg font-bold text-slate-950">{title}</h3>
            <p className="mt-2 leading-6 text-slate-600">{description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const platformBenefits = [
  "Simple appointment booking",
  "Technician qualification matching",
  "Availability and blocked-slot management",
  "Sample lifecycle tracking",
  "Administrator-led verification",
  "Report review and approval",
  "Secure patient access",
  "Notifications and auditability",
];

export const WhyChooseSection = () => (
  <section id="about" className="scroll-mt-24 bg-[#eaf4f1] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
      <div>
        <SectionHeading
          eyebrow="One coordinated platform"
          title="Healthcare Designed Around the Complete Lab Journey"
          description="HealthCare brings patient, technician, and administrator tasks into one connected workflow, while keeping each role’s permissions distinct."
        />
        <Link to="/register" className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-teal-800 px-5 py-3 font-bold text-white hover:bg-teal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800">
          Get Started
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {platformBenefits.map((benefit, index) => (
          <div key={benefit} className="flex min-h-16 items-center gap-3 rounded-xl border border-white bg-white/80 p-4 shadow-sm">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-900" aria-hidden="true">✓</span>
            <span className="font-semibold leading-6 text-slate-800">{benefit}</span>
            <span className="sr-only">Platform capability {index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const patientTasks = [
  "Create an account and browse diagnostic tests",
  "Review preparation details and choose a date and time",
  "Select home collection or a laboratory visit when available",
  "Track appointment and sample status",
  "Reschedule or cancel where the workflow allows",
  "Receive notifications and access approved reports",
  "Download an available report as a PDF",
];

export const PatientJourneySection = () => (
  <section id="patients" className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div className="relative order-2 lg:order-1">
        <HealthcareImage
          src={healthcareImages.patient}
          alt="Healthcare professional using a digital device to coordinate patient care"
          className="aspect-4/3 rounded-3xl shadow-lg"
        />
        <div className="absolute -bottom-4 right-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:right-6">
          <p className="text-xs font-bold uppercase text-teal-800">Patient workspace</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">Appointments · Samples · Reports</p>
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <SectionHeading
          eyebrow="For patients"
          title="From Appointment to Report — All in One Place"
          description="Patients can follow the appointment and report process without losing sight of the next step."
        />
        <ul className="mt-6 space-y-3">
          {patientTasks.map((task) => (
            <li key={task} className="flex items-start gap-3 text-slate-700">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-100 text-sm font-bold text-teal-900" aria-hidden="true">✓</span>
              <span className="leading-6">{task}</span>
            </li>
          ))}
        </ul>
        <Link to="/patient/tests" className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-teal-800 px-5 py-3 font-bold text-white hover:bg-teal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800">
          Start Your Healthcare Journey
        </Link>
      </div>
    </div>
  </section>
);

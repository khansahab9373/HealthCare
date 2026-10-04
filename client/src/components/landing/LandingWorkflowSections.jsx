import { Link } from "react-router-dom";
import { features, healthcareImages } from "./landingContent.js";
import { Eyebrow, HealthcareImage, Icon, SectionHeading } from "./LandingPrimitives.jsx";

const technicianTasks = [
  "Apply for a technician account and submit qualifications",
  "Complete the administrator verification workflow",
  "Manage weekly availability and blocked periods",
  "Review assigned appointments and sample status",
  "Prepare and submit reports for administrator review",
  "Receive updates through platform notifications",
];

export const TechnicianPlatformSection = () => (
  <section id="technicians" className="scroll-mt-24 bg-[#f5f9f8] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div>
        <SectionHeading
          eyebrow="For medical laboratory technicians"
          title="Empowering Medical Laboratory Technicians"
          description="A dedicated technician workspace supports verification, scheduling, assigned appointments, sample handling, and report submission."
        />
        <ul className="mt-6 space-y-3">
          {technicianTasks.map((task) => (
            <li key={task} className="flex items-start gap-3 text-slate-700">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-teal-100 text-sm font-bold text-teal-900" aria-hidden="true">✓</span>
              <span className="leading-6">{task}</span>
            </li>
          ))}
        </ul>
        <Link to="/register/technician" className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-teal-800 px-5 py-3 font-bold text-white hover:bg-teal-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800">
          Technician Registration
        </Link>
      </div>
      <div className="relative">
        <HealthcareImage
          src={healthcareImages.technician}
          alt="Medical laboratory technician examining a specimen with a microscope"
          className="aspect-4/3 rounded-3xl shadow-lg"
        />
        <div className="absolute -bottom-5 left-3 right-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:left-6 sm:right-6 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Eyebrow>Workspace preview</Eyebrow>
              <p className="mt-1 font-bold text-slate-950">Technician workflow</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Illustrative UI</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs sm:gap-3">
            {[["Availability", "Weekly schedule"], ["Assignments", "Appointment queue"], ["Reports", "Submit for review"]].map(([label, detail]) => (
              <div key={label} className="rounded-xl bg-teal-50 p-3">
                <p className="font-bold text-teal-950">{label}</p>
                <p className="mt-1 leading-5 text-slate-600">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const ReportManagementSection = () => (
  <section id="reports" className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16">
      <div className="order-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-7 lg:order-1">
        <HealthcareImage
          src={healthcareImages.report}
          alt="Healthcare professional reviewing digital information beside a stethoscope"
          className="mb-4 aspect-16/7 rounded-2xl"
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-5">
            <div>
              <p className="text-xs font-bold uppercase text-teal-800">Illustrative report preview</p>
              <h3 className="mt-2 text-xl font-bold text-slate-950">Sample Report</h3>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">Admin review</span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-xs font-bold uppercase text-slate-500 sm:gap-4">
            <span>Test Result</span><span>Reference Range</span><span>Status</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 border-y border-slate-100 py-4 text-sm text-slate-700 sm:gap-4">
            <span>Sample value</span><span>Configured range</span><span>For review</span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 sm:gap-3">
            {["Technician prepares", "Admin reviews", "Patient access"].map((step, index) => (
              <span key={step} className="inline-flex items-center gap-2">
                {index > 0 && <span className="text-teal-700" aria-hidden="true">→</span>}
                {step}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">Demo interface only. No real patient result or diagnosis is shown.</p>
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <SectionHeading
          eyebrow="Reviewed before access"
          title="Secure Digital Diagnostic Reports"
          description="Report management follows a deliberate handoff so patients can access a report only after the configured review and publishing workflow."
        />
        <ol className="mt-6 space-y-3">
          {["Technician prepares and submits the report", "Administrator reviews, requests changes, or approves", "Administrator publishes the approved report", "Patient receives access and can download a PDF"].map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-800 text-sm font-bold text-white">{index + 1}</span>
              <span className="pt-1 leading-6 text-slate-700">{step}</span>
            </li>
          ))}
        </ol>
        <Link to="/login" className="mt-7 inline-flex min-h-11 items-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800 hover:border-teal-700 hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800">
          Explore the report workflow
        </Link>
      </div>
    </div>
  </section>
);

export const CollectionOptionsSection = () => (
  <section id="collection" className="scroll-mt-24 bg-[#eaf4f1] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <SectionHeading
        eyebrow="Collection choices"
        title="Healthcare That Fits Your Schedule"
        description="Choose the supported collection option that fits the test and appointment workflow. Availability depends on the selected test and open slots."
        center
      />
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <HealthcareImage src={healthcareImages.collection} alt="Medical professional collecting a blood sample from a seated donor" className="aspect-16/8" />
          <div className="p-5 sm:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-900"><Icon name="home" /></span>
            <h3 className="mt-4 text-xl font-bold text-slate-950">Home Sample Collection</h3>
            <p className="mt-2 leading-7 text-slate-600">Request convenient sample collection from your preferred location when the test offers this option.</p>
          </div>
        </article>
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <HealthcareImage src={healthcareImages.laboratory} alt="Diagnostic laboratory equipment arranged for lab testing" className="aspect-16/8" />
          <div className="p-5 sm:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-50 text-cyan-900"><Icon name="building" /></span>
            <h3 className="mt-4 text-xl font-bold text-slate-950">Laboratory Visit</h3>
            <p className="mt-2 leading-7 text-slate-600">Choose an available laboratory appointment slot for tests that support an in-lab visit.</p>
          </div>
        </article>
      </div>
    </div>
  </section>
);

export const PlatformFeaturesSection = () => (
  <section id="features" className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <SectionHeading
        eyebrow="Platform features"
        title="The operational tools behind every step"
        description="Role-aware tools support care coordination and laboratory operations without mixing responsibilities."
        center
      />
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {features.map(([icon, title, description]) => (
          <article key={title} className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-teal-300 hover:bg-teal-50/50 motion-reduce:transition-none">
            <Icon name={icon} className="h-6 w-6 text-teal-800" />
            <h3 className="mt-4 font-bold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

const impactCapabilities = [
  ["3", "User roles"],
  ["30 min", "Slot structure"],
  ["5+", "Sample status milestones"],
  ["1", "Connected platform"],
];

export const PlatformImpactSection = () => (
  <section id="impact" className="scroll-mt-24 bg-[#123b40] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <div>
          <Eyebrow light>Platform capabilities</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">A connected foundation for lab operations</h2>
        </div>
        <p className="max-w-2xl leading-7 text-teal-50">These figures describe supported application workflows, not customer counts, clinical outcomes, or business performance.</p>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {impactCapabilities.map(([value, label]) => (
          <div key={label} className="rounded-xl border border-white/15 bg-white/5 p-5 sm:p-6">
            <p className="text-3xl font-bold sm:text-4xl">{value}</p>
            <p className="mt-2 leading-6 text-teal-100">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const sampleFeedback = [
  ["Patient User", "Booking an appointment and tracking sample status is easier when the next steps are visible in one place."],
  ["Laboratory Technician", "A dedicated workspace brings availability, assigned appointments, sample updates, and report submission together."],
  ["Healthcare Administrator", "Review queues make it easier to follow technician verification and report approval workflows."],
];

export const TestimonialsSection = () => (
  <section className="bg-[#f5f9f8] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <SectionHeading
        eyebrow="Sample user feedback"
        title="Designed around the people in the workflow"
        description="Representative platform feedback for demonstration. These are not attributed to actual customers."
        center
      />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {sampleFeedback.map(([role, quote]) => (
          <figure key={role} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="text-3xl font-bold text-teal-700" aria-hidden="true">“</span>
            <blockquote className="flex-1 leading-7 text-slate-700">{quote}</blockquote>
            <figcaption className="mt-5 border-t border-slate-100 pt-4 text-sm font-bold text-slate-900">{role}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

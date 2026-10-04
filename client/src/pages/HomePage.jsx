import { Link } from "react-router-dom";
import heroMark from "../assets/hero.png";

const HomePage = () => {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f8f7] text-slate-900">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0d5c63] text-lg font-black text-white">
            H
          </span>
          <span className="text-xl font-bold tracking-tight">HealthCare</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 font-semibold text-slate-700">
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-[#e56b55] px-5 py-2.5 font-semibold text-white shadow-lg shadow-rose-900/10"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-28 lg:pt-16">
        <div>
          <p className="inline-flex rounded-full bg-[#d8ebe6] px-4 py-2 text-sm font-bold text-[#0d5c63]">
            Diagnostics, made human
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-[#123b40] md:text-7xl">
            Know your health. Move with confidence.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Book trusted blood tests, choose a lab visit or home collection, and
            follow every result from one calm, secure workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="rounded-full bg-[#0d5c63] px-6 py-3.5 font-bold text-white shadow-xl shadow-[#0d5c63]/20"
            >
              Book a test
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-700"
            >
              Open patient portal
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-8 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <span>
              <strong className="block text-2xl text-[#123b40]">24h</strong>
              Typical reports
            </span>
            <span>
              <strong className="block text-2xl text-[#123b40]">2 ways</strong>
              To collect samples
            </span>
            <span>
              <strong className="block text-2xl text-[#123b40]">1 place</strong>
              For your care
            </span>
          </div>
        </div>
        <div className="relative min-h-105 rounded-4xl bg-[#123b40] p-8 shadow-2xl shadow-[#123b40]/20 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,107,85,0.35),transparent_42%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a8d8ce]">
                Your care, in view
              </p>
              <h2 className="mt-4 max-w-md text-3xl font-bold leading-tight text-white md:text-4xl">
                From first booking to approved report.
              </h2>
            </div>
            <div className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center justify-between text-sm text-white">
                <span>Sample journey</span>
                <span className="text-[#a8d8ce]">03 / 04</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-white/15">
                <div className="h-2 w-3/4 rounded-full bg-[#e56b55]" />
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-slate-200">
                <span>Booked</span>
                <span>Collected</span>
                <span className="font-bold text-white">Report review</span>
              </div>
            </div>
            <img
              src={heroMark}
              alt="BloodCare diagnostic journey mark"
              className="absolute -bottom-8 -right-6 w-36 opacity-60"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e56b55]">
              A clearer way forward
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#123b40] md:text-4xl">
              Everything that matters, without the maze.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl bg-[#eef7f4] p-6">
              <span className="text-3xl">01</span>
              <h3 className="mt-8 text-xl font-bold text-[#123b40]">
                Choose your test
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Compare preparation, sample type, price, and turnaround before
                you book.
              </p>
            </article>
            <article className="rounded-2xl bg-[#fff0eb] p-6">
              <span className="text-3xl">02</span>
              <h3 className="mt-8 text-xl font-bold text-[#123b40]">
                Pick your collection
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Reserve a verified technician for a convenient lab visit or home
                appointment.
              </p>
            </article>
            <article className="rounded-2xl bg-[#f1eff8] p-6">
              <span className="text-3xl">03</span>
              <h3 className="mt-8 text-xl font-bold text-[#123b40]">
                Track your result
              </h3>
              <p className="mt-3 leading-7 text-slate-600">
                Follow sample progress and access approved reports in your
                patient portal.
              </p>
            </article>
          </div>
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between lg:px-10">
        <span className="font-semibold text-[#123b40]">BloodCare</span>
        <span>Secure diagnostics for everyday decisions.</span>
      </footer>
    </main>
  );
};

export default HomePage;

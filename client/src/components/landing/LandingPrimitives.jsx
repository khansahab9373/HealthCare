import { useState } from "react";

const iconShapes = {
  activity: (
    <>
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </>
  ),
  audit: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </>
  ),
  badge: (
    <>
      <path d="M12 3 14.8 5l3.5-.1.9 3.4 2.8 2-1.6 3.1.6 3.4-3.2 1.4-1.6 3.1-3.4-.8-3.3.8-1.6-3.1-3.2-1.4.6-3.4-1.6-3.1 2.8-2 .9-3.4L9.2 5 12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5l8-3 8 3v16" />
      <path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M10 21v-4h4v4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V5M4 19h17" />
      <path d="m7 15 4-4 3 2 5-6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
  device: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M10 18h4" />
    </>
  ),
  document: (
    <>
      <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v6h5M9 14h6M9 17h6" />
    </>
  ),
  heart: (
    <>
      <path d="M20.8 8.8c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z" />
      <path d="M7 12h3l1.5-3 2.2 6 1.4-3H18" />
    </>
  ),
  home: (
    <>
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z" />
    </>
  ),
  layout: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 9v12" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </>
  ),
  report: (
    <>
      <path d="M5 3h9l5 5v13H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v6h5M7 14h10M7 17h7" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  test: (
    <>
      <path d="M9 3h6M10 3v6L5 19a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2L14 9V3" />
      <path d="M8 15h8" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </>
  ),
};

export const Icon = ({ name, className = "h-6 w-6" }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {iconShapes[name] || iconShapes.heart}
  </svg>
);

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  center = false,
}) => (
  <div className={`${center ? "mx-auto text-center" : ""} max-w-3xl`}>
    <p className="text-sm font-bold uppercase text-teal-800">{eyebrow}</p>
    <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
      {title}
    </h2>
    {description && (
      <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
        {description}
      </p>
    )}
  </div>
);

export const HealthcareImage = ({
  src,
  alt,
  className = "",
  imageClassName = "",
  loading = "lazy",
}) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-teal-50 ${className}`}>
      {failed ? (
        <div className="flex h-full min-h-56 items-center justify-center bg-[linear-gradient(135deg,#e6f3f0,#f8fbfa)] p-8 text-center">
          <div>
            <span
              className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-800 text-3xl font-light text-white"
              aria-hidden="true"
            >
              +
            </span>
            <p className="mt-3 text-sm font-semibold text-teal-950">
              Healthcare image
            </p>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover ${imageClassName}`}
        />
      )}
    </div>
  );
};

export const Eyebrow = ({ children, light = false }) => (
  <p
    className={`text-xs font-bold uppercase ${light ? "text-teal-100" : "text-teal-800"}`}
  >
    {children}
  </p>
);

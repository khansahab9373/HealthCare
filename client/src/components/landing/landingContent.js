export const healthcareImages = {
  laboratory:
    "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1800&q=88",
  patient:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85",
  report:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=85",
  technician:
    "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1200&q=85",
  collection:
    "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=85",
};

export const navigationItems = [
  ["Home", "#home"],
  ["Services", "#services"],
  ["How It Works", "#how-it-works"],
  ["Features", "#features"],
  ["About", "#about"],
  ["FAQ", "#faq"],
];

export const services = [
  {
    icon: "test",
    title: "Diagnostic Test Booking",
    description:
      "Browse available tests, understand preparation requirements, and book a suitable appointment slot.",
  },
  {
    icon: "calendar",
    title: "Technician Appointments",
    description:
      "Coordinate verified technicians with patient appointments and qualified tests.",
  },
  {
    icon: "home",
    title: "Home Sample Collection",
    description:
      "Request convenient sample collection from a preferred location and track its progress.",
  },
  {
    icon: "building",
    title: "Lab Visit Scheduling",
    description:
      "Choose an available appointment slot for a visit to the laboratory.",
  },
  {
    icon: "activity",
    title: "Sample Tracking",
    description:
      "Follow the sample lifecycle from collection and receipt through testing and completion.",
  },
  {
    icon: "report",
    title: "Digital Reports",
    description:
      "Access approved diagnostic reports digitally after the configured review process.",
  },
];

export const workflowSteps = [
  [
    "01",
    "Choose a test",
    "Review test details, sample type, preparation, and price.",
  ],
  [
    "02",
    "Book an appointment",
    "Select an available date, time, and collection option.",
  ],
  ["03", "Collect and track", "Follow appointment and sample status updates."],
  [
    "04",
    "Receive an approved report",
    "Review the report after the required approval workflow.",
  ],
];

export const features = [
  ["shield", "Secure login", "JWT-backed sign-in for registered users."],
  [
    "users",
    "Role-based access",
    "Patient, technician, and administrator workspaces.",
  ],
  [
    "calendar",
    "Appointment scheduling",
    "Book, cancel, and reschedule when allowed.",
  ],
  [
    "clock",
    "Smart slot management",
    "Thirty-minute slots with availability and conflict checks.",
  ],
  [
    "badge",
    "Technician verification",
    "Administrator-led review of technician applications.",
  ],
  [
    "activity",
    "Sample tracking",
    "Status history from collection through completion.",
  ],
  [
    "report",
    "Digital reports",
    "Structured results with review and approval controls.",
  ],
  [
    "bell",
    "Notifications",
    "Updates for appointment and report workflow events.",
  ],
  [
    "layout",
    "Admin dashboard",
    "Operational tools for lab workflow management.",
  ],
  ["chart", "Analytics", "Counts and trends supplied by the platform API."],
  ["audit", "Audit logs", "A record of administrative and workflow activity."],
  [
    "device",
    "Responsive access",
    "Layouts designed for desktop, tablet, and mobile.",
  ],
];

export const faqItems = [
  [
    "What is HealthCare?",
    "HealthCare is a web platform for medical laboratory appointment management, technician coordination, sample tracking, and digital diagnostic reports.",
  ],
  [
    "Who can use the platform?",
    "The application supports patient, medical laboratory technician, and administrator roles.",
  ],
  [
    "Can patients book diagnostic tests?",
    "Registered patients can browse the active catalog and request an appointment for an available test.",
  ],
  [
    "Can patients choose home collection?",
    "Home collection is available for tests that support it, subject to the appointment workflow.",
  ],
  [
    "How are technicians verified?",
    "Technician applications remain pending until an administrator reviews and updates their verification status.",
  ],
  [
    "How does sample tracking work?",
    "The platform records sample status changes as the appointment moves through collection, receipt, testing, and completion.",
  ],
  [
    "When can patients access reports?",
    "Reports become available to patients only after the configured review, approval, and publication workflow.",
  ],
  [
    "Can reports be downloaded?",
    "Patients can download available reports as PDF files from the patient reports area.",
  ],
  [
    "Is HealthCare mobile responsive?",
    "The interface adapts to phone, tablet, and desktop screen sizes.",
  ],
  [
    "What roles are supported?",
    "Patient, technician, and administrator roles have separate permissions and workspaces.",
  ],
];

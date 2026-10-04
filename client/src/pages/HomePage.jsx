import LandingNavbar from "../components/landing/LandingNavbar.jsx";
import {
  HeroSection,
  HowItWorksSection,
  PatientJourneySection,
  ServicesSection,
  TrustStrip,
  WhyChooseSection,
} from "../components/landing/LandingSections.jsx";
import {
  CollectionOptionsSection,
  PlatformFeaturesSection,
  PlatformImpactSection,
  ReportManagementSection,
  TechnicianPlatformSection,
  TestimonialsSection,
} from "../components/landing/LandingWorkflowSections.jsx";
import {
  FAQSection,
  FinalCTASection,
  LandingFooter,
} from "../components/landing/LandingClosingSections.jsx";

const HomePage = () => (
  <div className="min-h-screen overflow-x-clip bg-white text-slate-900">
    <LandingNavbar />
    <main className="landing-main">
      <HeroSection />
      <TrustStrip />
      <ServicesSection />
      <HowItWorksSection />
      <WhyChooseSection />
      <PatientJourneySection />
      <TechnicianPlatformSection />
      <ReportManagementSection />
      <CollectionOptionsSection />
      <PlatformFeaturesSection />
      <PlatformImpactSection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection />
    </main>
    <LandingFooter />
  </div>
);

export default HomePage;
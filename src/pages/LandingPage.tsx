import Footer from "../components/Footer";
import AmbientBackground from "../components/landing/AmbientBackground";
import FeaturesBento from "../components/landing/FeaturesBento";
import FinalCta from "../components/landing/FinalCta";
import Hero from "../components/landing/Hero";
import IndieSection from "../components/landing/IndieSection";
import LandingHeader from "../components/landing/LandingHeader";
import McpSection from "../components/landing/McpSection";
import PrivacySection from "../components/landing/PrivacySection";

export default function LandingPage() {
  return (
    <div className="landing relative isolate min-h-screen w-full flex flex-col text-[var(--text-primary)] font-sans selection:bg-[#66ACCB]/20">
      <AmbientBackground />
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <FeaturesBento />
        <PrivacySection />
        <McpSection />
        <FinalCta />
      </main>
      <IndieSection />
      <div className="mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] px-5 py-2.5">
        <div className="max-w-6xl mx-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}

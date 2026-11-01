import { usePageMeta } from "../hooks/usePageMeta";
import { SITE_NAME } from "../lib/seo";
import { absoluteUrl } from "../lib/site";
import { HeroSection } from "../components/sections/home/HeroSection";
import { AboutSection } from "../components/sections/home/AboutSection";
import { ContactSection } from "../components/sections/home/ContactSection";

export function HomePage() {
  usePageMeta({
    title: SITE_NAME,
    description:
      "Elijah Mwambazi, software engineer in Lusaka, Zambia. Selected projects, tools and engineering notes.",
    canonical: absoluteUrl("/"),
  });

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-300 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.09),transparent_42%)] sm:h-375 lg:h-300" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-300 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.035),transparent_62%)]" />

      <div className="relative z-10">
        <HeroSection />
        <AboutSection />
        <ContactSection />
      </div>
    </div>
  );
}

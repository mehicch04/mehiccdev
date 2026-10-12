import { HomeRail }      from "@/components/sections/HomeRail";
import { SystemDemo } from "@/components/sections/SystemDemo";
import { TechMarquee } from "@/components/sections/TechMarquee";
import { Navbar }       from "@/components/sections/Navbar";
import { Hero }         from "@/components/sections/Hero";
import { About }        from "@/components/sections/About";
import { Portfolio }    from "@/components/sections/Portfolio";
import { Pricing }      from "@/components/sections/Pricing";
import { SaasTeaser }   from "@/components/sections/SaasTeaser";
import { Contact }      from "@/components/sections/Contact";
import { Footer }       from "@/components/sections/Footer";
import { Results } from "@/components/sections/Results";
import { Value } from "@/components/sections/Value";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Navbar />
      <HomeRail />
      <Hero />
      <TechMarquee />
      <About />
      <SystemDemo />
      <Results />
      <Portfolio />
      <Pricing />
      <Value />
      <SaasTeaser />
      <Contact />
      <Footer />
    </main>
  );
}

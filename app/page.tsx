import { HomeRail }   from "@/components/sections/HomeRail";
import { Navbar }     from "@/components/sections/Navbar";
import { Hero }       from "@/components/sections/Hero";
import { Clients }    from "@/components/sections/Clients";
import { Services }   from "@/components/sections/Services";
import { Portfolio }  from "@/components/sections/Portfolio";
import { Results }    from "@/components/sections/Results";
import { Process }    from "@/components/sections/Process";
import { Pricing }    from "@/components/sections/Pricing";
import { Savings }    from "@/components/sections/Savings";
import { SaasTeaser } from "@/components/sections/SaasTeaser";
import { About }      from "@/components/sections/About";
import { Faq }        from "@/components/sections/Faq";
import { Contact }    from "@/components/sections/Contact";
import { Footer }     from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Navbar />
      <HomeRail />
      <Hero />
      <Clients />
      <Services />
      <Process />
      <Portfolio />
      <Results />
      <Pricing />
      <Savings />
      <SaasTeaser />
      <About />
      <Faq />
      <Contact />
      <Footer />
    </main>
  );
}

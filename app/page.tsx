import { Navbar }     from "@/components/sections/Navbar";
import { HeroWorld }  from "@/components/sections/HeroWorld";
import { Clients }    from "@/components/sections/Clients";
import { Portfolio }  from "@/components/sections/Portfolio";
import { Services }   from "@/components/sections/Services";
import { Process }    from "@/components/sections/Process";
import { PricingBuilder } from "@/components/sections/PricingBuilder";
import { Faq }        from "@/components/sections/Faq";
import { Booking }    from "@/components/sections/Booking";
import { Footer }     from "@/components/sections/Footer";
import { MapIntro }   from "@/components/ui/MapIntro";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <MapIntro />
      <Navbar overDark />
      <HeroWorld />
      <Clients />
      <Portfolio />
      <Services />
      <Process />
      <PricingBuilder />
      <Faq />
      <Booking />
      <Footer />
    </main>
  );
}

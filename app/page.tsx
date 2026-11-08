import { Navbar }     from "@/components/sections/Navbar";
import { Hero }       from "@/components/sections/Hero";
import { Clients }    from "@/components/sections/Clients";
import { Portfolio }  from "@/components/sections/Portfolio";
import { Services }   from "@/components/sections/Services";
import { Process }    from "@/components/sections/Process";
import { Pricing }    from "@/components/sections/Pricing";
import { Savings }    from "@/components/sections/Savings";
import { Faq }        from "@/components/sections/Faq";
import { Booking }    from "@/components/sections/Booking";
import { Footer }     from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Navbar />
      <Hero />
      <Clients />
      <Portfolio />
      <Services />
      <Process />
      <Pricing />
      <Savings />
      <Faq />
      <Booking />
      <Footer />
    </main>
  );
}

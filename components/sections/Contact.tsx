"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";
import { PHONE_DISPLAY, PHONE_DIAL, waLink } from "@/lib/contact";
import { Head, Fade, SOFT } from "@/components/ui/kit";
import { EmailLink } from "@/components/ui/EmailLink";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { toE164 } from "@/lib/phone";

const TEAM = [
  { name: "Bakir Mehić", email: "bakir.mehic@mehiccdev.com", photo: "/team/bakir.jpg" },
  { name: "Nedim Kupusija", email: "nedim.kupusija@mehiccdev.com", photo: "/team/nedim.jpg" },
];

const field = "w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#0F172A] outline-none transition-colors placeholder:text-[#94A3B8] focus:border-[#0F172A]";
const lbl = "text-[13px] font-semibold text-[#0F172A]";

type Content = {
  label: string; heading1: string; headingAccent: string; subtitle: string;
  stepsTitle: string;
  steps: { t: string; d: string }[];
  roles: [string, string];
  orReach: string;
  directTitle: string; directSub: string; callBtn: string; waBtn: string;
  location: string; response: string;
  nameLabel: string; namePlaceholder: string;
  emailLabel: string; emailPlaceholder: string;
  phoneLabel: string; phonePlaceholder: string; errPhone: string;
  subjectLabel: string; subjectOptions: string[];
  messageLabel: string; messagePlaceholder: string;
  submit: string; submitting: string; success: string;
  errSend: string; errTooMany: string;
};

const T: Record<"bs" | "en", Content> = {
  bs: {
    label: "Kontakt",
    heading1: "Započnimo",
    headingAccent: "saradnju",
    subtitle: "Imate projekat na umu? Javite nam se, odgovaramo u roku od 24 sata.",
    stepsTitle: "Kako izgleda saradnja s nama",
    steps: [
      { t: "Pošaljete upit",          d: "Recite nam šta vam treba, svojim riječima. Traje dvije minute." },
      { t: "Besplatne konsultacije",  d: "Javimo se u roku od 24 sata i prođemo kroz ideju, bez obaveza." },
      { t: "Ponuda i plan",           d: "Dobijete jasnu cijenu, rokove i plan. Odluka je na vama." },
    ],
    roles: ["Development", "Marketing"],
    orReach: "Ili nas kontaktirajte direktno",
    directTitle: "Ne volite forme?",
    directSub: "Nazovite ili pišite na WhatsApp, javljamo se odmah.",
    callBtn: "Nazovite",
    waBtn: "WhatsApp",
    location: "Mostar, BiH · radimo s klijentima iz cijelog regiona",
    response: "Obično odgovorimo isti dan",
    nameLabel: "Ime i prezime",
    namePlaceholder: "Vaše ime",
    emailLabel: "Email adresa",
    emailPlaceholder: "vasa@email.com",
    phoneLabel: "Broj telefona (WhatsApp)",
    phonePlaceholder: "62 123 456",
    errPhone: "Unesite ispravan broj telefona.",
    subjectLabel: "Tip projekta",
    subjectOptions: ["Web sajt", "Web aplikacija", "Sistem za rezervacije", "Digitalni marketing", "Ostalo"],
    messageLabel: "Poruka",
    messagePlaceholder: "Recite nam nešto o vašem projektu…",
    errSend: "Slanje trenutno ne radi. Pišite nam direktno na bakir.mehic@mehiccdev.com",
    errTooMany: "Previše poruka u kratkom roku. Pokušajte ponovo za nekoliko minuta.",
    submit: "Pošalji poruku",
    submitting: "Slanje…",
    success: "Hvala! Vaša poruka je poslana. Javljamo se uskoro.",
  },
  en: {
    label: "Contact",
    heading1: "Let's work",
    headingAccent: "together",
    subtitle: "Have a project in mind? Reach out, we reply within 24 hours.",
    stepsTitle: "What working with us looks like",
    steps: [
      { t: "Send an inquiry",      d: "Tell us what you need, in your own words. Takes two minutes." },
      { t: "Free consultation",    d: "We get back within 24 hours and talk through the idea, no strings attached." },
      { t: "Quote and plan",       d: "You get a clear price, timeline and plan. The decision is yours." },
    ],
    roles: ["Development", "Marketing"],
    orReach: "Or reach us directly",
    directTitle: "Not a fan of forms?",
    directSub: "Call us or send a WhatsApp message, we reply right away.",
    callBtn: "Call us",
    waBtn: "WhatsApp",
    location: "Mostar, BiH · working with clients across the region",
    response: "We usually reply the same day",
    nameLabel: "Full name",
    namePlaceholder: "Your name",
    emailLabel: "Email address",
    emailPlaceholder: "your@email.com",
    phoneLabel: "Phone number (WhatsApp)",
    phonePlaceholder: "62 123 456",
    errPhone: "Enter a valid phone number.",
    subjectLabel: "Project type",
    subjectOptions: ["Website", "Web application", "Booking system", "Digital marketing", "Other"],
    messageLabel: "Message",
    messagePlaceholder: "Tell us a bit about your project…",
    errSend: "Sending is not working right now. Write to us at bakir.mehic@mehiccdev.com",
    errTooMany: "Too many messages in a short time. Please try again in a few minutes.",
    submit: "Send message",
    submitting: "Sending…",
    success: "Thank you! Your message has been sent. We'll be in touch soon.",
  },
};

export function Contact() {
  const { lang } = useLanguage();
  const d = T[(lang as "bs" | "en")] ?? T.bs;
  const wa = waLink(lang);

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [honey, setHoney] = useState("");
  const [code, setCode] = useState("387");
  const [phone, setPhone] = useState("");
  const opened = useRef(0);
  useEffect(() => { opened.current = Date.now(); }, []);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tel = toE164(code, phone);
    if (!tel) { setError(d.errPhone); return; }
    setState("sending"); setError("");
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: tel, website: honey, t: Date.now() - opened.current }),
      });
      if (res.ok) { setState("done"); return; }
      setError(res.status === 429 ? d.errTooMany : d.errSend);
    } catch { setError(d.errSend); }
    setState("idle");
  };

  return (
    <section id="kontakt" className="relative bg-white scroll-mt-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <Head label={d.label} h={d.heading1} accent={d.headingAccent} sub={d.subtitle} />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.35fr]">
          <Fade className="flex flex-col rounded-[24px] bg-[#0F172A] p-7 sm:p-8">
            <p className="text-[19px] font-semibold text-white">{d.directTitle}</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#94A3B8]">{d.directSub}</p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row lg:flex-col xl:flex-row">
              {PHONE_DIAL && (
                <a href={`tel:${PHONE_DIAL}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[14px] font-semibold text-[#0F172A] transition-colors hover:bg-[#F1F5F9]">
                  <Phone size={15} /> {PHONE_DISPLAY || d.callBtn}
                </a>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#15803D]">
                  <MessageCircle size={15} /> {d.waBtn}
                </a>
              )}
            </div>

            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">{d.orReach}</p>
            <ul className="mt-3 divide-y divide-white/10">
              {TEAM.map((m, i) => (
                <li key={m.email}>
                  <EmailLink email={m.email} wrapClassName="block" className="group flex items-center gap-3 py-3">
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/10">
                      <Image src={m.photo} alt={m.name} fill sizes="36px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-semibold text-white">{m.name} <span className="font-normal text-[#64748B]">· {d.roles[i]}</span></span>
                      <span className="block truncate text-[12.5px] text-[#94A3B8] group-hover:text-white">{m.email}</span>
                    </span>
                    <Mail size={15} className="shrink-0 text-[#64748B] group-hover:text-white" />
                  </EmailLink>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col gap-2 pt-6 text-[12.5px]">
              <span className="flex items-center gap-2 text-[#94A3B8]"><MapPin size={13} /> {d.location}</span>
              <span className="flex items-center gap-2 text-[#4ADE80]"><span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" /> {d.response}</span>
            </div>
          </Fade>

          <Fade delay={0.06} className="rounded-[24px] border border-[#E5E7EB] bg-white p-6 sm:p-8" >
            {state === "done" ? (
              <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#DCFCE7] text-[#15803D]"><Check size={22} /></span>
                <p className="mt-4 max-w-sm text-[16px] font-semibold text-[#0F172A]">{d.success}</p>
              </div>
            ) : (
              <form onSubmit={submit} className="flex h-full flex-col gap-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className={lbl}>{d.nameLabel}</span>
                    <input required name="name" autoComplete="name" value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder={d.namePlaceholder} className={`mt-2 ${field}`} />
                  </label>
                  <label className="block">
                    <span className={lbl}>{d.emailLabel}</span>
                    <input required type="email" name="email" autoComplete="email" value={form.email} onChange={(e) => set("email")(e.target.value)} placeholder={d.emailPlaceholder} className={`mt-2 ${field}`} />
                  </label>
                </div>

                <label className="block">
                  <span className={lbl}>{d.phoneLabel}</span>
                  <PhoneInput code={code} number={phone} onCode={setCode} onNumber={setPhone} placeholder={d.phonePlaceholder} className="mt-2 border-[#E5E7EB]" />
                </label>

                <div>
                  <p className={lbl}>{d.subjectLabel}</p>
                  <div role="radiogroup" aria-label={d.subjectLabel} className="mt-2 flex flex-wrap gap-2">
                    {d.subjectOptions.map((o) => (
                      <button key={o} type="button" role="radio" aria-checked={form.subject === o} onClick={() => set("subject")(form.subject === o ? "" : o)}
                              className={`rounded-xl border px-3.5 py-2 text-[13.5px] font-medium transition-colors ${form.subject === o ? "border-[#0F172A] bg-[#0F172A] text-white" : "border-[#E5E7EB] bg-white text-[#334155] hover:border-[#CBD5E1]"}`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex flex-1 flex-col">
                  <span className={lbl}>{d.messageLabel}</span>
                  <textarea required name="message" rows={5} value={form.message} onChange={(e) => set("message")(e.target.value)} placeholder={d.messagePlaceholder} className={`mt-2 min-h-[140px] flex-1 resize-none ${field}`} />
                </label>

                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden value={honey} onChange={(e) => setHoney(e.target.value)} className="hidden" />
                {error && <p className="text-[13px] text-[#B91C1C]">{error}</p>}

                <button type="submit" disabled={state === "sending"}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-70"
                        style={{ boxShadow: SOFT }}>
                  {state === "sending" ? d.submitting : d.submit} {state !== "sending" && <ArrowRight size={16} />}
                </button>
              </form>
            )}
          </Fade>
        </div>
      </div>
    </section>
  );
}

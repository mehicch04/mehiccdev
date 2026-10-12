import { z } from "zod";

export const FLEET_SIZES   = ["1-9", "10-20", "21-40", "40+"] as const;
export const LOCATIONS     = ["1", "2-3", "4+"] as const;
export const CHANNELS      = ["telefon", "viber-whatsapp", "sajt", "agregatori", "walk-in"] as const;
export const AGGREGATORS   = ["da", "ne"] as const;
export const TIMELINES     = ["odmah", "prije-sezone", "istrazujem"] as const;

export const rentACarInquirySchema = z.object({
  fleetSize:  z.enum(FLEET_SIZES,  { message: "required" }),
  locations:  z.enum(LOCATIONS).optional(),
  channels:   z.array(z.enum(CHANNELS)).optional(),
  aggregators: z.enum(AGGREGATORS).optional(),
  currentSite: z.string().trim().url({ message: "url" }).optional().or(z.literal("")),
  timeline:   z.enum(TIMELINES,    { message: "required" }),
  fullName:   z.string().trim().min(2,  { message: "required" }).max(80),
  company:    z.string().trim().max(80).optional().or(z.literal("")),
  phone:      z.string().trim().min(6,  { message: "required" }).max(30),
  email:      z.string().trim().email({ message: "email" }).max(120),
  note:       z.string().trim().max(500, { message: "max500" }).optional().or(z.literal("")),
  website:    z.string().max(0).optional().or(z.literal("")),
});

export type RentACarInquiry = z.infer<typeof rentACarInquirySchema>;

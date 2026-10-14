// Company facts from 01-brief/company-copy.md (current contact pages, FF 78 / 0772… numbers).
// Anything the client has not confirmed is listed in `needsClient` and surfaced in README + QA.

export const company = {
  name: "Cables & Wireless Co.",
  brand: "SMART",
  // Canonical/OG base: the Vercel production domain when built there, localhost otherwise.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  tagline: "Industrial Communication Simplified",
  ceo: "Sanjay Gandhi",
  address: {
    lines: ["FF 78, Rajat Arcade", "MIDC T-Point, Amravati Road", "Wadi, Nagpur 440023"],
    region: "Maharashtra",
    country: "India",
    mapsQuery: "Rajat Arcade, MIDC T-Point, Amravati Road, Wadi, Nagpur 440023",
  },
  phones: [
    { label: "Mobile", display: "+91 98226 95746", tel: "+919822695746" },
    { label: "Mobile", display: "+91 98229 41190", tel: "+919822941190" },
    { label: "Office", display: "0772 004 8532", tel: "+917720048532" },
    { label: "Office", display: "0772 004 8531", tel: "+917720048531" },
  ],
  // WhatsApp number not confirmed by the client — first mobile assumed.
  whatsapp: "919822695746",
  emails: ["cnwcom@gmail.com", "info@voizlink.in"],
  hours: "11:00 – 19:00 IST",
  legalName: null as string | null,
  gst: null as string | null,
  founded: null as number | null,
  needsClient: [
    "Legal entity name, GST, Udyam/MSME, PAN",
    "Founding year",
    "Working days (only hours 11 AM–7 PM are published)",
    "Which number is on WhatsApp",
    "Which inbox receives website enquiries",
  ],
};

export function waLink(text: string) {
  return `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(text)}`;
}

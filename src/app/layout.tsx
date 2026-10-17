import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { QuoteDrawer } from "@/components/QuoteDrawer";
import { RevealInit } from "@/components/RevealInit";
import { company } from "@/content/company";
import { getFamilies, getIndustries, getProduct, productHref, searchIndex } from "@/lib/catalogue";
import { QuoteProvider } from "@/lib/quote";
import "./globals.css";

// Overused Grotesk (RandomMaerks, OFL; variable 300–900) for every role: display, text and model codes (2026-10-17, user).
// The SMART wordmark and the company logo are outlined SVGs and keep their own lettering.
const og = localFont({ src: "../fonts/OverusedGrotesk-VF.woff2", weight: "300 900", style: "normal", variable: "--ff-og", display: "swap", fallback: ["Arial", "Helvetica", "sans-serif"] });

export const metadata: Metadata = {
  metadataBase: new URL(company.url),
  title: { default: "SMART industrial telephones & plant PA systems | Cables & Wireless Co.", template: "%s" },
  description: "SMART industrial telephones, plant PA systems, emergency call boxes, hooters, voice alarms and bag counters. Designed and built in Nagpur by Cables & Wireless Co.",
  openGraph: { type: "website", siteName: "Cables & Wireless Co.", locale: "en_IN", images: [{ url: "/media/og.jpg", width: 1200, height: 630, alt: "SMART industrial telephone by Cables & Wireless Co." }] },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { themeColor: "#FFC20A" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  const families = getFamilies().map((f) => ({ slug: f.slug, name: f.name, categories: f.categories.map((c) => ({ slug: c.slug, name: c.name, count: c.products.length })) }));
  const industries = getIndustries().map((i) => ({ slug: i.slug, name: i.name }));
  const index = searchIndex();
  const fp = getProduct("wmhs-iii");
  const featured = fp ? { slug: fp.slug, model: fp.model, name: fp.name, category: fp.category, href: productHref(fp), img: fp.images[0]?.src ?? null, aliases: [] } : null;
  const org = {
    "@context": "https://schema.org", "@type": "Organization", name: company.name, url: company.url, logo: `${company.url}/brand/cw-logo-light.svg`,
    brand: { "@type": "Brand", name: "SMART" },
    address: { "@type": "PostalAddress", streetAddress: company.address.lines.slice(0, 2).join(", "), addressLocality: "Nagpur", postalCode: "440023", addressRegion: company.address.region, addressCountry: "IN" },
    contactPoint: company.phones.slice(0, 2).map((p) => ({ "@type": "ContactPoint", telephone: p.tel, contactType: "sales", areaServed: "IN" })),
    email: company.emails[0],
  };
  return (
    <html lang="en-IN" className={og.variable}>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <QuoteProvider>
          <Header families={families} industries={industries} index={index} featured={featured} />
          <main id="main">{children}</main>
          <Footer />
          <QuoteDrawer />
        </QuoteProvider>
        <RevealInit />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      </body>
    </html>
  );
}

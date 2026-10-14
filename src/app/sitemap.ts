import type { MetadataRoute } from "next";
import { company } from "@/content/company";
import { getCategories, getIndustries, getProducts, getSystems, productHref } from "@/lib/catalogue";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${company.url}${p}`;
  const fixed = ["/", "/products", "/systems", "/installed-at", "/about", "/downloads", "/vendor-kit", "/contact", "/cross-reference"];
  return [
    ...fixed.map((p) => ({ url: u(p) })),
    ...getCategories().map((c) => ({ url: u(`/products/${c.slug}`) })),
    ...getProducts().map((p) => ({ url: u(productHref(p)) })),
    ...getIndustries().map((i) => ({ url: u(`/industries/${i.slug}`) })),
    ...getSystems().map((s) => ({ url: u(`/systems/${s.slug}`) })),
  ];
}

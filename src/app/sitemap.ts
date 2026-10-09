import type { MetadataRoute } from "next";
import { guides } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

const lastModified = new Date("2026-10-09");

const routes: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/calculators/mortgage", priority: 0.9 },
  { path: "/calculators/auto-loan", priority: 0.9 },
  { path: "/calculators/credit-card", priority: 0.9 },
  { path: "/calculators/personal-loan", priority: 0.9 },
  { path: "/calculators/budget", priority: 0.9 },
  { path: "/guides", priority: 0.8 },
  ...guides.map((guide) => ({ path: `/guides/${guide.slug}`, priority: 0.7 })),
  { path: "/about", priority: 0.5 },
  { path: "/contact", priority: 0.5 },
  { path: "/privacy-policy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
  { path: "/disclaimer", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
  }));
}

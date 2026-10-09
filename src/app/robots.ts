import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private shared-expense groups and the JSON API are not for search.
      disallow: ["/api/", "/groups/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

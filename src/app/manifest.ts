import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MonthlyWise — Free Financial Calculators",
    short_name: "MonthlyWise",
    description:
      "Free mortgage, auto loan, credit card, personal loan, and budget calculators.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#1d4ed8",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt =
  "MonthlyWise — free mortgage, auto loan, credit card, and budget calculators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const tags = ["Mortgage", "Auto Loan", "Credit Card", "Budget", "Split Expenses"];

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "src/assets/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0b1f5c 0%, #0a3a4a 100%)",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={120} height={120} alt="" />
          <div style={{ fontSize: 64, fontWeight: 800, display: "flex" }}>
            Monthly<span style={{ color: "#38e0c4" }}>Wise</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 60,
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          Free financial calculators for smarter monthly decisions
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 44 }}>
          {tags.map((tag) => (
            <div
              key={tag}
              style={{
                fontSize: 26,
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

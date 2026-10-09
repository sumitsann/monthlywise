import { ADSENSE_CLIENT } from "@/lib/site";

// ads.txt authorizes Google to sell ads on this domain. The publisher ID is
// the AdSense client ID without the "ca-" prefix.
export function GET() {
  if (!ADSENSE_CLIENT) {
    return new Response("Not found", { status: 404 });
  }

  const publisherId = ADSENSE_CLIENT.replace(/^ca-/, "");

  return new Response(
    `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}

import { headers } from "next/headers";
import { getLink, logClick } from "../../../lib/store";
import { parseUA, refDomain } from "../../../lib/ua";
import { buildRedirectPlan } from "../../../lib/buildRedirect";
import Redirector from "./Redirector";

export const dynamic = "force-dynamic";

export default async function RedirectPage({ params }) {
  const { slug } = params;
  const link = await getLink(slug);

  if (!link) {
    return (
      <div className="center-screen">
        <div className="redirect-card">
          <p className="eyebrow">deeplinker</p>
          <h1 style={{ fontSize: 20 }}>This link doesn't exist</h1>
          <p className="sub">It may have been deleted, or the slug is mistyped.</p>
        </div>
      </div>
    );
  }

  const h = headers();
  const ua = h.get("user-agent") || "";
  const referrer = h.get("referer") || "";
  const parsed = parseUA(ua);

  // Fire-and-forget logging happens server-side so it's captured even if
  // the visitor's JS never runs (slow connections, blocked scripts, etc).
  await logClick(slug, {
    os: parsed.os,
    browser: parsed.browser,
    device: parsed.device,
    inApp: parsed.inApp,
    refDomain: refDomain(referrer),
  });

  const plan = buildRedirectPlan(link.target);

  return (
    <Redirector
      target={plan.target}
      iosAppScheme={plan.iosAppScheme}
      androidIntent={plan.androidIntent}
      serverOS={parsed.os}
    />
  );
}

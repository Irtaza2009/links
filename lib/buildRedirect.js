import { findAppScheme } from "./appSchemes";

// Builds the set of "escape attempts" the redirect page will try, in order,
// for a given target URL. Returns plain data (safe to pass from a server
// component into a client component as props).
export function buildRedirectPlan(targetUrl) {
  const scheme = findAppScheme(targetUrl);
  let androidIntent = null;

  try {
    const u = new URL(targetUrl);
    const host = u.host;
    const path = u.pathname + u.search;
    const fallback = encodeURIComponent(targetUrl);

    // Android: intent:// is honored by Instagram/Facebook/TikTok's Chrome
    // Custom Tabs based webviews and hands the URL to a real app or Chrome.
    // If we know the target app's package, we ask for it by name; the
    // browser_fallback_url still fires if that app isn't installed.
    const pkgPart = scheme?.androidPackage ? `package=${scheme.androidPackage};` : "";
    androidIntent = `intent://${host}${path}#Intent;scheme=${u.protocol.replace(
      ":",
      ""
    )};${pkgPart}S.browser_fallback_url=${fallback};end`;
  } catch {
    androidIntent = null;
  }

  return {
    target: targetUrl,
    iosAppScheme: scheme?.ios || null,
    androidIntent,
  };
}

// Public, well-known custom URL schemes + Android package names for popular
// destinations. When a target URL's hostname matches one of these, we try
// to launch the native app directly instead of just escaping to a browser.
// This list is best-effort and app vendors change these occasionally —
// unmatched domains still get a generic escape (see lib/buildRedirect.js).

export const APP_SCHEMES = [
  { match: /youtube\.com|youtu\.be/, ios: "youtube://", androidPackage: "com.google.android.youtube" },
  { match: /instagram\.com/, ios: "instagram://", androidPackage: "com.instagram.android" },
  { match: /tiktok\.com/, ios: "tiktok://", androidPackage: "com.zhiliaoapp.musically" },
  { match: /(^|\.)x\.com|twitter\.com/, ios: "twitter://", androidPackage: "com.twitter.android" },
  { match: /facebook\.com|fb\.watch/, ios: "fb://", androidPackage: "com.facebook.katana" },
  { match: /threads\.net|threads\.com/, ios: "threads://", androidPackage: "com.instagram.barcelona" },
  { match: /open\.spotify\.com|spotify\.com/, ios: "spotify://", androidPackage: "com.spotify.music" },
  { match: /music\.apple\.com/, ios: "music://", androidPackage: null },
  { match: /amazon\.[a-z.]+\/|^amazon\./, ios: "com.amazon.mobile.shopping://", androidPackage: "com.amazon.mobile.shopping" },
  { match: /netflix\.com/, ios: "nflx://", androidPackage: "com.netflix.mediaclient" },
  { match: /wa\.me|whatsapp\.com/, ios: "whatsapp://", androidPackage: "com.whatsapp" },
  { match: /t\.me|telegram\.org/, ios: "tg://", androidPackage: "org.telegram.messenger" },
  { match: /pinterest\.com/, ios: "pinterest://", androidPackage: "com.pinterest" },
  { match: /reddit\.com/, ios: "reddit://", androidPackage: "com.reddit.frontpage" },
  { match: /discord\.com|discord\.gg/, ios: "discord://", androidPackage: "com.discord" },
  { match: /linkedin\.com/, ios: "linkedin://", androidPackage: "com.linkedin.android" },
  { match: /snapchat\.com/, ios: "snapchat://", androidPackage: "com.snapchat.android" },
  { match: /twitch\.tv/, ios: "twitch://", androidPackage: "tv.twitch.android.app" },
  { match: /etsy\.com/, ios: "etsy://", androidPackage: "com.etsy.android" },
  { match: /maps\.google\.com|goo\.gl\/maps/, ios: "comgooglemaps://", androidPackage: "com.google.android.apps.maps" },
];

export function findAppScheme(targetUrl) {
  try {
    const u = new URL(targetUrl);
    const hay = u.hostname + u.pathname;
    return APP_SCHEMES.find((entry) => entry.match.test(hay)) || null;
  } catch {
    return null;
  }
}

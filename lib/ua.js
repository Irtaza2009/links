// Small, dependency-free UA parser. It only needs to be "good enough" for
// bio-link analytics (OS + broad in-app-browser detection), not perfect.

export function parseUA(uaRaw) {
  const ua = uaRaw || "";

  let os = "Other";
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  // Which app's in-app browser this is, if any.
  let inApp = null;
  if (/Instagram/i.test(ua)) inApp = "Instagram";
  else if (/FBAN|FBAV|FB_IAB/i.test(ua)) inApp = "Facebook";
  else if (/BytedanceWebview|TikTok/i.test(ua)) inApp = "TikTok";
  else if (/Threads/i.test(ua)) inApp = "Threads";
  else if (/Twitter/i.test(ua)) inApp = "X/Twitter";
  else if (/Line\//i.test(ua)) inApp = "LINE";
  else if (/MicroMessenger/i.test(ua)) inApp = "WeChat";
  else if (/Snapchat/i.test(ua)) inApp = "Snapchat";

  let browser = "Other";
  if (inApp) browser = inApp + " in-app";
  else if (/EdgiOS|Edge\//i.test(ua)) browser = "Edge";
  else if (/CriOS|Chrome\//i.test(ua)) browser = "Chrome";
  else if (/FxiOS|Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Version\/.*Safari/i.test(ua)) browser = "Safari";
  else if (/Safari/i.test(ua)) browser = "Safari";

  const device = /Mobi|iPhone|Android/i.test(ua) ? "Mobile" : "Desktop";

  return { os, browser, device, inApp };
}

export function refDomain(referrer) {
  if (!referrer) return "Direct";
  try {
    const u = new URL(referrer);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

"use client";

import { useEffect, useState } from "react";

export default function Redirector({ target, iosAppScheme, androidIntent, serverOS }) {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isAndroid = /Android/i.test(ua) || serverOS === "Android";
    const isIOS = /iPhone|iPad|iPod/i.test(ua) || serverOS === "iOS";

    let cancelled = false;

    if (isAndroid && androidIntent) {
      // Instagram/Facebook/TikTok's Android webview generally hands
      // intent:// URLs off to a real app or Chrome.
      window.location.href = androidIntent;
    } else if (isIOS) {
      // Step 1: try to silently ping the destination app's own URL scheme
      // via a hidden iframe. If the app is installed, iOS switches to it
      // and this page never gets to step 2.
      if (iosAppScheme) {
        try {
          const iframe = document.createElement("iframe");
          iframe.style.display = "none";
          iframe.src = iosAppScheme;
          document.body.appendChild(iframe);
        } catch {}
      }

      // Step 2: force Safari using the x-safari- scheme prefix trick.
      // This is honored by some, not all, in-app browser versions — Meta
      // patches this periodically, which is why the manual fallback below
      // always exists too.
      const timer = setTimeout(() => {
        if (cancelled) return;
        try {
          window.location.href = "x-safari-" + target;
        } catch {}
      }, 500);

      return () => clearTimeout(timer);
    } else {
      // Desktop or unknown UA — just go straight there.
      window.location.href = target;
    }

    return () => {
      cancelled = true;
    };
  }, [target, iosAppScheme, androidIntent, serverOS]);

  useEffect(() => {
    const t = setTimeout(() => setShowFallback(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="center-screen">
      <div className="redirect-card">
        <div className="dot" />
        <p className="eyebrow">deeplinker</p>
        <h1 style={{ fontSize: 18 }}>Taking you there…</h1>
        <p className="sub">
          If nothing happens in a second or two, tap continue below.
        </p>
        {showFallback && (
          <a className="btn" href={target} style={{ display: "inline-block", textDecoration: "none" }}>
            Continue →
          </a>
        )}
      </div>
    </div>
  );
}

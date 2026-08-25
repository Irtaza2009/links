# deeplinker

A self-hosted deep-link generator for your Instagram bio, with a private
Umami-style analytics dashboard. No third-party link service, no data
leaving your own database.

Put `links.irtaza.xyz/l/some-slug` in your bio instead of a raw URL. When
someone taps it inside Instagram's in-app browser, the page tries - in
order - to hand them off to the destination's native app, then to their
actual phone browser, and always shows a visible "Continue" button as a
guaranteed last resort. Every open is logged: OS, browser, referrer, and
timestamp, viewable per-link in `/dashboard`.

## Read this first: what this can and can't actually do

Be realistic with yourself about this before you rely on it:

- **Android is reliable.** Instagram's Android in-app browser is a Chrome
  Custom Tab under the hood, and it honors `intent://` URLs - this tool
  uses those, so links generally do open Chrome or the matching app.
- **iOS is a genuine cat-and-mouse game.** Apple's Universal Links are
  designed to only fire from Safari or a real user tap, not from JavaScript
  running inside another app's in-app browser - and Meta actively patches
  the common escape tricks (like the `x-safari-` prefix this tool tries)
  every so often. Nobody, including paid commercial tools that promise
  this, can 100% guarantee an automatic escape on iOS. That's exactly why
  every redirect page here also shows a plain "Continue" button - worst
  case, a real tap from a person still gets them through more reliably
  than any JS trick, and nobody gets stuck on a blank page.

If an iOS escape trick stops working after an Instagram update, that's
expected - it's not a bug in this code, it's Meta closing a loophole
again. Check back for updated tricks periodically; this is a moving target
by nature.

## Stack

- **Next.js 14** (App Router), deployable on **Vercel** - yes, Vercel works
  well for this, including the free Hobby tier for personal use.
- **Upstash Redis** for storage (links + click analytics). Upstash has a
  free tier and is available directly from the Vercel dashboard under
  Storage -> Marketplace Database Providers, so you never leave Vercel.
- No other external services. Everything, including analytics, is yours.

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` - from step 2 below.
- `DASHBOARD_PASSWORD` - whatever password you want to use to log into the
  generator page and dashboard (both are private, only you should see them).
- `SESSION_SECRET` - any long random string (e.g. run `openssl rand -hex 32`).
- `NEXT_PUBLIC_SITE_URL` - leave as `http://localhost:3000` for now.

```bash
npm run dev
```

## 2. Create the database

1. Go to [vercel.com](https://vercel.com) → your account → **Storage** tab
   → **Create Database** → choose **Upstash** → **Redis**.
   (Or create one directly at [upstash.com](https://upstash.com) - same
   thing, free tier is plenty for bio-link traffic.)
2. Copy the **REST URL** and **REST TOKEN** it gives you into your env vars.

## 3. Deploy to Vercel

```bash
npm i -g vercel   # if you don't have it
vercel
```

Or push this folder to a GitHub repo and import it at
[vercel.com/new](https://vercel.com/new) - either works.

In the Vercel project's **Settings → Environment Variables**, add the same
four variables from your `.env.local`, but set `NEXT_PUBLIC_SITE_URL` to
your real deployed domain (e.g. `https://links.yoursite.com`). If you
connected the Upstash database through the Vercel Storage tab, the two
Redis variables are usually added for you automatically.

Redeploy after adding env vars.

## 4. Point a domain at it (optional but recommended)

A short custom domain looks far more trustworthy in a bio than a generic
`.vercel.app` URL. Add one under **Settings → Domains** in Vercel - a
subdomain like `go.yoursite.com` or `l.yoursite.com` works well and keeps
things short.

## 5. Use it

1. Visit your deployed URL, log in with `DASHBOARD_PASSWORD`.
2. Paste the destination URL, optionally set a custom slug, hit generate.
3. Put the resulting `yourdomain.com/l/slug` link in your Instagram bio.
4. Watch clicks land in `/dashboard`.

## How the redirect actually works

For each click, `app/l/[slug]/page.js` runs server-side first: it looks up
the link, parses the visitor's user-agent, and logs the click to Redis -
this happens regardless of whether the visitor's JavaScript ever runs, so
your click counts stay accurate.

It then renders `Redirector.js`, a client component that:

- **Android** - immediately navigates to an `intent://` URL built from the
  destination, with a `package=` hint if the destination matches a known
  app (see `lib/appSchemes.js`), and a `browser_fallback_url` so it always
  lands somewhere even if no app matches.
- **iOS** - first pings the destination app's own URL scheme (if known)
  through a hidden iframe, then after ~500ms tries the `x-safari-` prefix
  trick to force Safari.
- **Everyone** - sees a visible "Continue" button after ~1.2s as a manual
  fallback that always works.

`lib/appSchemes.js` has ~20 popular apps (YouTube, Spotify, Amazon,
TikTok, etc.) mapped to their custom URL scheme and Android package. Add
more entries there any time - it's just a list.

## Analytics

`/dashboard` lists every link with a running click count. Click into one
for total opens, an OS/browser/referrer breakdown, a 14-day sparkline, and
a table of the last 50 opens. All of it comes straight out of Redis -
counts are stored as incrementing hash fields (cheap, scales fine at
bio-link volume) plus a capped list of the 200 most recent raw events for
the activity table.

## Notes on privacy / what's _not_ tracked

No cookies are set for visitors, no IP addresses are stored, no
fingerprinting. Just: timestamp, coarse OS/browser (from the user-agent
string), and the referring domain. That's enough to know the tool is
working without turning it into a tracker.

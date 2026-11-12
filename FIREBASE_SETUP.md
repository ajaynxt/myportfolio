# AJAYNXT Showcase — Firebase setup and security

## Data separation
- `showcase_public`: visitor-safe title, category, industry, short summary, preview URL/path, featured/active flags, sort order and timestamps.
- `showcase_private`: full prompt text and private notes. Firestore rules allow access only to the verified owner email.
- `showcase/{designId}/...`: visual preview images. Visitors can read previews; only the verified owner can upload, replace or delete.

The public page never requests `showcase_private`. Never add prompt text to public records, page source, filenames, image metadata or analytics events.

## Firebase console setup
1. Create/open a Firebase project and register a Web app.
2. Copy the Web App config into `firebase-config.js`.
3. Enable Google in Authentication → Sign-in method.
4. Add `ajaynxt.com` in Authentication → Settings → Authorized domains.
5. Create Firestore in production/locked mode and publish `firestore.rules`.
6. Create/activate Cloud Storage and publish `storage.rules`.
7. Deploy the site and rules using your Firebase CLI / existing hosting workflow.

**Billing:** Cloud Storage for Firebase requires the Blaze pay-as-you-go plan from February 3, 2026. No-cost quotas remain available on Blaze, but usage above included quotas can be billed. Do not upgrade until billing and budget alerts are reviewed. Firestore is separate from Storage.

## Owner-only access
Open `https://ajaynxt.com/showcase-admin.html`. Sign in using the verified Google account `ajayx3neha@gmail.com`. The UI check is not the security boundary: the Firestore and Storage rules independently reject other accounts. Protect the Google account with 2-Step Verification and a unique password.

## App Check
The client supports reCAPTCHA v3 App Check. Register the website in Firebase App Check, put the site key in `appCheckSiteKey` in `firebase-config.js`, monitor valid traffic first, then enforce App Check for Firestore and Storage. App Check complements but does not replace Authentication and Security Rules.

## Google Analytics 4
Add the GA4 Web Measurement ID (format `G-XXXXXXXXXX`) in `ga4.js`. Until a real ID is entered, the tag stays inactive. Events include page views, navigation, project clicks, category filters, design impressions and WhatsApp prompt requests. Private prompts, email addresses, form contents and WhatsApp message text are not sent.

## Before launch
- Publish Firestore and Storage rules before enabling the admin panel.
- Test the public page signed out: only `showcase_public` records with `active: true` should be visible.
- Test prompt reads signed out: `showcase_private` must be denied.
- Test writes from a second Google account: all admin writes must be denied.
- Enable App Check enforcement only after checking valid traffic.
- Review Google Cloud budget alerts and usage.

This raises the security level substantially, but no public website can be guaranteed impossible to attack. Keep dependencies, account recovery methods and rules reviewed.

## Hosting-level browser protections
The root `firebase.json` config now sets HSTS (one year, apex only), nosniff, frame denial, a strict referrer policy, a limited Permissions-Policy, and CSP directives for framing/object/base-URL protections. The admin HTML and its loader JavaScript receive no-store cache headers; the admin route is also marked noindex. These are Firebase Hosting headers: they take effect only after deploying this repository to the Firebase Hosting project that serves the live domain.

These headers do not activate Cloudflare. Cloudflare DNS proxy, WAF managed rules, DDoS controls, Bot Fight Mode, rate limits, and Cloudflare TLS settings must be configured separately in the domain's Cloudflare zone.

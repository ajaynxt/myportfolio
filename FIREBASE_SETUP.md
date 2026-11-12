# AJAYNXT Showcase — Firebase setup

## What is stored where
- `showcase_public` (Firestore): title, category, industry, short summary, preview image URL/path, featured/active flags, sort order and timestamps. These fields are visible to visitors.
- `showcase_private` (Firestore): full prompt text and optional internal notes. Only the verified admin email in the rules can read or write this collection.
- `showcase/{designId}/...` (Firebase Storage): uploaded visual preview images. Images are public; uploads and deletes require the verified admin account.

The public page never requests `showcase_private`. Do not add prompt text to public documents, image metadata, filenames or public descriptions.

## Firebase console steps
1. Create or open a Firebase project and register a Web app.
2. In Project settings → General → Your apps, copy the web config into `firebase-config.js`.
3. In Authentication → Sign-in method, enable Google.
4. In Authentication → Settings → Authorized domains, add `ajaynxt.com`.
5. Create a Cloud Firestore database and paste the root `firestore.rules`.
6. Create the Storage bucket and paste the root `storage.rules`.
7. Deploy the Hosting files and rules using your Firebase CLI / existing hosting workflow.

**Billing note:** Firebase Storage may require the Blaze billing plan for new projects. Check the current Firebase console requirements before enabling it. No billing plan is activated by this repository change.

## Admin access
Open `https://ajaynxt.com/showcase-admin.html` and sign in with the verified Google account `ajayx3neha@gmail.com`. Other accounts are rejected in the UI and, importantly, by Firestore/Storage security rules.

## Google Analytics 4
Open GA4 → Admin → Data streams → Web → copy the Measurement ID (format `G-XXXXXXXXXX`). Replace the placeholder in `ga4.js`. The same file is loaded by the homepage, projects page and showcase. It tracks page views, WhatsApp/phone/email clicks, navigation, project clicks and showcase-specific events. No form values, prompts or message text are sent.

## Important deployment checks
- Verify Firestore rules and Storage rules are published before opening the admin panel.
- Never set `showcase_private` to public read.
- Never put prompts into `showcase_public`.
- Test the public page in a signed-out/incognito browser and test admin with the owner Google account.

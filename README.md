# Al Amaan Academy Website

A React + Vite + TypeScript + Tailwind website for Al Amaan Academy, with a separate admin panel backed by Firebase Authentication and Cloud Firestore.

- **Public site (five sections):** Home, About, Events & Achievements, Admissions, Feedback & Complaints.
- **Admin panel:** `/admin/login`, `/admin` (dashboard), `/admin/change-password`, plus settings, founder and teachers, events, achievements, gallery and videos, admission applications, feedback and complaints, and notifications.
- **Media:** photos and videos are added by pasting web URLs. Nothing is uploaded to Firebase Storage.

> **Status:** the code is complete, but it has not been run against a live Firebase project. Verify the steps below before relying on it.

---

## 1. Install

Requirements: Node.js 18 or newer.

```bash
cd al-amaan-academy
npm install
```

## 2. Create your own Firebase project

1. Go to <https://console.firebase.google.com> and create a **new** project.
2. Add a **Web app** (the `</>` icon). Copy the `firebaseConfig` values.
3. Enable **Authentication → Sign-in method → Email/Password**.
4. Create **Firestore Database** (Native mode). Pick a region close to your users.

## 3. Add your configuration

```bash
cp .env.example .env.local
```

Fill in `.env.local` with the values from your Firebase web app:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

`.env.local` is git-ignored. Never commit it. Firebase web config values are not secrets on their own, but security comes from the Firestore rules below.

Until these values are set, the site shows a setup notice instead of crashing.

## 4. Deploy the Firestore rules and indexes

Install the Firebase CLI and log in:

```bash
npm install -g firebase-tools
firebase login
firebase use --add     # choose your new project
firebase deploy --only firestore:rules,firestore:indexes
```

The indexes are required for the public pages, which combine `published == true` with ordering by `order`. Index creation can take a few minutes.

## 5. Authorize the first administrator

Administrator access is granted by a document in the `admins` collection, keyed by the user's UID. Signing in alone never gives admin access.

1. In **Authentication → Users**, click **Add user** and enter the admin's email and a strong temporary password. There is no public sign-up.
2. Copy that user's **User UID**.
3. In **Firestore Database**, create a collection named `admins`. Add a document whose **Document ID is the UID** from step 2. The fields can be empty, or you can add `role: "owner"`.
4. Sign in at `/admin/login` and change the password under **Change Password**.

To add another administrator, repeat steps 1–3. To remove one, delete their `admins` document. Their existing session stops working on the next check.

Firestore rules only allow writes from UIDs in `admins`. The console and Admin SDK bypass rules, which is how this bootstrap works. Never put a service-account key in this project.

## 6. Run locally

```bash
npm run dev
```

Open <http://localhost:5173>. The admin panel is at <http://localhost:5173/admin/login>.

## 7. Build and deploy

```bash
npm run build          # type-checks, then produces dist/
npm run preview        # optional local check of the production build
firebase deploy --only hosting
```

`firebase.json` already serves `dist/` with a single-page-app rewrite. Any hosting provider that supports SPA fallbacks (Netlify, Vercel, Cloudflare Pages) also works. Add the same environment variables in its dashboard.

---

## Data model (Firestore)

| Collection | Public read | Admin | Notes |
|---|---|---|---|
| `settings/site` | yes | write | Branding, contact, social links, About text |
| `founder` | published only | CRUD | Multiple allowed; `order` controls display |
| `teachers` | published only | CRUD | Team members |
| `events` | published only | CRUD | `eventDate` is a date-time string |
| `achievements` | published only | CRUD | `year` is a four-digit string |
| `gallery` | published only | CRUD | `mediaType` is `image` or `video`, plus `url` |
| `admissions` | never | read, update, delete | Created by public submissions with `status: "New"` |
| `feedback` | never | read, update, delete | Created by public submissions with `read: false` |
| `notifications` | never | read, update, delete | Written with each submission |
| `admins/{uid}` | own doc only | managed in console | Grants admin access |

## Security model

- Public visitors can read only `published == true` content and `settings`.
- Admission and feedback records are never readable publicly.
- Public submissions are accepted only with an exact set of fields, a fixed initial status, a server timestamp, and length limits.
- Admin access requires an `admins/{uid}` document. Signing in with a valid password is not enough.
- Everything not explicitly allowed is denied.

### Recommended hardening before launch

- **Firebase App Check** (reCAPTCHA Enterprise or reCAPTCHA v3 for web). This is the strongest protection against automated spam on the public forms. It is not enabled in this code; enable it in the console and add the SDK when you are ready.
- **Budget alerts** in Google Cloud, so unexpected write volume is noticed.
- **Email notifications** are not included. The admin panel shows in-app notifications only. To add email, deploy a Cloud Function on `notifications` creation and use an email provider. That requires the Blaze billing plan and is outside this project.

## Project structure

```
src/
  components/      shared UI, media (ImageBox/VideoBox), cards, form renderer, admin guard + CRUD manager
  hooks/           auth context, live Firestore collections, live site settings
  layouts/         public site layout (navbar, footer) and admin layout (sidebar)
  lib/             Firebase config, utilities, defaults, rate-limit helper
  pages/           public pages and admin pages
  services/        Firestore read/write functions and public submission functions
  validation/      field definitions and validation for every form
  types/           shared data types
firestore.rules    security rules
firestore.indexes.json  composite indexes for public queries
```

## Troubleshooting

- **"Firebase is not configured"**: check `.env.local` exists, has all values, and you restarted `npm run dev`.
- **"Permission denied" in admin**: check your UID exists under `admins`, and that the rules are deployed.
- **Public pages empty**: content must be **published**. Check the Publish/Hide badge in the admin panel.
- **"The query requires an index"** in the browser console: deploy `firestore.indexes.json` and wait for the index to finish building.
- **Video not playing**: paste a YouTube watch link or a direct `.mp4` link. Other links open in a new tab.
- **Image unavailable**: the image host may block hotlinking. Use a direct link from a host that allows it.

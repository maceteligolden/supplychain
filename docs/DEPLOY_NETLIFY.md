# Deploy to Netlify

This guide covers deploying the Traceability Platform POC to [Netlify](https://www.netlify.com/) for UAT and demos. The app uses **Next.js 16** with API routes and mock in-memory data.

## Prerequisites

- A Netlify account
- This project pushed to GitHub, GitLab, or Bitbucket (or use Netlify CLI drag-and-drop — not recommended for Next.js)

## One-time Netlify setup

### 1. Create a new site

1. In Netlify: **Add new site** → **Import an existing project**.
2. Connect your Git provider and select the repository.
3. If the Next.js app lives in a subfolder (e.g. monorepo), set **Base directory** to `supplychain`.
4. Netlify should detect **Next.js** automatically. Confirm:

| Setting           | Value                                           |
| ----------------- | ----------------------------------------------- |
| Build command     | `npm run build`                                 |
| Publish directory | `.next`                                         |
| Node version      | `20` (also set via `.nvmrc` and `netlify.toml`) |

The repo includes [`netlify.toml`](../netlify.toml) with the **OpenNext** adapter plugin (`@netlify/plugin-nextjs`).

### 2. Environment variables

In **Site configuration → Environment variables**, set:

| Variable                   | Required             | Example                         | Notes                                                                                                   |
| -------------------------- | -------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `SESSION_SECRET`           | **Yes** (production) | long random string (32+ chars)  | Signs session cookies. Never use the dev default in production.                                         |
| `NEXT_PUBLIC_APP_URL`      | Recommended          | `https://your-site.netlify.app` | Used for server-side API calls. If omitted, Netlify’s `URL` / `DEPLOY_PRIME_URL` is used automatically. |
| `NEXT_PUBLIC_USE_MOCK_API` | Optional             | `true`                          | Default in `netlify.toml`. Keep `true` for POC mock data.                                               |
| `MOCK_DELAY_MS`            | Optional             | `200`                           | Simulated API latency.                                                                                  |

`HUSKY=0` is set in `netlify.toml` so Git hooks do not run during Netlify installs.

### 3. Deploy

Click **Deploy site**. First build may take a few minutes.

After deploy, open the **Production URL** (e.g. `https://your-site.netlify.app`) and log in with the POC test account (see [GET_STARTED.md](./GET_STARTED.md)).

---

## Deploy from CLI (optional)

```bash
cd supplychain
npm install
npm run build   # verify locally first
npx netlify-cli login
npx netlify-cli init
npx netlify-cli deploy --prod
```

---

## POC limitations on Netlify

- **Mock data is in-memory.** On serverless, data may not persist reliably across requests or redeploys. Treat the deployment as a **demo/UAT** environment, not production storage.
- **Single Super Admin role** — see GET_STARTED guide for test credentials.
- **Session cookies** use `Secure` in production (HTTPS on Netlify).

---

## Troubleshooting

| Issue                               | Fix                                                                         |
| ----------------------------------- | --------------------------------------------------------------------------- |
| Build fails on `husky`              | Ensure `HUSKY=0` in Netlify env or `netlify.toml` (already configured).     |
| Login works but pages 401           | Set `SESSION_SECRET` in Netlify env; redeploy.                              |
| Server components fail to load data | Set `NEXT_PUBLIC_APP_URL` to your exact Netlify URL (including `https://`). |
| Wrong app folder built              | Set **Base directory** to `supplychain` in Netlify build settings.          |
| Stale build                         | **Deploys → Trigger deploy → Clear cache and deploy site**.                 |

---

## Related docs

- [GET_STARTED.md](./GET_STARTED.md) — UAT tester guide (deployed URL)
- [SETUP.md](./SETUP.md) — local developer setup

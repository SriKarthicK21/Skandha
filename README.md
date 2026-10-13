# SKANDA — High-Level GRC Portal

Multi-tenant Governance, Risk and Compliance SaaS platform: guided onboarding,
automated ISO/IEC 27001 document generation, digital MoU execution, RBAC,
policy lifecycle, evidence vault, TPRM, security-questionnaire intelligence and
audit management.

This repository is the full application, including the server-side Gemini
integration. It was originally built in **Google AI Studio** and is designed to
round-trip: clone it, run it locally, or re-import it into AI Studio.

> Live AI Studio app: https://ai.studio/apps/b0d2976f-d8e8-4fd2-a1f4-c9e89349c534

---

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + TypeScript, Vite 6, Tailwind CSS 4, `motion`, `recharts`, `d3`, `lucide-react` |
| Server | Express 4, served with Vite in middleware mode (dev) or `dist/` static (production) |
| AI | `@google/genai` (server-side Gemini API calls) |
| Documents | `jspdf`, `pptxgenjs`, `html2canvas`, `jszip`, `@resvg/resvg-js` |
| Storage | PostgreSQL (`pg`) when `DATABASE_URL` is set, otherwise a JSON file repository |

---

## Quickstart

**Prerequisites:** Node.js (no `engines` pin is declared — the project is developed against Node 22) and npm.

```bash
npm install
```

Create `.env.local` and set the Gemini key:

```
GEMINI_API_KEY="your-key-here"
```

Optionally copy `.env.example` to see every supported variable, including the
PostgreSQL settings.

```bash
npm run dev
```

Open http://localhost:3000. The server binds `0.0.0.0:3000`
(`PORT` overrides the port).

> The Gemini key is read **server-side only**. Do not add a Vite `define` that
> inlines it — that would ship the key inside browser assets.

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts `server.ts` via `tsx` — Express + Vite middleware on port 3000 |
| `npm run build` | `vite build` for the SPA, then bundles the server to `dist/server.cjs` |
| `npm start` | Runs the bundled production server (`node dist/server.cjs`) |
| `npm run preview` | Serves the built SPA with `vite preview` |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) |
| `npm run clean` | Removes `dist/` and the legacy `server.js` bundle |

---

## Storage modes

The repository layer selects its backend automatically at startup
(`server/repositories/GrcRepositoryFactory.ts`):

- **`DATABASE_URL` set** → `PostgresGrcRepository`, with schema in
  `server/db/migrations/`.
- **`DATABASE_URL` unset** → `JsonGrcRepository`, which lazily creates its data
  directory and JSON files on first write.

Because runtime state is machine-local, `data/` (JSON stores, evidence vault,
uploaded and generated questionnaire artifacts) and `scratch/` are **gitignored**.
A fresh clone starts with an empty store and the directories are recreated on
first use.

---

## Layout

```
server.ts                 Express entrypoint: API routes, Vite middleware, schedulers
server/                   API routes, services, repositories, connectors, SQL migrations
src/                      React shell (App.tsx, context, components, services)
scripts/                  Validation and audit harnesses (responsive QA, E2E, UI audit)
docs/                     Architecture and assessment notes
metadata.json             AI Studio app manifest
index.html                Vite HTML entry
```

---

## Using this repository with Google AI Studio

AI Studio keeps a two-way sync with a GitHub repository:

1. In AI Studio **Build**, click **+** in the prompt box → **Import from GitHub**,
   then pick the repository (or paste its URL) and **Import repository**.
2. When AI Studio offers to sync, choose **Force push to `<repo-name>`**. This
   makes the AI Studio copy authoritative for the synced branch — the code here
   is the same tree, so the round-trip is a no-op, but expect the remote branch
   to be rewritten.
3. Afterwards, sync is managed from **Settings → GitHub**, where you can push
   AI Studio edits back or pull commits made here.

The Gemini key is not stored in this repository. AI Studio injects it as a
server-side secret (`GEMINI_API_KEY`); locally you supply it through
`.env.local`, which is gitignored.

Reference: [Build apps in Google AI Studio](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)

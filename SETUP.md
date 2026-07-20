# Local setup

## Prerequisites

- Node.js 20.9 or newer
- pnpm 10 or newer
- Optional: an OpenAI API key with access to GPT-5.6 Terra and GPT Image 2

## Install

```bash
pnpm install
```

Create the local environment file.

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS or Linux:

```bash
cp .env.example .env.local
```

The app starts in labeled sample mode when `OPENAI_API_KEY` is blank. For live calls, edit `.env.local` locally and set:

```text
OPENAI_API_KEY=
OPENAI_TEXT_MODEL=gpt-5.6-terra
OPENAI_IMAGE_MODEL=gpt-image-2
NEXT_PUBLIC_DEMO_MODE=true
```

Do not commit `.env.local` and do not use a `NEXT_PUBLIC_` prefix for the key.

## Run

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Verify

```bash
pnpm verify
```

For the desktop and mobile browser flow:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

## Expected sample behavior

With no API key, the four API routes remain functional and return explicit sample fixtures. These fixtures adapt names, interests, allergies, city and radius from the editable browser profile. The UI shows `Sample result` and the trace identifies `Sample fixture`. Event source links remain clickable, but sample dates are illustrative and must not be presented as current events.

Family Memory is stored in `localStorage` and survives a reload. Use its JSON export/import controls to move the POC profile between browser sessions. Editing or importing a profile clears old generated results.

## Live-call guardrails

- The API key remains server-side.
- Requests are schema-limited and model responses are Zod-validated.
- Invitation generation is limited in the browser session.
- API failures produce a retry state and an explicit sample option.
- Set a project budget and rate limits in the OpenAI Platform before public deployment.

## Deployment

Import the repository into Vercel, add the three server environment variables, and deploy without authentication. Test the public URL in a fresh browser before recording the video.

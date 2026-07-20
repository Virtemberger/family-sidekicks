# Family Sidekicks

> One family memory. A Sidekick for every corner of family life.

**Live demo:** [family-sidekicks.vercel.app](https://family-sidekicks.vercel.app/)

Family Sidekicks is an interactive product POC for OpenAI Build Week 2026, track **Apps for Your Life**. Families configure their context once. A crew of specialized Sidekicks then works in dedicated Corners while sharing the same ages, interests, allergies, location and parent preferences.

Crew Home is a daily family dashboard rather than a product landing page. It combines an attention queue, a family timeline, clearly labeled demo weather and schedule data, meals, nearby ideas, the next seven days and three personal Sidekick shortcuts per parent. Shared task completion and saved results stay consistent when the parent view changes.

This is deliberately not a collection of blank chatbots. Every Corner combines:

- a named, visually distinct Sidekick
- a structured tool that produces a usable outcome
- an ongoing conversation for refinement and follow-up
- a persistent Workbench Memory that connects the latest structured result to that conversation
- a visible list of family facts used in the answer
- shared artifacts that other parents and Sidekicks can see

## Live Corners

| Corner | Sidekick | Structured job | Conversation |
|---|---|---|---|
| Adventure | Skippy | Current family events with sources, save, share and calendar export | Trade-offs, weather, budget and family fit |
| Kitchen | Nori | Time-boxed meal with pantry gaps, child adaptation and allergy check | Swaps, preferences and weekly planning |
| Stories | Lumi | Complete age-appropriate family story plus on-demand illustration | Roles, length, mood and continuation |
| Learning | Atlas | Worksheet screenshot analysis, same-level practice and printable worksheet plus answer key | Hints, method and parent guidance |
| Parties | Pippa | Birthday concept, friend-by-friend parent contacts, schedule, budget, tasks, invitation and social/calendar handoff | Creative and operational refinements |
| Fun | Quinn | Player-aware quiz with rotating turns plus would-you-rather, charades and story-chain rounds | Difficulty, topic and game adjustments |
| Buddy Workshop | Moxie | Guided custom Buddy configuration with scoped memory | Job, voice and guardrail refinement |
| Care | Cleo | Saved doctors, pharmacies, appointments, age-based insights and optional sourced local search | First steps, never diagnosis or dosing |
| Admin | Pip | School/Kita/city directory, local document metadata and optional official-news search | Official verification remains explicit |
| Vacation | Romy | Guided destination discovery, travel frame, family itinerary, packing and clearly simulated booking handoffs | Family-fit and planning refinements |

Families can create additional Buddys in Moxie's workshop. A custom Buddy persists locally, appears in the crew and receives only the memory scopes selected during creation.

## Judge Path

1. Start on Crew Home: show today's attention queue, weather, timeline, meals, nearby activity and week view.
2. Complete one task, switch parents and show that the shared status stays complete while the personal Sidekick shortcuts change.
3. Use `Choose three` to personalize one parent's Home crew.
4. Open Family Memory, change a child name, interest, allergy or city, then reload to prove browser persistence.
5. Enter Adventure Corner, find weekend plans and save one result.
6. Enter Kitchen Corner, generate a 25-minute dinner and show the edited allergy constraint.
7. Ask Nori a follow-up without repeating the family profile; show `Memory used`.
8. Enter Story Corner and create a story using the edited child names and interests.
9. Use the full left navigation to show Atlas, Pippa, Quinn, Cleo, Pip, Romy and Moxie, then close on Judge View.

Without an OpenAI API key, every AI call returns a visible **Sample result**. No fallback is hidden.

## Family Memory

The demo profile is fully editable. It stores family basics, two parent views with invitation contacts, up to six child profiles, care contacts, appointments, school/Kita/public-service institutions and locally stored document metadata.

- The profile persists in `localStorage` after a reload.
- Home task status and each parent's three selected Sidekick shortcuts persist separately.
- Every Sidekick request receives the same current profile.
- Conversations remain separate per Sidekick.
- Each Corner stores its latest structured result as a per-Sidekick Workbench Memory. The connected result is visible in the chat and survives navigation, parent switching and reloads.
- Custom Buddys store a visible allow-list of family memory scopes.
- Editing the profile clears old generated results so facts cannot leak between families.
- JSON export and import make the POC state portable without pretending that a cloud account exists.

## Quick Start

Requirements: Node.js 20.9 or newer and pnpm.

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

For live Sidekick answers, add a project API key only to `.env.local`:

```text
OPENAI_API_KEY=your_server_side_key
OPENAI_TEXT_MODEL=gpt-5.6-terra
OPENAI_IMAGE_MODEL=gpt-image-2
```

Never paste the key into the browser or expose it through a `NEXT_PUBLIC_` variable. Set an OpenAI project budget before deploying publicly.

## Active API Routes

- `POST /api/buddies/chat`: Sidekick conversation with shared family context
- `POST /api/events`: sourced current event discovery
- `POST /api/meals`: structured family meal planning
- `POST /api/stories`: structured story generation
- `POST /api/story-image`: on-demand story illustration with GPT Image 2
- `POST /api/learning`: optional screenshot vision, explanation and matched practice
- `POST /api/birthday`: structured party project
- `POST /api/invitation`: party invitation image generation
- `POST /api/quiz`: configurable mixed-age family quiz
- `POST /api/local-brief`: optional sourced pharmacy or official local-family brief
- `POST /api/destination-ideas`: three scope-aware family destination directions
- `POST /api/vacation`: structured family vacation outline
- `POST /api/buddy-builder`: guided custom capability blueprint

## Architecture

- Next.js App Router, React, TypeScript, Tailwind CSS and Lucide icons
- OpenAI Responses API with GPT-5.6 Terra and Zod structured outputs
- Editable browser-only family state with JSON export/import; no account or cloud database
- Server-side API key only
- Separate conversation history per Sidekick, shared family memory across all Sidekicks
- Persistent per-Sidekick Workbench Memory connects structured tools and follow-up chat
- Explicit result mode and execution trace for every live or sample response

See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for details.

## Verification

```bash
pnpm verify
pnpm exec playwright install chromium
pnpm test:e2e
```

The Playwright suite covers the featured Corners plus navigation into Atlas, Pippa, Quinn and Moxie on desktop and mobile profiles.

## Privacy and Safety

- The shipped Weber profile is synthetic. Use invented data when testing a public deployment.
- An edited profile stays in the current browser unless the user explicitly exports it.
- Browser coordinates are optional and are not persisted.
- Allergies are hard prompt constraints, but users must still check product labels.
- Worksheet screenshots are resized in the browser, used for one request and never written into Family Memory. Generated practice can be printed locally.
- Pip's document demo persists file names and metadata only; file contents are not stored or uploaded by the POC.
- WhatsApp and email actions open user-controlled drafts for selected party contacts. Pippa never sends automatically.
- Romy's CHECK24, Airbnb and hotel-search surfaces are illustrative MCP handoff previews. They do not search inventory, quote live prices or create bookings.
- Cleo never provides a diagnosis or medication dosing and displays emergency escalation boundaries.
- Pip marks deadlines, eligibility and legal requirements for official verification.
- Custom Buddys receive only their selected memory scopes; their configuration and messages remain browser-local.
- Sponsored, premium and partner surfaces are visibly simulated.
- A production version needs field-level consent, private parent spaces, deletion controls and audited connector access.

## Submission Material

- [Judge guide](./docs/JUDGE_GUIDE.md)
- [Video script](./docs/DEMO_SCRIPT.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Submission checklist](./docs/SUBMISSION_CHECKLIST.md)

## Visual Assets

All Sidekick portraits were generated specifically for this POC with OpenAI's built-in image generation tool. They depict fictional human-like characters and contain no third-party brand assets.

## License

MIT. See [LICENSE](./LICENSE).

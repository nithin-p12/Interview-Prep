# Guided System Design Lab

A guided, progressive way to learn system design. A "senior engineer" starts from the simplest working
architecture and introduces new requirements one stage at a time. Each new component (Kafka, Redis, load
balancer, more instances…) appears **in the same diagram** only when a requirement forces it, with the reason,
how it works, what happens without it, trade-offs and failure scenarios.

Pilot: **URL Shortener** only. The existing simulators in `../` are untouched.

## Run it

Open `index.html` in a browser (double-click works; no server or build step needed).
`index.html?system=<id>` picks a system; the default is the first entry in `systems/index.js`.

Keys: <kbd>Space</kbd> play / pause a flow · <kbd>←</kbd> <kbd>→</kbd> step · <kbd>Esc</kbd> close the inspector.
Mouse wheel zooms the diagram, drag pans, ⤢ fits it again.

## Layout

| Area | Responsibility |
|---|---|
| Left: stage list | Where you are: progress, completed ✓ / current ● / upcoming ○ / locked. One navigation, nothing else. |
| Centre: canvas | **What exists and how it connects.** Toolbar: stage, what was added, Before / After compare, replay the change, zoom. Flows row: the request flows of this stage. Flow bar: play / pause / step / replay / speed and the step caption. |
| Right: mentor | **Why we change the design now**: new requirement, why the current design falls short, what we introduce, how it works, without it, trade-offs, failures, common questions, then *Continue*. |
| Right: inspector | **How the selected component works inside** (click any component). Same structure for every component. |
| Stage 8 | Interview-ready answer assembled from the journey (centre + right; the inspector opens as a drawer). |

## Project structure

```text
03_Guided_SD_Lab/
├── index.html                    page shell; loads the engine, then the chosen system's files
├── core/
│   ├── lab.js                    namespace, LAB.define registry, animation clock, text helpers
│   ├── state.js                  progress in localStorage, preferences, #stage/flow routing
│   ├── progression.js            stage deltas → architecture per stage, diffs, flows per stage
│   └── app.js                    wires everything together for one system
├── components/
│   ├── architecture-canvas.js    SVG diagram: draw, animate stage changes, zoom/pan, packets, marks, chips
│   ├── flow-visualizer.js        flow player + flow bar + flow picker
│   ├── mentor-panel.js           mentor content for a stage
│   ├── component-inspector.js    generic inspector driven by component data
│   ├── progress-tracker.js       left stage list
│   └── interview-summary.js      stage-8 document built from stages, components, flows and the knowledge base
├── systems/
│   ├── index.js                  catalog of systems and the files each one loads
│   └── url-shortener/
│       ├── config.js             title, tagline, home link
│       ├── components.js         component definitions (inspector content)
│       ├── knowledge-base.js     requirements, estimates, APIs, schema, strategies, follow-ups, 45-min plan
│       ├── flows.js              request flows (declarative steps)
│       └── stages.js             the learning path: architecture deltas + mentor content
└── styles/
    ├── base.css                  theme tokens (light / dark), controls
    ├── layout.css                three-area layout, breakpoints
    ├── architecture.css          canvas, diagram, flows, flow bar
    └── components.css            stage list, mentor, inspector, interview document
```

The engine never mentions a specific system. Everything about the URL Shortener lives in `systems/url-shortener/`.

## How the progression engine works

Each stage declares only **what changes**:

```js
arch: {
  nodes: { redis: { x: 800, y: 110 } },                      // add a component (or move / relabel one)
  edges: [{ from: 'app', to: 'redis', label: 'GET / SET' }], // add a connection (kind: 'sync' | 'async')
  remove: ['client-app'],                                     // drop a connection or component by id
}
```

`LAB.Progression` folds the stages in order, so the architecture at stage *k* is stage 1's plus every change up
to *k*. It also computes the diff to the previous stage, which drives:

- the **build animation** when you continue (removed links fade, moved components slide, new ones pop in and
  their connections draw), replayable with ⟲;
- the **NEW** badges and the "+ Redis" note;
- **Before / After**: the previous stage's diagram with what this stage removes marked in red.

Component ids are stable across stages (`app` is "Spring Boot app" in stage 2 and "Service A" in stage 6), so a
component keeps its identity while the design evolves. Edge ids default to `from-to`.

Progress (furthest stage reached, stages completed) is stored per system in `localStorage` under `glab:<id>`;
"Unlock all" opens every stage for revision. The state lives in `core/state.js`, which is the place to swap in
server persistence later.

## Adding another system (for example Ticket Booking)

1. Create `systems/ticket-booking/` with the same five files (copy the URL Shortener ones as a template).
2. Add it to `systems/index.js`:
   ```js
   { id: 'ticket-booking', title: 'Ticket Booking', files: ['config', 'components', 'knowledge-base', 'flows', 'stages'] }
   ```
3. Open `index.html?system=ticket-booking`.

No engine changes are needed.

### Defining components (`components.js`)

```js
redis: {
  name: 'Redis', tech: 'cache · code → URL', icon: '⚡',
  category: 'cache',             // service | messaging | cache | storage | infra | client | external (sets the colour)
  ext: false,                    // true = a system we do not own (dashed outline)
  extends: 'app',                // optional: reuse another component's write-up (Service B extends Service A)
  purpose, whyIntroduced, without, with,          // text
  responsibilities: [], internalFlow: [], failures: [], tradeoffs: [],  // lists
}
```

The inspector renders these fields in a fixed order, adds "Connections in this stage" from the architecture,
and links to the stage where the component was introduced.

### Defining stages (`stages.js`)

```js
{
  id: 'caching', nav: 'Caching · Redis', title: 'Redis caching for the redirect path',
  arch: { nodes, edges, remove },
  flows: ['redirect-cache', 'redis-down'],
  challenge: { type: 'requirement' | 'constraint' | 'goal' | 'risk', label, text },
  problem, introduce: { components: ['redis'], text }, why, how: [],
  extra: [{ t, text | list | ol | table: { head?, rows } | code, after?, open? }],
  without, tradeoffs: [], failures: [], faq: [{ q, a }], takeaway,
}
```

Every field except `id` and `title` is optional. A stage with `kind: 'summary'` renders the interview-ready view.
Its trade-offs and failure sections are collected from all stages automatically.

### Defining flows (`flows.js`)

```js
'redirect-cache': {
  title: 'Redirect with cache', sub: 'cache-aside', tone: 'cache',
  variants: {                       // optional; or a plain `steps: [...]`
    hit: { label: 'Cache hit', steps: [
      { t: 'Caption shown in the flow bar',
        go: [{ p: ['app', 'redis'], l: 'GET url:4c92', k: 'cache', ret: 'HIT', rk: 'cache' }],
        mark: { redis: 'ok' },      // ok | fail | warn | down | active | null
        chip: { redis: ['HIT', 'ok'] } },
    ] },
  },
}
```

A track moves a labelled packet along existing connections (`p` lists component ids, in either direction).
Tracks in the same step run in parallel; `delay` staggers them, `ret` sends a reply back along the same path, and
`fail: true` makes the last hop bounce back in red. Marks and chips apply when the step's packets arrive and stay
for later steps. Tones: `req` blue, `res` / `ok` green, `async` purple, `cache` orange, `fail` red, `info` grey.

The interview view lists the steps of the flows named in `knowledge-base.js → flows`.

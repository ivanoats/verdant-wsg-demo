# 2. Use Custom Node Scripts for Static Site Generation

Date: 2026-09-23

## Status

Accepted

## Context

The Verdant site needs to be deployed as a highly optimized, lightweight static site to demonstrate Web Sustainability Guidelines (WSG) alignment. We need a way to generate static HTML efficiently while keeping absolute control over the final output payload to meet strict byte budgets (currently ~20.2 KiB for initial render and ~51.2 KiB for cold first session). 

We explicitly evaluated modern framework approaches, specifically **Vite + React**, against writing custom Node.js scripts.

## Considered Options

### Option 1: Client-Side React (SPA/Hydrated) via Vite
In this model, Vite bundles React components and ships a JavaScript bundle to the browser to render and hydrate the DOM.
*   **Payload Impact:** React (`react` + `react-dom`) adds roughly ~42 KiB (Brotli/gzipped) to the baseline client payload. Including a router (e.g., React Router at ~15 KiB) and the application logic, the client-side JavaScript alone would conservatively weigh **60-80 KiB**. 
*   **Budget Impact:** This approach would instantly violate our initial render budget (21.5 KiB limit) by over 300%. It forces the browser to download, parse, and execute a heavy JavaScript bundle before the page becomes interactive, increasing client-side energy consumption (violating WSG principles on device energy efficiency).

### Option 2: React for Build-Time SSG Only (Zero Hydration) via Vite
In this model, React is used purely as a templating engine during the Vite build process. The output is pure HTML and CSS, with the React runtime stripped before shipping to the client.
*   **Payload Impact:** Zero added bytes to the client. The shipped bundle would remain identical to our current ~20.2 KiB baseline.
*   **Budget Impact:** Client budgets are respected.
*   **Trade-offs:** While this improves Developer Experience (DX) by allowing component-based JSX authoring, it introduces a heavier, more complex build toolchain (Vite, Rollup, Babel/SWC). This increases Continuous Integration (CI) build times and energy consumption, which is also a WSG consideration. Furthermore, preventing accidental client-side hydration requires strict tooling configuration.

### Option 3: Custom Node.js Scripts (Chosen)
We use bespoke, vanilla Node.js scripts (`scripts/build.mjs`) using template literals and modular functions to generate the HTML.
*   **Payload Impact:** Zero added bytes to the client. HTML is constructed precisely as written.
*   **Budget Impact:** Client budgets are strictly respected.
*   **Trade-offs:** Maximum control and the lowest possible build-time energy overhead, but at the cost of DX (no JSX, manual routing, manual live-reloading logic).

## Decision

We decided to proceed with **Option 3: Custom Node.js scripts**. 

While Option 2 (React as a pure SSG templating engine) is viable for client performance, the project's extreme commitment to sustainability led us to reject the additional build-time complexity and CI overhead introduced by Vite and React. The current site's scope (a handful of static pages and a component gallery) does not yet justify a heavy build pipeline.

## Consequences

- **Positive:** Zero client-side framework overhead, preserving our ~20.2 KiB initial render weight limit.
- **Positive:** Fast, predictable builds with minimal dependencies, minimizing CI energy use.
- **Positive:** Absolute control over the output, enabling aggressive optimizations like inline SVG art without framework interference.
- **Negative:** We sacrifice standard framework features (JSX, file-based routing, HMR), placing a higher maintenance burden on contributors who must maintain the custom build orchestrator.

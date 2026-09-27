# 3. Use PandaCSS for Styling

Date: 2026-09-23

## Status

Accepted

## Context

We need a styling solution for the Verdant design system and its demo site. The styling approach needs to support a complex design system (tokens, semantic colors, recipes, theme contracts, dark/light/system modes, high contrast) while adhering to strict performance and sustainability budgets. Traditional CSS-in-JS libraries (like Styled Components or Emotion) introduce a runtime cost and block rendering. Utility-first frameworks (like Tailwind) can generate large CSS bundles if not carefully purged, and can make complex component recipes harder to manage across packages.

## Decision

We chose to use [PandaCSS](https://panda-css.com) for styling. PandaCSS is a build-time CSS-in-JS engine that statically extracts styles from our JavaScript/TypeScript files and generates a single, atomic CSS file without any browser-side runtime.

## Consequences

- **Positive:** Zero client-side CSS-in-JS runtime, leading to faster execution and lower energy consumption on the user's device.
- **Positive:** Excellent developer experience for building a design system, supporting type-safe tokens, recipes, and layout patterns out of the box.
- **Positive:** The generated CSS is highly optimized. It only includes the styles actually used by the site, keeping the byte budget extremely low.
- **Negative:** The build process involves an extra step (`panda codegen` and `panda cssgen`) to parse files and extract CSS.
- **Negative:** Style bindings must remain statically analyzable literal calls so Panda can find them during the build phase.

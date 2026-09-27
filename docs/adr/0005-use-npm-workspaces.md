# 5. Use NPM Workspaces for Design System Integration

Date: 2026-09-23

## Status

Accepted

## Context

The Verdant project consists of two logical parts: the design system itself (tokens, recipes, components) and the demo site that consumes it. We need a way to manage these parts so that the design system can be published as a standalone package (`@sustainablewebsites/verdant-design`) while allowing the demo site to seamlessly import and test changes to the design system locally without publishing.

## Decision

We decided to use a monorepo structure powered by npm workspaces. The root `package.json` defines `workspaces: ["packages/*"]`, with the design system located in `packages/verdant-design/` and the site consuming it like a standard dependency.

## Consequences

- **Positive:** Seamless local development. Changes made in the design system package are immediately available to the site build without needing `npm link` or local publishing.
- **Positive:** Clear separation of concerns. The design system is neatly packaged and isolated from the site's specific build orchestration scripts.
- **Negative:** Slightly more complex repository structure compared to a single flat project.

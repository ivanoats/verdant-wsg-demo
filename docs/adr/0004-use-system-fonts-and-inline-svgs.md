# 4. Use System Fonts and Inline SVGs

Date: 2026-09-23

## Status

Accepted

## Context

Web fonts and external image requests are significant contributors to page weight and network overhead, which directly impacts energy consumption and Web Sustainability Guidelines (WSG) alignment. Every external request adds latency, connection overhead, and potential rendering shifts.

## Decision

We decided to strictly rely on system fonts (`system-ui` for text, `ui-monospace` for code) by default, completely eliminating web font requests. Additionally, decorative artwork (like the hero valley and CTA meadow) is constructed using inline SVG elements rather than external image files.

## Consequences

- **Positive:** Zero bytes and zero network requests spent on web fonts. Text renders immediately without FOIT (Flash of Invisible Text) or FOUT (Flash of Unstyled Text).
- **Positive:** Inline SVGs eliminate extra HTTP requests for images and allow us to style the artwork directly using our design system's CSS tokens (e.g., dynamically recoloring based on the user's light/dark theme preference).
- **Positive:** Reduces overall data transfer, helping us stay well within strict CI byte budgets.
- **Negative:** The project sacrifices distinct brand typography by defaulting to the OS's system font. (An off-ramp is documented for subsetted, self-hosted WOFF2 fonts if absolutely required, but the default remains zero web fonts).
- **Negative:** Complex SVG art inflates the HTML document size and DOM node count. This requires careful profiling (e.g., `npm run profile:art`) to balance visual richness against main-thread parsing and layout costs.

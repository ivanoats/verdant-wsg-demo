# 1. Use Markdown Architectural Decision Records

Date: 2026-09-23

## Status

Accepted

## Context

We need a way to document architectural decisions for the Verdant WSG Demo project, allowing future maintainers to understand the rationale behind past choices. The project aims for Web Sustainability Guidelines (WSG) alignment, which requires conscious and documented trade-offs regarding performance, dependencies, and infrastructure.

## Decision

We will use Markdown Architectural Decision Records (ADR) to document architectural decisions. ADRs will be stored in the `docs/adr` directory. Each ADR will be a numbered markdown file. We will maintain an Architectural Decision Log (ADL) in `docs/adr/index.md` to index the records.

## Consequences

- **Positive:** We have a lightweight, text-based, and version-controlled way to record decisions.
- **Positive:** It aligns with the project's markdown-heavy documentation strategy.
- **Negative:** Requires discipline to write and update them as the architecture evolves.

# Docs checklist

Purpose: tick before finishing a job that touches a public API, a story, a scenario or a page. Missing checks: [index](./index.md#the-docs-in-every-job-rule).

- [ ] Every new or changed public symbol has TSDoc (summary, `@defaultValue` where needed, `@example` on roots).
- [ ] The spec `<name>.meta.ts` lists `data-*` per part, keyboard rows and expected roles; no props or events in it.
- [ ] The docs page of each component is updated as the [docs-in-every-job rule](./index.md#the-docs-in-every-job-rule) says.
- [ ] The story config gives the sample and the skips; the compiler generates the playground and the option, boolean and union stories.
- [ ] Custom stories cover what is not generated: host variants, accessible names, forms, one story per behaviour switch.
- [ ] Members with a framework-specific name carry `@cckSemantic`; the API parity check is clean.
- [ ] A scenario where [stories-and-scenarios.md](./stories-and-scenarios.md) requires one ([scenarios.md](./scenarios.md)); it passes in `docs-e2e:e2e` in every built framework.
- [ ] Overlay components: `in-clipped-container` and `inside-modal-dialog` stories; `outside-click`, `focus-return`, `tab-order`, `nested-overlays`, `inside-modal-dialog` scenarios; the `api.mdx` Usage note says the content is portaled; Accessibility says where focus goes.
- [ ] The `.mdx` page keeps the fixed section order; prose follows the writing guideline.
- [ ] Docs app CSS uses only the [type scale](./site-architecture.md#type-scale) tokens for `font-size`.
- [ ] Docs app and preview app styles and scripts hold no colour value outside their [token files](./site-architecture.md#colours).
- [ ] The [production checklist](./production-checklist.md) holds for every page touched.

## Common mistakes

| Mistake | Instead |
|---|---|
| Sibling parts in the Angular example | Angular uses content projection |
| Scenario selects `[data-testid]` or `[data-part]` | `part('trigger', i)` or `role('tab', ...)` |
| Overlay snippet implies the content stays next to the trigger | Note that it is portaled; keep the authoring shape |
| Iframe reloaded on a live control change | `setArgs`; only initial (`default*`) args remount through `render` |
| Scenario target found in another instance | Targets are resolved inside the preview frame of the story; select by role and exact accessible name, or by part and index |
| Page for a component left stale after a cdk or util change | Update the page of every importing component ([docs-in-every-job rule](./index.md#the-docs-in-every-job-rule)) |

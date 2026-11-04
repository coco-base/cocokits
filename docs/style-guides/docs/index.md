# Documentation guide

Scope: how public API is documented (TSDoc on the source), how documentation prose is written, and how the public docs site is built and kept production-ready. The TSDoc comments, the `<name>.meta.ts` files and the markdown files in the repository are the documentation.

Rules that apply to all code are in [architecture.md](../../architecture.md); commands are in [targets.md](../workspace/targets.md).

## The docs-in-every-job rule

Every job that creates or touches a component updates its docs page in the same branch, including components that import a changed cdk module or util, unless the approved spec lists the page under Out of scope with the id of the job that owns it; the PR says which job ([writing-specs](../../../.claude/skills/writing-specs/SKILL.md)). Why: [tooling](../../why/tooling.md#docs-updated-in-every-job).

TSDoc, prose, the site and its checks are owned by the topic files below. The commands are in [targets.md](../workspace/targets.md); a docs check that it does not list is reported `not available`.

## Topic files

| File | Load when |
|---|---|
| [writing-guideline.md](./writing-guideline.md) | Writing documentation prose |
| [site-architecture.md](./site-architecture.md) | Changing the apps, the docs build or the dev setup; why there is no Storybook |
| [preview-protocol.md](./preview-protocol.md) | Changing the message contract between the site and a preview app |
| [api-extraction.md](./api-extraction.md) | Where API descriptions live (TSDoc only); TSDoc rules and per framework; semantic ids; the `ApiDoc` shape |
| [stories-and-scenarios.md](./stories-and-scenarios.md) | The story files and config, theme stories, which stories are generated and how they merge, named slots; when a scenario is required |
| [scenarios.md](./scenarios.md) | Writing a scenario: the step API, what the `stories` target checks and writes, how the end-to-end test runs it |
| [story-language.md](./story-language.md) | Writing a custom story: the language, args, state and handlers, catalog types and the error codes |
| [compiler-limitations.md](./compiler-limitations.md) | A story needs something the compiler refuses; adding a limitation or a TODO |
| [interaction-portability.md](./interaction-portability.md) | A story with an event handler: the domain, the trace table, the portability check and its evidence |
| [playground-and-snippets.md](./playground-and-snippets.md) | Playground controls, the code panel, the snippet template of a story with args, the layout rule of printed markup, compile checks |
| [component-pages.md](./component-pages.md) | Writing the `.mdx` page of a component |
| [production-checklist.md](./production-checklist.md) | Touching the site or a page; the site is public and production-ready at any time |
| [checklist.md](./checklist.md) | Before the PR; common mistakes |

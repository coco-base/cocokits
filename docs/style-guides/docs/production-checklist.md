# Production checklist

Purpose: the public site is production-ready at any time. Every job that touches the site or a page keeps these true. Why: [tooling](../../why/tooling.md#public-site-always-production-ready).

The checks run with the targets in [targets.md](../workspace/targets.md) (`docs:build`, `docs:links`, `docs:lighthouse`, `docs-e2e:e2e`). Missing checks: [index](./index.md#the-docs-in-every-job-rule). Reviewers apply this list in the docs and UI reviews ([reviewing-docs-site](../../../.claude/skills/reviewing-docs-site/SKILL.md), [reviewing-ui](../../../.claude/skills/reviewing-ui/SKILL.md)).

| Item | Rule | In Astro | Checked by |
|---|---|---|---|
| Meta title | Every page has a unique `<title>`, 60 characters or fewer | One layout sets it from the page frontmatter `title`; the build fails when a page has none | Build-time check over the built HTML |
| Meta description | Every page has a unique description, 160 characters or fewer | The layout sets `<meta name="description">` from frontmatter `description` | Same build-time check |
| Sitemap | `sitemap.xml` lists every public page | The Astro sitemap integration with the production `site` URL set in the config | Compare the sitemap with the list of built pages |
| Robots | `robots.txt` exists and points at the sitemap | A generated route (`robots.txt.ts`) that reads the same `site` URL | Fetch the built file |
| Alt text | Every image has `alt`; decorative images use `alt=""` | The image component requires `alt` in its props, so a missing value is a type error | Type check; scan the built HTML for `<img>` without `alt` |
| Image weight | Images use modern formats, are sized to their display size and stay under the agreed per-image budget | Astro's image component builds resized, compressed variants with width and height | Size check over `dist` against the budget |
| Page speed | Largest Contentful Paint, Cumulative Layout Shift and Interaction to Next Paint stay inside the budget on the component page | Static HTML; ship no JavaScript by default; hydrate only the switchers and the player, lazily; reserve the iframe height so the layout does not shift; lazy-load iframes below the fold | Lighthouse run on the built site against the budget |
| Mobile | Viewport meta, no horizontal scroll at 360px width, tap targets large enough, readable base font size | Layout sets the viewport meta; CSS uses relative units and wrapping tables | Screenshots at phone width ([reviewing-ui](../../../.claude/skills/reviewing-ui/SKILL.md)); Lighthouse mobile run |
| Links | No broken internal or external links | Internal links are built from the content collection ids, not typed paths | Link checker over the built output; external links checked on request, not on every build |
| Canonical | Every page has one canonical URL | The layout builds it from the `site` URL and the page path | Build-time check over the built HTML |
| Open Graph | Title, description, URL and image tags on every page | One head component writes them from the same frontmatter | Build-time check over the built HTML |
| Tab order | Skip link, header, nav, main, in that order in the document | The layout renders them in that order and the grid places them | Build-time check over the built HTML; the order of real Tab presses: `docs-e2e:e2e` ([targets.md](../workspace/targets.md#docs-targets)) |
| 404 | An unknown path shows a 404 page with a link home | `src/pages/404.astro` | Open an unknown path on the built site |
| Console | No errors or warnings in the browser console | Preview apps report through the event bridge, not `console` | Load each page and read the console messages |
| Clean build | The site builds from a clean checkout, at any time | Install and build only through the Nx pipeline ([site-architecture.md](./site-architecture.md)); no step depends on files outside git | `pnpm install` and `pnpm nx build docs` on a fresh clone or worktree |

- A new page without a title and description fails the build rather than shipping.
- A page that cannot pass an item is not published; remove it from the collection instead of lowering the rule.
- Third-party scripts are not added to the site without a security review ([reviewing-security](../../../.claude/skills/reviewing-security/SKILL.md)).
- The budgets (image size, Core Web Vitals thresholds) are set once in the docs config. Changing one is a rule change and follows the why-file process ([AGENTS.md](../../../AGENTS.md)).

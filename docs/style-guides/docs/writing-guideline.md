# Writing guideline

Purpose: how documentation prose is written. TSDoc rules on public API (what needs a block, summaries, tags, per framework) are in [api-extraction.md](./api-extraction.md#tsdoc-rules-all-frameworks); the framework specifics are in [angular](../angular/docs-and-stories.md), [react](../react/docs-and-stories.md) and [vue](../vue/docs-and-stories.md).

## Prose style

- **Audience:** a developer who knows their framework but not CocoKits.
- **Short sentences, active voice, present tense.** "Focus moves with the arrow keys", not "Focus will be moved ...".
- **One idea per paragraph.** Use a list or table for three or more parallel items.
- **Name things exactly as in code:** part names, attributes (`data-selected`), props. Code in backticks.
- **Describe what the reader sees.** The site shows every component with the selected theme, so a page or TSDoc never calls it "unstyled" or "headless". Those words name the base layer ([glossary](../../glossary.md)); use them only where the text compares the base layer with a theme.
- **Framework-neutral prose.** When behaviour differs per framework, say so once.
- **No marketing words** ("powerful", "seamless", "simply", "just").
- **Accessibility is part of every example:** examples have accessible names; the text never suggests removing focus outlines or roles.
- **Examples are illustrative.** Name a component only as an example of a rule; never describe a component's behaviour that is not implemented ([architecture.md](../../architecture.md)).
- **Links:** to the APG pattern and to related guides; do not link source files in user-facing text.
- **No versions** of frameworks or tools in prose. Why: [tooling](../../why/tooling.md).

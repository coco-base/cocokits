# Component pages

Purpose: the one `.mdx` page per component, what is generated and what you write.

A component has one folder, `apps/docs/src/content/components/<component>/`, with `overview.mdx` and an optional `api.mdx` and `styling.mdx`, and three tabs on three routes: Overview (`/components/<component>/`), API (`/components/<component>/api/`) and Styling (`/components/<component>/styling/`). Prose only; everything that can be generated is inserted with docs components, and the API and Styling routes are generated from the extracted data. Updating the page in every job: [index.md](./index.md). There is no page generator; write the files by hand.

The tabs are a `nav` of links with `aria-current="page"` on the open one: they are separate pages, so there is no `tablist` and no arrow-key handling. The API and Styling pages take their title and description from the Overview frontmatter (`<title> API`, `<title> styling`).

## Docs components

How these components are built (parts, stores, presets): [site-architecture.md](./site-architecture.md#docs-app-components).

| Component | Renders | Source |
|---|---|---|
| `<Hero />` | The compiled `playground` story in the selected framework and theme. For a theme that does not include the component, the notice "<Theme> does not include <Component>." ([A theme without the component](#a-theme-without-the-component)) | The story compiler, the preview app and `ThemeConfig.components` |
| `<Story id="..." />` | One story: live preview, controls, source tab | Compiled stories |
| `<Stories />` | Every story except the playground, in compiled order, the "Configurations" `h2` first, then each as `<Story />`. The `h2`, each story and its contents entry hide while the shown theme has no story for them (`data-themes`) | Compiled stories |
| `<Apg />` | One line at the end of Accessibility linking the WAI-ARIA pattern; nothing when the meta has none | `ComponentMeta.apg` |
| `<Scenario id="..." />` | Replayable scenario with step list; used only when the site has a scenario player | Scenario file |
| `<ApiReference />` | In this order: the Import block (the `@cocokits/*` import lines of the playground code, with Copy); Usage, the `api.mdx` note and the code skeleton of all parts with their classes (one line per part selector of the selected framework, so one per authoring shape for compound components); per part of the selected framework one table of its inputs and outputs, where the theme options that style the part are rows of the same table with a "theme" badge and every row has the id `prop-<part>-<name>`, then, when the part has content slots, a Slots table of the slot name, the Angular selector (only when a slot has one) and the description (rows have the id `slot-<part>-<name>`; a slot with the semantic id `none` has no row); last Forms, the form contract, only when the meta has one (the API route) | `ApiDoc`, anatomy, `ComponentMeta.form`, `ThemeConfig` and the playground story |
| `<AnatomyExplorer />` | The Styling route's part explorer: the playground story in a preview, the parts as buttons, and for the chosen part its class, element, `data-*` and a markup sample; the preview outlines the part (`highlightPart`), also in an overlay's content (the playground is rendered with `defaultOpen: true` when it has that arg) | Anatomy, `ApiDoc`, `ComponentMeta`, `ThemeConfig` |
| `<DataAttributes />` | The "State" table (`data-*` of the machine) and the "Theme options" table (the selected theme's options) with the columns Attribute, Part, Values, Default, Set when | `ComponentMeta` and `ThemeConfig` |
| `<Keyboard />` | The `h3` Keyboard with one table (Key, When, Action) for every component, compound ones included: When names the context, so there is never one table per context | `ComponentMeta.keyboard` |
| `<Classes />` | "Parts & classes": part, class, description | Anatomy |
| `<CustomProperties />` | The "Custom properties (<theme>)" table, one section per theme that documents some for the component: property, what it is set on, default, effect, and a sample per framework that sets them inline. Written by the Styling route, not in the MDX | The theme's `docs/css.md` (`## Custom properties`, and a group under another heading: an `Applies to:` line, the table and one code fence per framework; the site renders the file and keeps no copy) |

## Story blocks

The Hero and every story are blocks with a stage (the preview iframe), a code panel with a Copy button and, when the story has args, a controls panel. Two tool groups sit at the top right of the stage (background, colour mode and full screen; the controls toggle when the block has a controls panel) and the code tool at its bottom left (`aria-pressed` on the panel toggles; a hidden panel keeps its state). The background tool switches between dots and a plain stage. The colour-mode tool (when the theme links a mode axis to a colour scheme) overrides the preview's colour mode for this block only, its icon always shows the mode that is applied (a moon for dark, a sun for light), and a later change of the page's colour mode sets every block of the selected theme again (a block of another theme catches up when its theme is selected). A block starts as its preset says: the Hero uses `PLAYGROUND` (code panel open, preview loaded at once) and every story uses `STORY` (code panel closed, preview loaded when it comes near the viewport); a controls panel starts open. Full screen is a native modal `<dialog>` labelled by the story title: focus starts on its close button, Tab cycles inside it (the preview document included), Escape or the button closes it, and focus returns to the full-screen button. The code panel lists the story's files for the selected framework.

## A theme without the component

Which themes include a component: [theme-config](../themes/theme-config.md). While a theme that does not include the component is selected, the page shows the notice "<Theme> does not include <Component>." in place of the Hero, hides the anatomy preview, and keeps the API reference and the State table. The theme radios and the nav entry do not change. The rule lives in `apps/docs/src/lib/theme-notice.ts`.

## Template (fixed section order)

`overview.mdx`:

```mdx
---
title: Tabs
description: One-sentence summary of what the component does.
status: beta
---

<Hero />

## When to use
<Stories />
## Accessibility
<Apg />
<Keyboard />
```

The Overview sections are When to use, Configurations and Accessibility, in that order; Accessibility ends with the APG line and the `h3` Keyboard. The APG URL has one owner, `ComponentMeta.apg`, never the frontmatter.

`api.mdx` (optional) holds a short note and no frontmatter. The API route renders `<ApiReference />`: Import, Usage (the `api.mdx` note, then the skeleton), one `h2` per part, then Forms. A component without `api.mdx` still gets Usage with the skeleton.

`styling.mdx` (optional) holds a short note and no frontmatter. The Styling route renders it, then the Anatomy section (`<AnatomyExplorer />`), `<Classes />`, `<DataAttributes />` and, for a component whose theme documents custom properties (the Badge and the BadgeContainer in cocokits), `<CustomProperties />`. Anatomy lives only on the Styling tab.

`title` (60 characters or fewer) and `description` (160 or fewer) become the page's meta title and description ([production-checklist.md](./production-checklist.md)). The page content above is illustrative; sections and stories follow the component's approved spec. Which stories exist: [stories-and-scenarios.md](./stories-and-scenarios.md).

## What you write per section

| Section | Write | Never write |
|---|---|---|
| Frontmatter | `title`, one-sentence `description`, `status` | `apg` (it comes from `ComponentMeta.apg`) |
| When to use | When to use it and the alternative | Feature lists |
| Configurations | `<Stories />` (what it renders: [Docs components](#docs-components)). `<Story id="..." />` places a single story elsewhere. Optional `<Scenario />` | Code fences with example code |
| Accessibility | What the tables cannot say: labelling requirement, screen-reader notes, known issues. Overlays: where focus goes on open, that it returns to the trigger on close, Tab order after the content (or trapped in a dialog). End with `<Apg />` and `<Keyboard />` | A keyboard table, a pasted APG link, the form contract |
| Styling (`styling.mdx`) | Nothing, or a short note (overlays: `data-side` and `data-align` give the resolved placement) | Class, `data-*`, theme option or custom property tables |
| Usage note (`api.mdx`) | Nothing, or one sentence when the authoring shape differs per framework. Overlay components: one sentence that the content part renders in the overlay container, so ancestors' `overflow: hidden` and transforms never clip it | A hand-written part list; a skeleton implying the content stays next to the trigger |
| API | Nothing else: Import, the skeleton, the part tables and Forms are generated | A props, events or slots table; the form contract (it comes from `ComponentMeta.form`) |

- Keep the section order. Do not add a props table or pasted code.
- Prose follows [writing-guideline.md](./writing-guideline.md).

```mdx
<!-- Incorrect: hand-written table and pasted code that drifts -->
| Prop | Type | Default |
|---|---|---|
| orientation | 'horizontal' \| 'vertical' | 'horizontal' |

<!-- Correct: the API route renders <ApiReference /> from the extracted data -->
<Stories />
```

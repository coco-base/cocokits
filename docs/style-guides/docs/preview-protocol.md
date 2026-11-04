# Preview protocol

Purpose: the typed postMessage contract between `apps/docs` and a preview app. Types, the version constant and the validator live in the private `@cocokits/docs-shared` (`PreviewMessage`, `PREVIEW_PROTOCOL_VERSION`, `parsePreviewMessage`). The preview kit that implements the receiving side once for every preview app lives in the same package; its inventory and the app/kit split are in [site-architecture](./site-architecture.md).

## Envelope

Every message is `{ v, source, id?, type, ...payload }`:

| Field | Meaning |
|---|---|
| `v` | Protocol version (integer). A receiver rejects a message whose `v` differs from its own with an `error { code: 'version' }` reply and never guesses. Bumped whenever a message type or a payload changes; version 2 added `highlightPart`, version 3 the `colorScheme` of `render` and `setModes`, version 4 the `tone` of `highlightPart` in place of its `color`. |
| `source` | `'cck-docs'` (docs to preview) or `'cck-preview'` (preview to docs) |
| `id` | Request id, set by the sender on every docs to preview message. Every reply (`rendered`, `applied`, `scenarioStep`, `scenarioDone`, `error`) carries the same `id`, so the page can match replies and time out. |

## Messages

| Direction | Message | Meaning |
|---|---|---|
| preview to docs | `ready { framework, stories: string[] }` | Booted; `stories` lists the stories of the generated `storyRegistry` as `<component>/<id>`, sorted; docs answers with a full `render` |
| | `rendered { id }` | The `render` with that id is on screen. The preview sends it after the framework has settled and overlays have attached (React: commit and layout effects; Vue: `nextTick`; Angular: `whenStable`, then `afterNextRender`), and after one animation frame (at most 100 ms: a hidden frame runs none), so a portaled overlay's content is in the document when the page reads `rendered` |
| | `applied { id }` | The `setArgs`, `setTheme`, `setModes` or `highlightPart` with that id took effect |
| | `resize { height }` | Content height changed (ResizeObserver on the root) |
| | `event { componentName, name, payload }` | A semantic event of a component fired. Sent by the run module's `report` (a call the compiler's `addReporting` pass printed into the event's handler), never by the inline code. `name` is the event part of the semantic id (`checkedChange`); `payload` is `{ value, reason, instanceLabel }`. The Events panel shows it and clears on every `render` |
| | `scenarioStep { id, index, status, message? }` | Progress of a running scenario |
| | `scenarioDone { id, status }` | The scenario finished or failed |
| | `error { id?, code, message }` | Rejected request (`code: 'version' \| 'origin' \| 'unknown-story' \| 'invalid-args' \| 'step-failed' \| 'runtime'`) or an uncaught error (no `id`) |
| docs to preview | `render { id, componentName, story, args, themeName, modes, colorScheme, dir }` | Full (re)mount of `storyRegistry[themeName][componentName][story]`, wrapped in the direction provider of the framework's core with `dir` (the standalone page's `?dir=` too), so overlay content reads the direction of the page; supersedes anything queued while loading. `modes` is `Record<attrName, value>`, one entry per mode axis, and `colorScheme` (`'light' \| 'dark'`) is the scheme of the block that holds the preview ([Modes](#modes)) |
| | `setArgs { id, args }` | Live args changed; update in place |
| | `setTheme { id, themeName }` | Swap the theme stylesheet and remount the story from `storyRegistry[themeName]`, keeping the current args. A story that is missing in that theme replies `error { code: 'unknown-story' }` |
| | `setModes { id, modes, colorScheme }` | Set the mode of each listed axis and the scheme: the preview sets `data-<attrName>` to its value on its root and `color-scheme` on its document to `colorScheme`, and replies `applied`. A `colorScheme` other than `light` or `dark` fails the parser. An `attrName` that is not a page collection of the selected theme's `modeCollections`, or a value that is not one of its modes, gets `error { code: 'invalid-args' }` |
| | `highlightPart { id, className, label, tone }` | Draw the anatomy highlight of the Styling tab: the preview outlines every element of its document with `className`, content that an overlay portals out of the story root included, with a dashed border in the colour of `tone` and a label chip with `label`, using preview-only markup that is hidden from assistive technology and drawn in a `popover="manual"` layer that is shown again on every draw, so it sits above an open popover or dialog, and replies `applied`. `className: null` removes the highlight and needs no `label` or `tone`. A `className` that does not match `[a-z0-9_-]+`, a `tone` that is not an integer from 1 to 5 (the preview owns one colour per tone), a class that the anatomy of the component on screen does not declare, or a part before any story is rendered gets `error { code: 'invalid-args' }`; the anatomy is read from the component's docs data that the preview build copies next to the page (`components/<name>.json`), and a failed read gets `error { code: 'runtime' }` naming the HTTP status. From a request with a class until `null`, the story sits in the middle of the frame, whether or not the outline can be drawn |
| | `runScenario { id, scenario }` | Replay the scenario with that id ([scenarios.md](./scenarios.md)). The message is typed; a preview app without a scenario player answers `error { code: 'unknown-story' }` |

Flow: the page sets `iframe.src`, the preview posts `ready`, the page sends `render`, the preview replies `rendered`. Later changes send `setArgs`, `setTheme` or `setModes` and wait for `applied`. Switching framework swaps the iframe document and starts again at `ready`. A request without a reply within the timeout is shown as an error in the page, never retried silently.

## Live and initial args

Story args come from the compiled `StoryMeta.args` of the playground and of a custom story that declares `args` ([playground-and-snippets.md](./playground-and-snippets.md), [Args](./story-language.md#args)), and `StoryArg.initial` says which are initial:

- **Live args** (props such as `open`, `disabled`, `orientation`) are applied in place through `setArgs`. The story forwards them as inputs or props, so the component re-renders without losing state it does not own. A model (`checked`, `value`) is never a live arg: its control is the initial arg `default<Model>` ([playground-and-snippets.md](./playground-and-snippets.md#controls)).
- **Initial args** (`default*` props such as `defaultValue`, `defaultChecked`, `defaultOpen`) are read once when the component mounts. A change to an initial arg sends `render` again, which remounts the story. The page says so next to the control ("resets the example"). The anatomy explorer renders a component whose playground has `defaultOpen` with `defaultOpen: true`, so the overlay's parts are on screen to outline.

The compiler decides by name: an arg whose name starts with `default` and an upper-case letter is initial, in a custom story as in the playground. The preview app reads `StoryArg.initial` from the registry; a story has no `initialArgs`. A custom story binds its args like the playground (Angular `input()`, React props, Vue props), so `setArgs` updates its inputs in place. An emptied number field: [playground-and-snippets.md](./playground-and-snippets.md#the-playground-snippet).

## Modes

A theme owns its mode scheme: its modes index `modeCollections`, which the theme package exports and its `docs-data` target copies into `theme.json`, lists every collection with the attribute that selects a mode. `attrName` is that attribute name without `data-`, as in `ThemeOption.attrName`, and `modes` is keyed by it. The protocol assumes no prefix, attribute naming or collection structure, so a theme with other collections needs no change in the protocol or a preview app, only its `DOCS_THEMES` entry in the docs site. Which collections the page offers is the docs site's choice ([site-architecture.md](./site-architecture.md#docs-data)).

- Both sides accept only an `attrName` that matches `^[a-z0-9-]+$` and is a page collection (one without `componentName`) of the selected theme's `modeCollections`. The parser checks the pattern; the index check is the receiver's.
- A change to one collection sends `setModes` with that collection (or all of them); collections that are not listed keep their value. The docs page sends it only to the previews of the selected theme; the others get the current modes when their theme is shown ([site-architecture.md](./site-architecture.md#docs-data)).
- The standalone query carries one `mode.<attrName>=<value>` pair per page collection and `colorScheme=light|dark` (default `light`). `colorScheme` sets only the `color-scheme` of the document (canvas, text and native controls); the theme's look comes from the `mode.*` pairs alone. A dark example therefore names both: for CocoKits `mode.cck-color-mode=dark&colorScheme=dark`. With `colorScheme=dark` alone the parts keep their light tokens on a dark canvas.
- The preview holds no colour-scheme data and never reads a scheme from theme data. The docs page derives each block's scheme from its docs config (which mode of the theme is light or dark) and the block's override, and sends it with the modes. The preview sets it as the `color-scheme` of its document, so plain story text and native controls follow the mode, and its root and body draw no background. The docs page gives the iframe element the same `color-scheme` once the preview applied it (the default one before the first render and after a reload, as a new preview document has), so the browser draws no backdrop and the docs stage and its background tool show around the story.

## Origins and standalone mode

- `apps/docs/src/config.ts` lists the allowed preview origins per environment. The preview kit lists the allowed docs origins in `packages/docs-shared/src/preview/config.ts`: a production build is served by the docs site, so its docs origin is its own origin, and a development build accepts the one loopback `http` origin that its iframe URL names (`?docs=<origin>`, written by the docs config, which knows its port), or the default dev origin. `document.referrer` is never used to decide trust, and a target origin is never `*`.
- The page accepts a message only if `event.source === iframe.contentWindow`, `event.origin` is in its allowed list, `source === 'cck-preview'` and `v` matches.
- A preview accepts a message only if `event.source === window.parent`, `event.origin` is in its allowed list, `source === 'cck-docs'` and `v` matches. Replies go to the `event.origin` of the accepted request.
- **Standalone mode:** only when the preview is the top-level window (`window.parent === window`), it reads `?component=&story=&theme=&mode.<attrName>=<value>&colorScheme=&dir=` and the args from `arg.<name>=<value>` pairs, renders, and shows its own minimal controls bar. It posts nothing and takes no message. A preview in a frame shows only the story and never shows the bar or a standalone message, however late its first `render` comes.

## Rules

- Validate every incoming message with `parsePreviewMessage(data, from)` before handling it (`from` is the sender the receiver expects). A failed parse says why: `source` is dropped, `version` gets `error { code: 'version' }` and any other `shape` error gets `error { code: 'invalid-args' }`, both only when the message has an `id`.
- Update in place on `setArgs`; never reload the iframe or remount for a live arg. `setTheme` remounts, because the theme layer is part of the story module; the stylesheet swap stays. React keeps args in state; Angular creates the story component once and calls `setInput()` on it; Vue updates a reactive args object. Initial args remount through `render`.
- Report component events through the event bridge (`event`, sent by the run module's `report`: the preview session gives it the app's `post`), never `console.log`. Only the semantic events of a component are reported (an `ApiDoc` event whose semantic id is not `none`), so the three frameworks give the same rows; the DOM event is never posted.
- Do not add a message type or change a payload without bumping `PREVIEW_PROTOCOL_VERSION`, adding the type to `@cocokits/docs-shared` and handling it in every preview app.
- Security review checks the origin rules on every change here ([reviewing-security](../../../.claude/skills/reviewing-security/SKILL.md)).

# Stories and scenarios

Purpose: where story files live, which stories the compiler generates, how a story config and a theme change them, and when a scenario is required. The story language, the handler rules and the scenarios are in the three files below.

A story is written once, never per framework. The story compiler (`tools/story-compiler`) prints it as native Angular, React and Vue code, once per theme, from the story sources, the extracted `ApiDoc` and each theme's `ThemeConfig`. Why: [tooling](../../why/tooling.md#stories-compiled-from-one-source). The compiler's options and layout of the output: [its README](../../../tools/story-compiler/README.md). The `stories` and `typings` targets are in [targets.md](../workspace/targets.md).

The rest of the story rules is in three files: [story-language.md](./story-language.md) (what a custom story may contain, args, state and handlers, catalog types and the error codes), [interaction-portability.md](./interaction-portability.md) (when an event handler is accepted) and [scenarios.md](./scenarios.md) (how a scenario is written, checked and run).

## Files

```
packages/docs-stories/src/button/
  stories.config.ts           optional: sample, skip, hideControls, order (.tsx when sample holds markup)
  link.story.tsx              shared story
  cocokits/                   theme folder
    stories.config.ts         optional: skip, hideControls, order
    <id>.story.tsx            theme story
  <id>.scenario.ts            a scenario ([scenarios.md](./scenarios.md)), only where the scenario rule below requires one
apps/preview-<fw>/src/generated/stories/<theme>/<component>/<id>.*     generated, never edited
```

A story whose id starts with `e2e-` is a fixture for the browser tests, not an example. It is compiled into the preview apps like any story, and no docs page lists it (`E2E_STORY_PREFIX` in `apps/docs/src/config.ts`); a test opens it standalone at `/preview/<framework>/?component=<component>&story=<id>&theme=<theme>` ([standalone mode](./preview-protocol.md#origins-and-standalone-mode)). It is where a story may count the events it receives, because no reader sees it.

The component is the folder name and the id is the file name, both in kebab case. A subfolder must be named after a theme the compiler knows. Which theme a story is for: [Which theme a story belongs to](#which-theme-a-story-belongs-to). Generated files start with a `GENERATED` header: fix the source and re-run `stories`, never edit them.

## Which stories a page needs

The compiler generates the playground, one story per theme option (every value side by side), one per boolean prop and one per string-union prop that is not a theme option. Props of other types, models, events, slots, methods and members with `@cckSemantic none` get no story.

Everything else is a custom story: host variants (a link), examples that need an accessible name, forms (validation and reset), and for overlay components `in-clipped-container` (trigger inside `overflow: hidden` and `transform`, followed by a focusable element) and `inside-modal-dialog` (trigger inside an open modal `<dialog>`) ([architecture §2](../../architecture.md#2-layers-and-packages), [why/overlays.md](../../why/overlays.md)). Component names here are illustrative; the stories of a real component follow its approved spec.

## Named slots

A component with named slots (its `ApiDoc` lists slots besides `default`, [api-extraction.md](./api-extraction.md)) takes the content of each as markup in an attribute of the slot's name. The children are the default slot. The slots can be written in any order:

```tsx
<FormField label={<Label for="email">Email address</Label>} hint={<Hint id="email-hint">Help</Hint>}>
  <input id="email" type="email" aria-describedby="email-hint" />
</FormField>
```

- **Printing.** The three frameworks print the slots in the order of the `ApiDoc`, whatever order the story wrote them in. React keeps `label={…}`, after the other props, in the [layout of a markup attribute](./playground-and-snippets.md#layout-of-printed-markup); markup that is not one element (text, several nodes) is wrapped in a fragment. Vue prints `<template #label>…</template>`, with the default content in its place. Angular prints the content as plain children, because its `ng-content select` projects by selector. A slot with no nodes (`hint={<></>}`) prints nothing in any of them.
- **Checks.** Slot content is part of the story: its components are imported, and it is checked like a story body (names, attributes, values, `value-not-in-theme`).
- **Why `slot-content-mismatch`.** Angular projects by selector, React and Vue by the slot name, so content in the wrong slot would render in different places. The [error table](./story-language.md#errors) has the cases.
- **Typings.** Each named slot is an optional `JSX.Element` prop of the component.

## Several components in one story

A story may use every component that has an `ApiDoc` for the framework, inside the folder of any component, in the story files, in a config's `sample` markup and in a theme folder.

- Each component node is checked against its own component: its props, its theme options in the theme being compiled, its `as` hosts and its native attributes.
- A theme that lists a component with no options (`{}`) only styles it. Its imports come from the base package (`@cocokits/<framework>/<name>`), and Angular has no `Cck<Name>Theme` directive for it.
- The printed file imports each used component once. Angular: `Cck<Name>Imports` from `@cocokits/angular/<name>` and `Cck<Name>Theme` from `@cocokits/theme-<theme>-angular`. React and Vue: `<Name>` from `@cocokits/theme-<theme>-<framework>`. One statement per module, modules and names sorted.
- A prop that takes a string or a number (`string | number`) is set by either literal and has no playground control. A prop whose type is another name (an alias of something other than string literals, or an object) or a list cannot be set by a literal.

## Which theme a story belongs to

A story belongs to a theme by its folder, never implicitly. Which components a theme includes: [theme-config](../themes/theme-config.md). What a story may use from its theme, and the error when it does not: the error table in [Errors](./story-language.md#errors).

- **Shared** (`<component>/<id>.story.tsx`): compiled for every theme that includes the folder's component.
- **Theme** (`<component>/<theme>/<id>.story.tsx`): compiled for that theme only. A story that shows a look, a component or a theme value only that theme has lives here.
- **Component level:** a theme that does not include the folder's component gets no stories for it and no error.

## Story config

`stories.config.ts` configures the generated stories of a component. It calls `defineStories` with an object literal of literals; the one exception is story markup in `sample` (under `children` or a named slot's key), which needs a `stories.config.tsx`.

```ts
// packages/docs-stories/src/button/stories.config.ts
import { defineStories } from '@cocokits/shared';

export default defineStories({ sample: { children: 'Save changes' }, skip: ['disabled'] });
```

A component that renders its own content has no child to give. The Badge shows its `content` prop:

```ts
// packages/docs-stories/src/badge/stories.config.ts
export default defineStories({ sample: { content: 5, children: false } });
```

A component that wraps others takes markup as its `children`, in a `stories.config.tsx`. The BadgeContainer pins a Badge to a Button; its playground and its generated stories print the same markup (Angular: `<div cckBadgeContainer>` and `<span cckBadge>`, the default elements from the metas):

```tsx
// packages/docs-stories/src/badge-container/stories.config.tsx
export default defineStories({
  sample: {
    children: (
      <>
        <Button aria-label="Notifications, 2 new">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z" stroke="currentColor" stroke-width="2" />
          </svg>
        </Button>
        <Badge content={2} />
      </>
    ),
  },
});
```

| Key | Meaning |
|---|---|
| `sample` | Component config only. `children` is the content: text, story markup (components and elements, as in a story body; the file must be `stories.config.tsx`) or `false` for a component that renders its own content, such as a Badge (no child is generated, and `true` is an error). The key of a [named slot](#named-slots) takes story markup the same way. Markup is checked like a story body, and every generated story of the component prints it. Every other key is a literal prop or attribute that each generated instance gets, checked like an attribute of a story (a wrong key or value is an error at the config). Required `children` when the component has a default slot, so a component that renders its own content writes `children: false`. A folder has one config file, `.ts` or `.tsx` |
| `height` | A positive whole number of pixels: the reserved height of every generated story of the component (an overlay playground needs room in the frame). The docs frame keeps it as a minimum while it follows the height the preview reports, because the preview reports the story root and an overlay's content is outside it. A custom story keeps the `height` of its own `defineStory`; a theme config may set it too, and then wins |
| `skip` | Story ids to leave out. `playground` cannot be skipped |
| `hideControls` | Prop and theme option names that get no playground control |
| `order` | Ids that come first, in this order. A theme's `order`, even an empty list, replaces the component's |

A theme config (`<component>/<theme>/stories.config.ts`) may set `height`, `skip`, `hideControls` and `order` only. A story exists in every framework: there is no per-framework skip.

## Generated stories

Generated per component and theme:

| Source | Id | Content | Title | Description |
|---|---|---|---|---|
| Always | `playground` | One instance with the sample (the sample markup is its content). Every prop control and every theme option is an arg | `Playground` | "Change the controls to try every option." |
| `ThemeConfig` option | The option key | One instance per value, side by side; text is the raw value (`outline`, `sm`) | The key in sentence case | The option's `description` |
| `ApiDoc` `boolean` prop | The prop name | One instance with the prop set, with the sample | The key in sentence case | The member's `description` |
| `ApiDoc` string-literal union prop, not a theme option | The prop name | One instance per value, text is the value | The key in sentence case | The member's `description` |

- With a markup sample or `children: false`, every instance of a theme option or union story prints the sample content, not the value as text.
- **Names of the copies.** A story that repeats the sample once per value gives every literal `aria-label` in each copy the suffix `, <value>` (`Project, brand`), so no two landmarks, tablists or contents of one story share a name (axe `landmark-unique`). There is no config field for it; a story that wrote its own copies names them itself.
- **Compound components.** The `sample` of a compound component is markup that holds the whole compound (the content of its root). A generated story or a playground arg for a member of a part other than the root (a prop, a `default<Model>` or a theme option of `Popover.Content`) is set on the one part of that name in the sample; the ids and titles are the member's (`side`, `Side`). A name that two parts share (`value` on a trigger and on a panel) gets no story and no control. A member whose part the sample holds zero times or more than once is `sample-part-mismatch` at the config; to leave such a member out (the options of a Select, which the sample repeats), hide its control and skip its story: `hideControls: ['value', 'disabled'], skip: ['disabled']`. A list model has no control ([List models](./story-language.md#list-models)).
- Ids are kebab case and titles are sentence case (`activationMode` gives `activation-mode` and `Activation mode`).
- The playground is the Hero and its controls come from its args, so it can be neither skipped nor replaced. A custom or theme story may declare args of its own ([Args](./story-language.md#args)); its controls come from them.

## Merge rules

Per component and theme:

1. Generated stories first, then the component's custom stories. A custom id equal to a generated id replaces it in place, except `playground`.
2. A theme story ([Which theme a story belongs to](#which-theme-a-story-belongs-to)) replaces an existing id other than `playground`, for that theme only.
3. `skip` is the component's list plus the theme's. `hideControls` is the union of both lists. A theme's `order` replaces the component's, even when it is empty.
4. Default order: `playground`, theme options in `ThemeConfig` order, props in `ApiDoc` order, new custom stories by id, new theme stories by id. Ids listed in `order` come first, in that order.
5. `sample` is per component only.
6. The same set of stories is printed for Angular, React and Vue.

## Content rules

- Use realistic content (labels a user would see); no "Lorem ipsum", no "Tab 1".
- Give every interactive example an accessible name.
- No colours or fonts in story files; the theme does them. A story may style its own native containers with layout rules only ([Story styles](./story-language.md#story-styles)), as `in-clipped-container` does.
- A story may handle the events of the language: `set`, `toggle` and `reset(form)`, and a component's change event with its value ([State and handlers](./story-language.md#state-and-handlers)). The component events of a story reach the Events panel of its Workbench through the event bridge, with no authoring: the compiler reports every semantic event of each component instance in the run module ([Playground and snippets](./playground-and-snippets.md#the-code-panel)).

## When a story needs a scenario

- Keyboard rows in the spec become tests; write a scenario when a sequence matters (open, navigate, select, close) or the docs should show it. A component with keyboard behaviour beyond its native element (composite widgets such as tabs, menus and listboxes) has at least one scenario for its main keyboard flow. A component whose keys are all native, such as Button, needs none.
- Overlay components also get `outside-click`, `focus-return`, `tab-order`, `nested-overlays` and `inside-modal-dialog` scenarios.
- A story whose point is an interaction with a settled result (a reset, select all, a radio group) may have a scenario; a story that only shows markup needs none. How it is written: [scenarios.md](./scenarios.md).

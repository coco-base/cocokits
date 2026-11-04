# Why: themes

Rules: [Theme config](../style-guides/themes/theme-config.md). This file explains them and states no rules.

## The base has no visual-only input

Rules: [Theme configuration](../architecture.md#4-theme-configuration-size-variant-color-theme-only-options).

**Rejected alternatives.**
- *Visual props on the base (`radius`, `offset`, `dot`).* They exist only to place or draw the part, which is the theme's job, and they would repeat in every framework adapter and every machine.
- *Theme options for every visual setting.* A setting the author varies per instance and that the theme can read as a CSS length (an offset, a corner radius) is simpler as a custom property than as a typed option in three frameworks.

**Why.**
- The base layer owns behaviour, so a prop with a visual effect only moves theme work into the base.
- A documented custom property keeps the contract in the theme: the theme reads it with a fallback, never defines it, and lists it in its `css.md`, so a theme that ignores it still works.
- Hiding that the base promises is native (`hidden`), so the unstyled base needs no theme rule to hide.
- The one exception is the gap of an overlay: the positioning module needs a number to compute coordinates, but the value is a look. The theme sets `--side-offset` and the base only reads it, so no machine prop, input or output exists. React and Vue overlay content nevertheless take `sideOffset` and `alignOffset` as numbers, because Radix, Base UI and Reka expose them and an author moving from those libraries expects them ([architecture §10](../architecture.md#10-simplicity-and-reuse), the reference API rule); the number then replaces the theme's value for that content. Angular takes the theme only: its references (Material, CDK) have no such input on the content, so one gap stays in the theme.

## Executable schema, part attributes from the theme runtime, separate packages

**Rejected alternatives.**
- *One theme package with `/angular`, `/react`, `/vue` subpaths.* One package cannot be an Angular Package Format library and a React or Vue library at the same time without making every framework a peer dependency of every user.

**Why.**
- Base parts read their attributes from the framework-core theme runtime. That reaches parts a component renders internally.
- Machines take no theme input, so the behaviour layer never depends on a theme.

## A component's own default from a shared collection

**Rejected alternatives.**
- *Always the collection's default (`themeActiveColorDefaultMode`).* The Badge's default colour is `contrast` (old CocoKits), while the Button's is `brand`. One shared default would change a component's look to suit the collection.

**Why.** A default is a design decision of the component, so the component picks it. The option's `default` is already typed as one of its `values`; the named constant typed with the generated mode type adds a place for the choice that has a name and a comment, and fails at the declaration, in terms of the collection's modes, when the mode is renamed or removed.

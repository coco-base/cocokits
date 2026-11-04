# Why: anatomy

Rules: [Anatomy and the styling contract](../architecture.md#3-anatomy-and-the-styling-contract). This file explains them and states no rules.

## A typed anatomy object with parts only

**Rejected alternatives.**
- *Zag's `createAnatomy('tabs').parts(...)` builder.* It carries the same information with no descriptions, and its API is unfamiliar for no gain. Nothing depends on that shape.

**Why.**
- The old repo already had a richer object form, `LayoutClassNamesConfig`, with a human name and a description per element. Docs and theme authors need those anyway.
- One object yields the part classes (`cck-tabs__trigger`), the typed part names for prop getters and theme config keys, the anatomy section of the docs, and the conformance checks.
- State and option entries (`selected`, `unselected`, `disabled`, `alignLeft`, `instantAnimation`) do not belong in it. State is `data-*`, declared in the meta. Options are declared in each theme's `ThemeConfig` (see [styling-contract.md](styling-contract.md)).
- In the old repo each file paired the config with `getXClassNames(props, themeConfig)`. Keeping the anatomy in the machines layer and the theme-aware function in the theme layer stops the base layer depending on `ThemeConfig`.
- The old central `layoutClassNamesConfigRecord` imported every component. If the docs need a list, it is generated at build time.
- One root name (`root`) replaces the mix of `root` and `host`.

**Cost.** A compound component may need more than one block when a part has its own inner elements (`cck-tab` with `cck-tab__label`), because strict BEM does not allow `cck-tabs__trigger__label`.

## `defineAnatomy` returns the object plus `classes`

**Rejected alternatives.**
- *A plain object with the class written in each part.* It repeats the block name in every part.
- *Role and default attributes in each part.* The role depends on props and on the element. A list item is `option` in a listbox and `menuitemradio` in a menu. `role="switch"` is wrong on `<input type="checkbox">`.

**Why.**
- A `const` type parameter means callers never write `as const`. The camelCase to kebab-case conversion happens in one place.
- Role and ARIA are behaviour, rendered by `connect()`. Putting them in the anatomy would create a second source that drifts.

**Why descriptions name no element.** The author may choose the element of a part, so a description says what the part is for. The default element is data in the meta (`defaultElements`).

**Cost.** The expected role and ARIA of each part live in the component meta only as conformance-test expectations. They are never read at runtime.

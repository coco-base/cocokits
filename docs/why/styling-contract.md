# Why: the styling contract

Rules: [Anatomy and the styling contract](../architecture.md#3-anatomy-and-the-styling-contract). This file explains them and states no rules.

## Classes for identity, `data-*` for everything that varies

**Rejected alternatives.**
- *State as `data-*`, theme options as modifier classes.* It splits "things that vary" into two mechanisms with no styling benefit. The line between state and option is blurry: `disabled` is set by the developer but is also state.
- *Everything as classes, no `data-*`.* Classes cannot carry a value, so each value becomes its own class and public name. A popover with `side` and `align` needs 12 classes instead of 2 attributes. ARIA cannot fill the gap: the highlighted item in a listbox is `aria-activedescendant` on the input, not an attribute on the item.
- *State as both attribute and class.* Two contracts for one fact.

**Why.**
- An early design had two contracts for the same information. The old repo shows where that leads: `tabsLayoutClassNamesConfig` has four entries for one value (`alignLeft`, `alignCenter`, `alignRight`, `alignStretch`). `tabLayoutClassNamesConfig` has a `selected` and an `unselected` entry for one boolean.
- One rule anyone can apply: class means identity, `data-*` means everything that varies.
- Values are native (`data-orientation="vertical"`), so class names do not multiply.
- It matches Radix, Base UI, Reka, Bits UI, Ark and Spartan, and Tailwind's `data-[state=open]:` and `data-[size=lg]:` variants.
- Conformance tests can check the same attributes in every framework.
- Attribute and class selectors have the same specificity, so overrides work as before.

**Cost.** A theme option and a base state share one attribute namespace. That is why base names are reserved (see below).

## The base states facts, the theme decides the look

Rules: [Anatomy and the styling contract](../architecture.md#3-anatomy-and-the-styling-contract).

**Rejected alternatives.**
- *`data-dot` on an empty badge.* It bakes one theme's drawing into the base. Another theme may draw an empty badge as a ring, a pulse or nothing.
- *A base prop or input for a look (`radius`, `offset`, `dot`), written as a prefixed variable or an inline style.* The unstyled base stops being unstyled, and a theme cannot change it.

**Why.**
- `data-empty` is true whatever the theme draws, so any theme can style it and the unstyled base stays usable.
- A prefixed CSS variable belongs to the theme that defines the prefix. The base writes only unprefixed variables for measured geometry.
- A theme that wants a setting from the author documents a custom property; the author sets it in CSS, so the base needs no prop for it ([themes](themes.md#the-base-has-no-visual-only-input)).

## No `data-scope` and `data-part`

**Rejected alternatives.**
- *Render both, as Zag and Ark do.* Two identifiers for one fact.

**Why.** Zag renders these attributes because it styles only through data attributes. CocoKits already has fixed classes that do the same job. Keeping both doubles the public API for nothing.

## `data-*` naming

**Why.**
- Presence attributes for booleans, one attribute per fact and no "un-" twins keep one contract per fact. CSS uses `:not([data-selected])` instead of a second attribute.
- A reserved list of base names is needed because theme options and base state share one namespace. With classes, the `--modifier` syntax kept them apart. The `ThemeConfig` type rejects reserved names, so a theme cannot add `data-disabled` with another meaning.
- `data-state` is for mutually exclusive lifecycle states such as `open|closed`. Radix's `data-state="active|inactive"` for independent facts is not used.

## Public API and CSS isolation

**Why.**
- Most customers will not write CSS against our classes. The fixed names mainly let us style components and keep each one isolated. Anything in the DOM still gets used: customers override `.cck-tab__indicator` in their app, and other teams may write themes.
- Content projection puts user content, including other CocoKits components, inside our DOM. A selector like `.cck-tabs [data-selected]` would style a Tabs nested in a tab panel. Leaking is more likely, not less.
- A theme selector depends on the parts and their nesting, so changing the anatomy breaks every customer override and theme: it is a major version with a changeset entry. A part nobody needs yet is still API that must be kept, so a part is added only when a layout needs it.
- A cascade layer or `:where()` lets customer overrides win without specificity fights.

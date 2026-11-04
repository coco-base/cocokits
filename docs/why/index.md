# Why

These files explain the rules in [`docs/architecture.md`](../architecture.md) and the [style guides](../style-guides). They state no rules. Read one when you need the reason behind a rule or want to change it.

| File | Reason it holds |
|---|---|
| [styling-contract.md](styling-contract.md) | Why classes mark identity, `data-*` carries everything that varies, and CSS stays isolated |
| [layers.md](layers.md) | Why the layers and packages are split as they are, and why Zag.js and XState were rejected as machine runtimes |
| [entry-points.md](entry-points.md) | Why root entries by default and subpaths only for a few packages |
| [anatomy.md](anatomy.md) | Why the anatomy is a typed object with parts only |
| [rendered-contract.md](rendered-contract.md) | Why authoring shapes differ per framework while the rendered DOM does not, and why Next.js constraints exist |
| [overlays.md](overlays.md) | Why overlays are portaled and positioning is separate |
| [themes.md](themes.md) | Why the theme schema, part attributes and theme packages look as they do |
| [tooling.md](tooling.md) | Why one generator, extractor output below `dist`, API text only in TSDoc, the React API through the TypeScript checker, lint exceptions in one config file, version-neutral guides, and one pipeline for CI and local runs |
| [forms.md](forms.md) | Why a native text control is the form control itself, why Angular controls use `FormValueControl` with `ngNoCva` and no ControlValueAccessor, why `@angular/forms` is an optional peer, why `aria-invalid` is gated while `data-invalid` is raw, why React hooks read the latest callbacks through a ref until the floor is 19.2, and why a Vue model is a wide prop plus a narrow event instead of `defineModel` |
| [simplicity.md](simplicity.md) | Why reuse, simplicity, the framework's own mechanism and names are checked before and after the build, and why each public API follows its framework's reference library |

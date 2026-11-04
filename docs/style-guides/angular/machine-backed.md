# Using shared framework-free behaviour

What is specific to Angular. The shared rules for parts backed by a machine or cdk module are in [machines](../framework-agnostic/machines.md#parts-backed-by-a-machine-every-framework); the layering and SSR rules are in [architecture](../../architecture.md) (why: [layers](../../why/layers.md)).

- Angular adapter code lives in `@cocokits/angular-core` or the component; it never leaks into `machines` or `cdk`.
- The binding must not bridge state into local signals with an `effect`.
- Moving a component onto shared behaviour must not change its public API: same selectors, inputs, outputs, rendered contract and `index.ts` exports.
- Angular keeps what is Angular-specific: DI registration, slots, forms integration ([forms](./forms.md)) and theme attributes ([theming](./theming.md)). Shared code never sees Angular forms.
- [signals-and-inputs](./signals-and-inputs.md) and [lifecycle-and-ssr](./lifecycle-and-ssr.md) apply unchanged.

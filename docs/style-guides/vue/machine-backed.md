# Parts backed by a machine

Shared rules: [machines](../framework-agnostic/machines.md#parts-backed-by-a-machine-every-framework). Why: [layers](../../why/layers.md).

- The binding lives in `@cocokits/vue-core`; the machine imports no Vue. Machine state is read through the adapter, not copied into a local `ref` and not mirrored with `watch`.
- Theme attributes are added by the part ([theming.md](./theming.md)).

# Parts backed by a machine

Shared rules: [machines](../framework-agnostic/machines.md#parts-backed-by-a-machine-every-framework). Why: [layers](../../why/layers.md).

- The binding lives in `@cocokits/react-core`; the machine imports no React.
- The initial state comes from props, never from measurement ([nextjs-ssr.md](./nextjs-ssr.md)); theme attributes are added by the part ([theming.md](./theming.md)).
- Props typed on the machine are documented once there and re-exported ([docs-and-stories.md](./docs-and-stories.md)).

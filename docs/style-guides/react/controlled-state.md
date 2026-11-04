# Controlled and uncontrolled state

Every stateful prop supports both modes with one source of truth. The cross-framework mapping is in [architecture](../../architecture.md) (props, events and forms contract).

- Naming: `checked`/`defaultChecked`/`onCheckedChange` for booleans, `open`/`defaultOpen`/`onOpenChange` for overlays, otherwise `value`/`defaultValue`/`onValueChange(value, details)`.
- `details` is `ChangeDetails<Reason>` from `@cocokits/shared`: `{ reason, event: Event | null }`. Each component exports its own alias with its reason union.
- State goes through one shared controllable-state hook ([internals.md](./internals.md)). `value === undefined` means uncontrolled; `null` is the controlled "nothing selected" value, typed `T | null`, and is never converted to `undefined` or `''`.
- Call the setter (and so `onXChange`) synchronously from the event handler, only when the value changes. Never from an effect watching state: it fires late, twice in StrictMode, and on mount.
- A controlled parent may reject a change by not updating `value`; the component keeps rendering the old value, and form controls keep the hidden input in sync with it ([forms.md](./forms.md)).
- Do not mirror props into state with an effect. `defaultValue` is read once; switching modes is a development warning.
- The initial state comes from props, never from DOM measurement, so the server snapshot equals the first client snapshot ([nextjs-ssr.md](./nextjs-ssr.md)).

Example (illustrative):

```tsx
const [value, setValue] = useControllableState<string | null, ChangeDetails<'click'>>({
  value: valueProp, defaultValue: defaultValue ?? null, onChange: onValueChange,
});
// in a handler:
onClick: (event) => setValue(next, { reason: 'click', event: event.nativeEvent })
```

Test both modes: controlled (callback fires, rendered state does not change, `null` renders nothing selected) and uncontrolled (state changes, callback receives `details.reason`).

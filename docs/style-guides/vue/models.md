# Models: `v-model`, named models and change details

How the shared value contract ([architecture](../../architecture.md), props, events and forms contract) maps to Vue.

| Shared contract | Vue |
|---|---|
| `value` / `onValueChange(value, details)` | prop `modelValue`, emit `update:modelValue`, `useModel(props, 'modelValue')`; `update:modelValue` is the only change event |
| `checked` / `onCheckedChange` | prop `modelValue`, emit `update:modelValue` (`v-model`), `useModel(props, 'modelValue')` (a checked control has one model, so it is the default model, as `value` is); `update:modelValue` is the only change event |
| `open` / `onOpenChange` | prop `open`, emit `update:open` (`v-model:open`), `useModel(props, 'open')`; `update:open` is the only change event (Reka has no other), so it carries no reason |
| `defaultValue`, `defaultOpen` | props `defaultValue` (the roots with a value model: Tabs, Select; the text controls Input and Textarea), `defaultChecked` (the checked controls Checkbox, Switch, Radio) and `defaultOpen` (Dialog, Popover, Tooltip, Select), the start value of a component whose model is not bound |

- Declare every model as three parts, never with `defineModel`: the prop in `<name>Props` typed with what a parent may give (`string | null | undefined`), the `update:<name>` event in `<name>Emits` typed with what the component gives back (`[value: string]`), and `useModel(props, '<name>')` for the ref. Declare `modelModifiers` (`Record<string, true>`) next to `modelValue` (`<name>Modifiers` for a named model), so `v-model.trim` fills a prop and never reaches the element as an attribute. The reason is in [why/forms](../../why/forms.md#a-vue-model-is-a-wide-prop-and-a-narrow-event). Emit `update:<name>` for every accepted change and no `<name>Change` companion beside it: a second event with the same value gives two ways to listen ([architecture §6](../../architecture.md#6-props-events-and-forms-contract)). The `details` argument (`ChangeDetails<Reason>` from `@cocokits/shared`) belongs to the React callbacks and the Angular outputs; the Vue event carries the value only.
- When change events fire is defined in [architecture.md](../../architecture.md) section 6.
- **Controlled** is Vue's own rule: the prop is bound and an `onUpdate:<name>` listener exists (what `v-model` does). A write to the model then only emits; the UI follows the parent, so a parent that ignores the update keeps the old value. A prop bound without a listener is the initial value of local state: a user change applies locally and emits `update:<name>`, and a new prop value from the parent replaces the local one.
- **Uncontrolled start value.** A root that holds a model also declares `default<Name>` (`defaultOpen`, `defaultValue`), typed like the model and tagged `@cckSemantic none` (React has the same prop). It is the start of the local state when the model prop is not bound at all, read once when the component is set up: a later change of it and a parent that renders again do not reset the state, which still emits `update:<name>` on every accepted change. Binding the model prop, with or without a listener, ignores it. Read it with the internal `useDefaultModel(props, '<name>', props.default<Name>)`, which is `useModel` plus that start value, and give the model prop an `undefined` default (`withDefaults`), so an absent prop is not cast to `false`. A themed wrapper hands the model to the base root only as the consumer wrote it, so the base root can tell the cases apart (why: [forms](../../why/forms.md#a-vue-root-has-a-default-prop-and-keeps-the-usemodel-rule)).
- `null` is the controlled "nothing selected" value: a `modelValue` prop typed `string | null | undefined` with `withDefaults(..., { modelValue: null })`. Never convert it to `undefined`, including when passing it to a machine ([machine-backed.md](./machine-backed.md)).
- Never write to a prop, and never copy a model into a local `ref` and `watch` it; write the model ref.

Example (illustrative):

```ts
const props = withDefaults(defineProps<{ modelValue?: boolean | null | undefined; modelModifiers?: Record<string, true> }>(), { modelValue: false })
const emit = defineEmits<{
  'update:modelValue': [checked: boolean]
}>()
const checked = useModel(props, 'modelValue')

function setChecked(next: boolean) {
  if (next === checked.value) return
  checked.value = next // emits update:modelValue
}
```

- **`update:*` is the only change event, for every component.** A form control (Checkbox, Switch, Radio, Input, Textarea), an overlay, the Select and the Tabs emit no `checkedChange`, `valueChange` or `openChange` beside it. Refusing a change is the Content emits of [overlays](./overlays.md), not a field of the change event. Why: [overlays](../../why/overlays.md#each-framework-refuses-and-reports-as-its-reference-does).

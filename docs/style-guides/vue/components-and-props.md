# Components and props

How a CocoKits SFC is written: script API, typed props/emits/slots, reactivity, templates, refs and TSDoc.

## Script API

- Use `<script setup lang="ts">`. No Options API, no `this`. The only `defineComponent` + `setup()` files are render-function primitives.
- Order macros `defineOptions`, `defineProps`, `defineEmits`, `defineSlots`; a model is a prop and an emit plus `useModel` ([models.md](./models.md)).
- Set `defineOptions({ name: 'Cck<Component><Part>' })`; add `inheritAttrs: false` when the template is multi-root or the attrs target is not the root ([data-attrs-and-anatomy.md](./data-attrs-and-anatomy.md)).
- Use type-based `defineProps<Props>()` with interfaces from `<name>.types.ts`, `defineEmits<{ name: [arg: T] }>()` (named tuples, every event declared, `update:<model>` included) and `defineSlots<...>()` for every component with a `<slot>`.
- Use `generic="T extends ..."` for value-carrying components.
- Event names are camelCase in code (`rowActivate`); consumers write `@row-activate`.

## Props

- Every boolean prop whose absence means "default or inherit" (`disabled`, `required`, `readonly`, `loopFocus`) gets an explicit `undefined` default in `withDefaults`; Vue casts an absent Boolean prop to `false` otherwise. Read them as `computed(() => !!props.disabled)`.
- Never mutate a prop or a nested field of an object prop.
- Never destructure `props` or a `reactive` object in setup (`const { disabled } = props` loses reactivity). Use `props.x`, `toRef(props, 'x')` or a getter.
- Models, change details and `null` are in [models.md](./models.md).
- **A root's default slot passes its state** as slot props, declared in `defineSlots` with a TSDoc comment on each field and tagged `@cckSemantic none` with a `@remarks` (the other frameworks have no such field): `{ open, close }` for the Dialog and Popover, `{ open }` for the Tooltip, `{ modelValue }` for Tabs, `{ modelValue, open }` for the Select. A themed root passes the same slot props through its own default slot.
- **`aria-*` are fall-through attributes.** `aria-label`, `aria-labelledby` and `aria-describedby` are not declared props: written on a part, they reach the part's element in kebab case, like any other undeclared attribute. Declare them only when they belong on another element than the one the attributes land on (a choice control gives them to its input, the Select to its trigger and list). A consumer value never replaces a machine state attribute the part lists in `priorityAttrs`. The parity check does not require a Vue member for an `aria-*` semantic id ([api-extraction.md](../workspace/api-extraction.md#pipeline)).

## Reactivity

- `ref`/`shallowRef` for state; `shallowRef` for DOM nodes, Maps, arrays of records and anything replaced wholesale; `markRaw` for elements and third-party instances. `reactive()` only for local grouped state that is never destructured or provided.
- Derive with `computed`. Do not `watch` one ref to set another.
- Composables accept `MaybeRefOrGetter<T>` and read with `toValue()`.
- `watch(source, cb)` when old values, laziness or explicit sources are needed; `watchEffect` to sync a side effect with what it reads; `flush: 'post'` for DOM reads; clean up with `onWatcherCleanup()` or the `onCleanup` argument.
- Dispose listeners, observers and timers in `onScopeDispose` (preferred) or `onBeforeUnmount`.
- No `deep: true` watchers on props; watch precise getters.
- Context passes narrow computeds plus methods, never whole reactive prop objects ([compound-parts.md](./compound-parts.md)).

## Templates

- `v-for` has a stable, non-index `:key`; never `v-if` on the same element as `v-for` (filter in a `computed`).
- No `v-html`. Icons come from slots or components.
- Nested refs inside an injected context are not unwrapped: write `ctx.checked.value`.
- Binding order: `v-bind="$attrs"` (when `inheritAttrs: false`) and theme attrs, then the anatomy class, then ARIA and `data-*` state, then listeners.
- No legacy syntax: `.sync`, `.native`, filters, `$listeners`, `$scopedSlots`, `slot-scope`, `beforeDestroy`/`destroyed`.

## Template refs and exposure

- Use `useTemplateRef<T>('key')` for static refs; a function ref when the target is a component and you need `$el`.
- Parts expose the DOM node of the contract's ref target with `defineExpose`; form controls also expose the input ref.
- `useId()`, `inject()`, `provide()` and `getCurrentInstance()` are called synchronously at the top of setup, never in a handler, a computed or after `await`.

## TSDoc

Every prop, emit, slot, slot prop, model and exposed method has a TSDoc comment ([tsdoc.md](./tsdoc.md)).

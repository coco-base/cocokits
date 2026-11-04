# TSDoc for Vue components

Shared rules: [TSDoc rules](../framework-agnostic/tsdoc.md#tsdoc-rules-all-frameworks).

- Keep props, emits and slots in the exported `<name>.types.ts` interfaces with a TSDoc comment on every member. A model's prop and its `update:<model>` event are documented there like any other member.
- Slots and slot props are documented in the `defineSlots` type.
- Exposed members (`defineExpose`) are documented too.

# Compound parts: context, collections, roving focus, ids

How a Root shares state with its parts and keeps an ordered list of them in Vue. The shared rules (sibling parts, one rendered contract, registration through context) are in [architecture](../../architecture.md) Why: [rendered contract](../../why/rendered-contract.md).

## Context

- Use one typed provide/inject pair per compound component; the inject side throws a descriptive error naming the consumer when used outside the root. Symbol keys only.
- Context shape: read-only computeds plus methods. Never provide `reactive(props)` or a spread of props.
- Templates read nested refs with `.value` (`ctx.checked.value`).
- Optional contexts (such as app-wide `dir`) work without a provider.

## Collections

Vue has no content queries and slot vnodes do not reflect DOM order, so items register their element with the root ([shared collection rules](../framework-agnostic/cdk-modules.md#collections)):

- The ordered list is in DOM order (`compareDocumentPosition`), re-sorted when items register or unregister and after renders that mount, unmount or move items (item and root refresh in `onUpdated`; the list can also watch `childList` mutations so keyed moves in a consumer's own component are seen).
- Records hold getters (`value: () => props.value`).
- Register in `onMounted` (never in setup: the server has no element) and unregister in `onBeforeUnmount`. The list is empty on the server and during the first client render; markup depends on it only through the tab-stop fallback below.

## Roving focus

While the list is empty (server, first client render) the tab stop is the selected value, so markup matches. Key-to-index mapping uses `@cocokits/cdk/roving-focus`.

## Ids and ARIA linking

- Ids come from `useId()` (one per root, called synchronously in setup) + part + a stable per-item key; the shared id rules are in [machines](../framework-agnostic/machines.md).
- Direction resolves prop, then app-wide setting, then `'ltr'`.

## Machine handlers

- A machine handler named `onKeyDown` is bound as `onKeydown` in a render object or `v-bind` (Vue spells the event `keydown`; `onKeyDown` would listen to `key-down`). `onClick` and `onFocus` need no change.

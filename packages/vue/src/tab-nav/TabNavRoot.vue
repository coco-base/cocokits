<script setup lang="ts">
import {
  computed,
  Fragment,
  mergeProps,
  onMounted,
  provide,
  shallowRef,
  useAttrs,
  useSlots,
  useTemplateRef,
  type ComponentPublicInstance,
  type VNode,
} from 'vue';
import { getTabNavProps, resolveTabNavStop, tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { hasAccessibleName, sortByDomOrder } from '@cocokits/utils';
import { isDevelopment, Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import TabNavLink from './TabNavLink.vue';
import {
  TAB_NAV_KEY,
  type TabNavContextValue,
  type TabNavListedLink,
  type TabNavRegistration,
} from './tab-nav.context';
import type { TabNavRootProps } from './tab-nav.types';

defineOptions({ name: 'CckTabNavRoot', inheritAttrs: false });

const props = withDefaults(defineProps<TabNavRootProps>(), { tabPanel: undefined, as: 'nav', asChild: false });
defineSlots<{
  /** The `TabNavList` with the links and the indicator. */
  default?(): unknown;
}>();

const attrs = useAttrs();
const slots = useSlots();
const themeAttrs = useThemeAttrs(tabNavAnatomy);
const panelId = computed(() => props.tabPanel);
const parts = computed(() => getTabNavProps({ panelId: panelId.value }));
const registry = new Set<TabNavRegistration>();
// The links in document order. Empty on the server and in the first client render, so the markup matches.
const links = shallowRef<readonly TabNavListedLink[] | null>(null);
// The setup-order claim of the Tab stop; it belongs to this instance, so nothing leaks between requests.
let claimed: symbol | undefined;
let sawActive: boolean | undefined;

// The mounted links in document order.
function getEntries(): readonly TabNavRegistration[] {
  const byElement = new Map(
    [...registry].flatMap((entry) => {
      const element = entry.element();
      return element ? [[element, entry] as const] : [];
    }),
  );
  return sortByDomOrder([...byElement.keys()]).flatMap((element) => byElement.get(element) ?? []);
}

const sameLinks = (a: readonly TabNavListedLink[], b: readonly TabNavListedLink[]): boolean =>
  a.length === b.length &&
  a.every(
    (link, index) =>
      link.key === b[index]?.key && link.active === b[index].active && link.disabled === b[index].disabled,
  );

function refresh(): void {
  const next = getEntries().map((entry): TabNavListedLink => ({
    key: entry.key,
    active: entry.active(),
    disabled: entry.disabled(),
  }));
  if (links.value === null || !sameLinks(links.value, next)) links.value = next;
}

function register(entry: TabNavRegistration): () => void {
  registry.add(entry);
  refresh();
  return () => {
    registry.delete(entry);
    refresh();
  };
}

// Before the first mount: an active link takes the stop; else the first enabled link to ask, unless the root
// already saw an active link below it. Asking again with the same key gives the same answer.
function claim(key: symbol, active: boolean, disabled: boolean): boolean {
  if (disabled) return false;
  if (active) {
    claimed = key;
    return true;
  }
  if (sawActive === true) return false;
  claimed ??= key;
  return claimed === key;
}

const stop = computed((): symbol | null | undefined => {
  if (links.value === null) return undefined;
  return links.value[resolveTabNavStop(links.value)]?.key ?? null;
});

const context: TabNavContextValue = { panelId, register, refresh, getEntries, links, stop, claim };
provide(TAB_NAV_KEY, context);

/** Whether a vnode's raw `active` prop is on: `<TabNavLink active>` gives `''`. */
const isOn = (value: unknown): boolean => value === '' || value === true || value === 'true';

/**
 * Whether the vnodes hold an active `TabNavLink`: `true` if one is, `false` if the links found are all inactive,
 * `undefined` when none is found (a link inside another component is not seen). It reads the default slots of the
 * parts below the root, so the Tab stop of a link that renders before the active one is known.
 */
function findActiveLink(nodes: unknown): boolean | undefined {
  if (!Array.isArray(nodes)) return undefined;
  let found: boolean | undefined;
  for (const node of nodes as VNode[]) {
    if (node.type === TabNavLink) {
      const { active } = (node.props ?? {}) as { readonly active?: unknown };
      if (isOn(active)) return true;
      found = false;
      continue;
    }
    const children: unknown = node.children;
    const inner =
      Array.isArray(children) || node.type === Fragment
        ? findActiveLink(children)
        : typeof (children as { default?: unknown } | null)?.default === 'function'
          ? findActiveLink((children as { default: () => unknown }).default())
          : undefined;
    if (inner === true) return true;
    if (inner === false) found = false;
  }
  return found;
}

// Called while the root renders, before its links set up: it reads the slot content once to learn whether a link
// is active, and returns the attributes of the element.
function rootProps(): Record<string, unknown> {
  const { default: content } = slots;
  sawActive = panelId.value === undefined ? undefined : findActiveLink(content?.());
  return mergeProps(themeAttrs.value.root, attrs, { ...parts.value.root });
}

const root = useTemplateRef<ComponentPublicInstance>('root');
onMounted(() => {
  const nav = rootElementOf(root.value);
  if (isDevelopment() && nav && !hasAccessibleName(nav)) {
    console.warn('CocoKits: <TabNavRoot> has no accessible name. Add an aria-label or aria-labelledby.');
  }
});
</script>

<template>
  <Primitive ref="root" v-bind="rootProps()" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>

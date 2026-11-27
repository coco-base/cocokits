import { defineComponent, type Component, h, unref, type Ref, type VNode } from 'vue';
import { TabNavIndicator, TabNavLink, TabNavList, TabNavPanel, TabNavRoot } from '../index';

export { mountView } from '../../internal/tests/mount-helpers';

/** The options of {@link tabNavView}. */
export interface TabNavViewOptions {
  /** The value of `href` of the link that is active (a ref changes it later), `undefined` for none. */
  readonly active?: string | Ref<string | undefined>;
  /** Whether the Billing link is disabled. */
  readonly lockBilling?: boolean;
  /** Props of the root. */
  readonly root?: Record<string, unknown>;
  /** Panel mode: the id of the panel, which the view renders after the nav. */
  readonly panel?: string;
  /** Props of the panel (for example `hasActiveLink`). */
  readonly panelProps?: Record<string, unknown>;
  /** Whether the first link (Profile) is disabled. */
  readonly lockFirst?: boolean;
  /** Which links render, in order (default: all three). */
  readonly only?: readonly ('profile' | 'billing' | 'security')[];
}

/** Three links in a list with the indicator, between two buttons of the page; with `panel` a tab panel follows. */
export function tabNavView(options: TabNavViewOptions = {}): () => VNode[] {
  const link = (href: string, label: string, extra: Record<string, unknown> = {}): VNode =>
    h(TabNavLink, { href, active: unref(options.active) === href, ...extra }, () => label);
  return () => [
    h('button', 'before'),
    h(TabNavRoot, { 'aria-label': 'Account', tabPanel: options.panel, ...options.root }, () =>
      h(TabNavList, null, () => [
        ...(options.only ?? ['profile', 'billing', 'security']).map((name) =>
          name === 'profile'
            ? link('#profile', 'Profile', { disabled: options.lockFirst === true })
            : name === 'billing'
              ? link('#billing', 'Billing', { disabled: options.lockBilling === true })
              : link('#security', 'Security'),
        ),
        h(TabNavIndicator),
      ]),
    ),
    ...(options.panel === undefined
      ? []
      : [h(TabNavPanel, { id: options.panel, ...options.panelProps }, () => 'Routed')]),
    h('button', 'after'),
  ];
}

/** A stand-in for a router link: renders an `<a>` and calls `navigate` on click. */
export function makeRouterLink(navigate: () => void): Component {
  return defineComponent({
    name: 'RouterLinkStub',
    props: { to: { type: String, required: true } },
    setup:
      (props, { slots }) =>
      () =>
        h('a', { href: props.to, 'aria-current': 'page', onClick: navigate }, slots.default?.()),
  });
}

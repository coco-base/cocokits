import { defineComponent, h, type VNode } from 'vue';
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from '../index';

export { mountView } from '../../internal/tests/mount-helpers';

/** The options of {@link tabsView}. */
export interface TabsViewOptions {
  /** Props and listeners of the root. */
  readonly root?: Record<string, unknown>;
  /** Whether the Password tab is disabled. */
  readonly lockPassword?: boolean;
  /** Whether the Account tab (the first) is disabled. */
  readonly lockFirst?: boolean;
  /** Whether the first trigger sits inside a wrapper component. */
  readonly wrapFirst?: boolean;
  /** The accessible name of the list. */
  readonly label?: string;
  /** Props of the list. */
  readonly list?: Record<string, unknown>;
  /** Whether the list holds the indicator (default). */
  readonly indicator?: boolean;
  /** Whether the panels come before the list. */
  readonly panelsFirst?: boolean;
}

/** Three tabs, the second one optionally disabled, between two buttons of the page. */
/** A component that renders a trigger of its own. */
const WrappedTrigger = defineComponent({
  props: { value: { type: String, required: true }, disabled: Boolean },
  setup: (props) => () => h(TabsTrigger, { value: props.value, disabled: props.disabled }, () => 'Account'),
});

export function tabsView(options: TabsViewOptions = {}): () => VNode[] {
  const panels = (): VNode[] => [
    h(TabsContent, { value: 'account' }, () => 'Account panel'),
    h(TabsContent, { value: 'password' }, () => 'Password panel'),
    h(TabsContent, { value: 'notifications' }, () => 'Notifications panel'),
  ];
  const list = (): VNode =>
    h(TabsList, { 'aria-label': options.label ?? 'Account settings', ...options.list }, () => [
      options.wrapFirst === true
        ? h(WrappedTrigger, { value: 'account', disabled: options.lockFirst === true })
        : h(TabsTrigger, { value: 'account', disabled: options.lockFirst === true }, () => 'Account'),
      h(TabsTrigger, { value: 'password', disabled: options.lockPassword === true }, () => 'Password'),
      h(TabsTrigger, { value: 'notifications' }, () => 'Notifications'),
      ...(options.indicator === false ? [] : [h(TabsIndicator)]),
    ]);
  return () => [
    h('button', 'before'),
    h(TabsRoot, options.root ?? {}, () =>
      options.panelsFirst === true ? [...panels(), list()] : [list(), ...panels()],
    ),
    h('button', 'after'),
  ];
}

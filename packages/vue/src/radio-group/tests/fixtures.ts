import { h, type VNode } from 'vue';
import { Radio } from '../../radio';
import { RadioGroup } from '../index';

export { mountView } from '../../internal/tests/mount-helpers';

/** The options of {@link groupView}. */
export interface GroupViewOptions {
  /** Props and listeners of the group. */
  readonly group?: Record<string, unknown>;
  /** The values of the radios that are disabled. */
  readonly disabled?: readonly string[];
  /** The values of the radios, in order. */
  readonly values?: readonly string[];
}

const LABELS: Readonly<Record<string, string>> = { free: 'Free', pro: 'Pro', team: 'Team' };

/** A caption, a group of radios and two buttons around it. */
export function groupView(options: GroupViewOptions = {}): () => VNode[] {
  const values = options.values ?? ['free', 'pro', 'team'];
  return () => [
    h('button', 'before'),
    h('span', { id: 'plan-label' }, 'Plan'),
    h(RadioGroup, { 'aria-labelledby': 'plan-label', ...options.group }, () =>
      values.map((value) =>
        h(Radio, { key: value, value, disabled: options.disabled?.includes(value) }, () => LABELS[value] ?? value),
      ),
    ),
    h('button', 'after'),
  ];
}

import { h, type VNode } from 'vue';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { Radio } from '../../radio';
import { Switch } from '../../switch';
import { Checkbox } from '../index';

/** Every choice control in the states the server must render: checked, mixed, in a field, disabled, read-only. */
export function choiceControls(): VNode[] {
  return [
    h(Checkbox, { modelValue: true, name: 'terms', value: 'yes' }, () => 'Accept'),
    h(Checkbox, { id: 'mixed', indeterminate: true, ariaDescribedby: 'note' }, () => 'All'),
    h('p', { id: 'note' }, 'Some are selected'),
    h(Checkbox, { disabled: true, 'aria-label': 'Off' }),
    h(Checkbox, { readonly: true, modelValue: true, 'aria-label': 'Locked' }),
    h(Switch, { required: true, modelValue: true }, () => 'Notify me'),
    h(
      FormField,
      { id: 'news' },
      {
        label: () => h(Label, null, () => 'Newsletter'),
        default: () => h(Checkbox, { name: 'news' }, () => 'Weekly'),
        hint: () => h(Hint, null, () => 'Once a week.'),
      },
    ),
    h(
      FormField,
      { id: 'push' },
      {
        label: () => h(Label, null, () => 'Push'),
        default: () => h(Switch, { name: 'push' }, () => 'On'),
      },
    ),
    h('fieldset', null, [
      h('legend', null, 'Plan'),
      h(Radio, { name: 'plan', value: 'free', modelValue: true }, () => 'Free'),
      h(Radio, { name: 'plan', value: 'pro' }, () => 'Pro'),
    ]),
  ];
}

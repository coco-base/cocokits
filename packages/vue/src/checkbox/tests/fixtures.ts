import { screen } from '@testing-library/vue';
import { h, type VNode } from 'vue';
import { field as fieldOf } from '../../internal/tests/choice-helpers';
import { Checkbox } from '../index';
import { must } from '../../internal/tests/choice-helpers';

/** The only checkbox on the page (a switch has the role `switch`). */
export const box = (): HTMLInputElement => screen.getByRole<HTMLInputElement>('checkbox');

/** A field with a Label, a Checkbox and a Hint; `fieldProps` go on the FormField. */
export const field = (
  control: () => VNode | VNode[] = () => h(Checkbox, null, () => 'Email me'),
  fieldProps: Record<string, unknown> = {},
): VNode => fieldOf(control, fieldProps);

/** The checkbox root element. */
export const root = (): HTMLElement => must(document.querySelector<HTMLElement>('.cck-checkbox'));

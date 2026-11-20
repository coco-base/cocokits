// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { FieldError } from '../../field-error';
import { FormField } from '../../form-field';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { ChipList } from '../index';

afterEach(cleanup);

describe('ChipList accessibility (axe)', () => {
  it.each<[string, ReactElement]>([
    [
      'in a FormField',
      <FormField label={<Label>Toppings</Label>} hint={<Hint>Press Enter to add.</Hint>}>
        <ChipList defaultValue={['Pizza', 'Salad']} name="toppings" required />
      </FormField>,
    ],
    [
      'in an invalid FormField with an error',
      <FormField label={<Label>Toppings</Label>} invalid error={<FieldError>Add one.</FieldError>}>
        <ChipList />
      </FormField>,
    ],
    ['labelled, standalone', <ChipList aria-label="Toppings" defaultValue={['Pizza']} />],
    ['disabled', <ChipList aria-label="Toppings" defaultValue={['Pizza']} disabled />],
    ['read-only', <ChipList aria-label="Toppings" defaultValue={['Pizza']} readOnly />],
  ])('has no violations: %s', async (_name, ui) => {
    const { container } = render(ui);
    expect((await axe(container)).violations).toEqual([]);
  });
});

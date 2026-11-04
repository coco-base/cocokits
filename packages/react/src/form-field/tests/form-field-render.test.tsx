// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { formFieldAnatomy } from '@cocokits/machines/form-field';
import { Hint } from '../../hint';
import { FormField } from '../index';

afterEach(cleanup);

describe('FormField render prop', () => {
  it('element form: renders the element with the class, the zones and the ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <FormField
        data-testid="field"
        ref={ref}
        render={<section className="mine">own</section>}
        hint={<Hint>Help</Hint>}
      >
        <input />
      </FormField>,
    );
    const root = screen.getByTestId('field');
    expect(root.tagName).toBe('SECTION');
    expect(root.className).toBe(`${formFieldAnatomy.classes.root} mine`);
    expect(ref.current).toBe(root);
    expect(root.textContent).toBe('Help');
    expect([...root.children].map((child) => child.className)).toEqual([
      formFieldAnatomy.classes.wrapper,
      formFieldAnatomy.classes.feedbackWrapper,
    ]);
  });

  it('function form: receives all props, ref and children', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <FormField data-testid="field" ref={ref} render={(props) => <section {...props} />}>
        <input />
      </FormField>,
    );
    const root = screen.getByTestId('field');
    expect(root.tagName).toBe('SECTION');
    expect(root.className).toBe(formFieldAnatomy.classes.root);
    expect(ref.current).toBe(root);
    expect(root.querySelector(`.${formFieldAnatomy.classes.inputWrapper} > input`)).not.toBeNull();
  });
});

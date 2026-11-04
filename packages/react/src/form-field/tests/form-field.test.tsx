// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { formFieldAnatomy, formFieldMeta } from '@cocokits/machines/form-field';
import { hintAnatomy } from '@cocokits/machines/hint';
import { labelAnatomy } from '@cocokits/machines/label';
import { ThemeProvider } from '@cocokits/react-core';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { FormField } from '../index';
import { allPartsConfig, strict } from './fixtures';

afterEach(cleanup);

const classes = formFieldAnatomy.classes;

describe('FormField (rendered contract)', () => {
  it('renders root > label, wrapper > inputWrapper > control, feedbackWrapper > hint, in that order', () => {
    const { container } = render(
      strict(
        <FormField data-testid="field" label={<Label htmlFor="a">Name</Label>} hint={<Hint>Help</Hint>}>
          <input id="a" />
        </FormField>,
      ),
    );
    const root = screen.getByTestId('field');
    expect(root.className).toBe(classes.root);
    expect([...root.children].map((child) => child.className)).toEqual([
      labelAnatomy.classes.root,
      classes.wrapper,
      classes.feedbackWrapper,
    ]);
    const [, wrapper, feedback] = [...root.children];
    expect([...wrapper.children].map((child) => child.className)).toEqual([classes.inputWrapper]);
    expect(wrapper.firstElementChild?.firstElementChild?.tagName).toBe('INPUT');
    expect([...feedback.children].map((child) => child.className)).toEqual([hintAnatomy.classes.root]);
    expect(container.querySelectorAll('[style]')).toHaveLength(0);
  });

  it('puts the label first and the hints last whatever order the props are written in', () => {
    render(
      <FormField data-testid="field" hint={<Hint>Help</Hint>} label={<Label>Name</Label>}>
        <input />
      </FormField>,
    );
    expect([...screen.getByTestId('field').children].map((child) => child.tagName)).toEqual(['LABEL', 'DIV', 'DIV']);
  });

  it('always renders the feedback wrapper, empty without a hint, and renders no label without one', () => {
    render(
      <FormField data-testid="field">
        <input />
      </FormField>,
    );
    const root = screen.getByTestId('field');
    expect([...root.children].map((child) => child.className)).toEqual([classes.wrapper, classes.feedbackWrapper]);
    expect(root.querySelector(`.${classes.feedbackWrapper}`)?.matches(':empty')).toBe(true);
  });

  it('renders several hints in the feedback wrapper, in order', () => {
    render(
      <FormField
        data-testid="field"
        hint={
          <>
            <Hint>One</Hint>
            <Hint>Two</Hint>
          </>
        }
      />,
    );
    const feedback = screen.getByTestId('field').querySelector(`.${classes.feedbackWrapper}`);
    expect([...(feedback?.children ?? [])].map((child) => child.textContent)).toEqual(['One', 'Two']);
  });

  it('renders the default elements of the meta, with no data-*, role or aria-*', () => {
    const { container } = render(<FormField label={<Label>Name</Label>} />);
    const elements = formFieldMeta.defaultElements ?? {};
    expect(Object.keys(elements)).toEqual(Object.keys(classes));
    Object.values(classes).forEach((className, index) => {
      expect(container.querySelector(`.${className}`)?.tagName.toLowerCase(), className).toBe(
        Object.values(elements)[index],
      );
    });
    for (const element of container.querySelectorAll('div')) {
      // Only the feedback wrapper carries an attribute: the id the control is described by.
      expect(
        element.getAttributeNames().filter((name) => name !== 'class'),
        element.className,
      ).toEqual(element.className === classes.feedbackWrapper ? ['id'] : []);
    }
  });

  it('joins className, merges style, passes native attributes and forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<FormField data-testid="field" ref={ref} id="f" className="mine" style={{ color: 'red' }} />);
    const root = screen.getByTestId('field');
    expect(ref.current).toBe(root);
    expect(root.id).toBe('f');
    expect(root.className).toBe(`${classes.root} mine`);
    expect(root.style.color).toBe('red');
  });
});

describe('Label and Hint outside a FormField', () => {
  it('render the same element and class as inside, and do not throw', () => {
    const { container } = render(
      <>
        <Label htmlFor="x">Name</Label>
        <Hint>Help</Hint>
      </>,
    );
    expect(container.querySelector('label')?.className).toBe(labelAnatomy.classes.root);
    expect(container.querySelector('div')?.className).toBe(hintAnatomy.classes.root);
  });
});

describe('FormField theme', () => {
  it('puts the theme attribute on every rendered part of the three components', () => {
    const { container } = render(
      <ThemeProvider themeConfig={allPartsConfig}>
        <FormField required label={<Label htmlFor="a">Name</Label>} hint={<Hint>Help</Hint>}>
          <input id="a" />
        </FormField>
      </ThemeProvider>,
    );
    for (const className of [
      ...Object.values(formFieldAnatomy.classes),
      ...Object.values(labelAnatomy.classes),
      ...Object.values(hintAnatomy.classes),
    ]) {
      const part = container.querySelector(`.${className}`);
      expect(part, className).not.toBeNull();
      expect(part?.getAttribute('data-probe'), className).toBe('on');
    }
  });
});

// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { fieldErrorAnatomy, fieldErrorMeta } from '@cocokits/machines/field-error';
import { ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig } from '@cocokits/shared';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { Label } from '../../label';
import { FieldError } from '../index';

afterEach(cleanup);

const nextTask = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));
function must<T>(value: T | null): T {
  if (value === null) throw new Error('Expected the element to exist.');
  return value;
}
const error = (): HTMLElement => screen.getByTestId('error');

describe('FieldError rendering', () => {
  it('renders the default element of the meta with the class and aria-live, and no role', () => {
    render(<FieldError data-testid="error">Message</FieldError>);
    expect(error().tagName.toLowerCase()).toBe(fieldErrorMeta.defaultElements?.root);
    expect(error().className).toBe(fieldErrorAnatomy.classes.root);
    expect(error().getAttributeNames().sort()).toEqual(['aria-live', 'class', 'data-testid']);
    expect(error().getAttribute('aria-live')).toBe('polite');
  });

  it('shows its content outside a FormField', () => {
    render(<FieldError data-testid="error">Message</FieldError>);
    expect(error().textContent).toBe('Message');
  });

  it('passes id and native attributes, joins className and forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <FieldError data-testid="error" ref={ref} id="own" className="mine" style={{ color: 'red' }}>
        Message
      </FieldError>,
    );
    expect(ref.current).toBe(error());
    expect(error().id).toBe('own');
    expect(error().className).toBe(`${fieldErrorAnatomy.classes.root} mine`);
    expect(error().style.color).toBe('red');
  });

  it('puts the theme attribute on its root', () => {
    const config = defineThemeConfig({
      name: 'test',
      components: {
        'field-error': {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(fieldErrorAnatomy.parts) },
        },
      },
    });
    render(
      <ThemeProvider themeConfig={config}>
        <FieldError data-testid="error">Message</FieldError>
      </ThemeProvider>,
    );
    expect(error().getAttribute('data-probe')).toBe('on');
  });

  it('replaces the element with render, as an element or a function that gets the shown state', () => {
    const { rerender } = render(
      <FieldError data-testid="error" render={<p className="p" />}>
        Message
      </FieldError>,
    );
    expect(error().tagName.toLowerCase()).toBe('p');
    expect(error().className).toBe(`${fieldErrorAnatomy.classes.root} p`);
    expect(error().textContent).toBe('Message');
    rerender(
      <FieldError
        data-testid="error"
        force={false}
        render={(props, state) => <span {...props} data-shown={String(state.shown)} />}
      >
        Message
      </FieldError>,
    );
    expect(error().getAttribute('data-shown')).toBe('true');
  });
});

describe('FieldError in a FormField', () => {
  const field = (props: { readonly force?: boolean; readonly invalid?: boolean } = {}) => (
    <FormField
      label={<Label>Name</Label>}
      error={
        <FieldError data-testid="error" force={props.force}>
          Enter a name.
        </FieldError>
      }
    >
      <Input invalid={props.invalid ?? true} />
    </FormField>
  );

  it('renders its root without content before touch or submit', () => {
    render(field());
    expect(error().textContent).toBe('');
    expect(error().childNodes).toHaveLength(0);
    expect(error().getAttribute('aria-live')).toBe('polite');
  });

  it('renders the content after blur and hides it again when the field is valid', async () => {
    const { rerender } = render(field());
    await userEvent.click(screen.getByRole('textbox'));
    expect(error().textContent).toBe('');
    await userEvent.tab();
    expect(error().textContent).toBe('Enter a name.');
    rerender(field({ invalid: false }));
    expect(error().textContent).toBe('');
  });

  it('renders the content after a submit event and hides it after a reset', async () => {
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        {field()}
        <button type="reset">Reset</button>
      </form>,
    );
    act(() => {
      fireEvent.submit(must(document.querySelector('form')));
    });
    expect(error().textContent).toBe('Enter a name.');
    await userEvent.click(screen.getByText('Reset'));
    await act(nextTask);
    expect(error().textContent).toBe('');
  });

  it('shows with force whatever the field state', () => {
    render(field({ force: true, invalid: false }));
    expect(error().textContent).toBe('Enter a name.');
  });

  it('shows only force in a field without a CocoKits control', () => {
    render(
      <FormField
        error={
          <>
            <FieldError data-testid="plain">Plain</FieldError>
            <FieldError data-testid="forced" force>
              Forced
            </FieldError>
          </>
        }
      >
        <input aria-label="Native" />
      </FormField>,
    );
    expect(screen.getByTestId('plain').textContent).toBe('');
    expect(screen.getByTestId('forced').textContent).toBe('Forced');
  });

  it('renders several errors in the feedback wrapper after the hints, each with its own gate', () => {
    render(
      <FormField
        data-testid="field"
        error={
          <>
            <FieldError>One</FieldError>
            <FieldError force>Two</FieldError>
          </>
        }
      >
        <Input invalid aria-label="Name" />
      </FormField>,
    );
    const feedback = screen.getByTestId('field').querySelector('.cck-form-field__feedback-wrapper');
    expect([...(feedback?.children ?? [])].map((child) => child.textContent)).toEqual(['', 'Two']);
  });
});

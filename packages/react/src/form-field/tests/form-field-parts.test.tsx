// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldError } from '../../field-error';
import { Hint } from '../../hint';
import { Input } from '../../input';
import { Label } from '../../label';
import { FormField } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** The development warning, word for word the same in both frameworks. */
const WARNING =
  'CocoKits: a FormField lists only the Hint and FieldError parts and the plain text put directly in its hint or ' +
  'error zone. Other content there, such as an element, a wrapper or a component, is not listed and does not ' +
  'describe the control.';

const describedBy = (): string | null => screen.getByRole('textbox').getAttribute('aria-describedby');

function field(zones: { hint?: ReactNode; error?: ReactNode }): ReactElement {
  return (
    <FormField id="f" label={<Label>Name</Label>} {...zones}>
      <Input />
    </FormField>
  );
}

describe('FormField hint and error parts', () => {
  it('gives no id to a plain element in a zone, does not list it and warns once in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { rerender } = render(
      field({
        hint: (
          <>
            <span data-testid="plain">Note</span>
            <Hint>Help</Hint>
          </>
        ),
      }),
    );
    expect(screen.getByTestId('plain').hasAttribute('id')).toBe(false);
    expect(describedBy()).toBe('f-hint-1');
    rerender(field({ hint: <span data-testid="plain">Note again</span> }));
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(WARNING);
  });

  it('gives no id to a component that renders a Hint itself, does not list it and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const MyHint = (): ReactElement => <Hint>Mine</Hint>;
    render(field({ hint: <MyHint /> }));
    expect(screen.getByText('Mine').hasAttribute('id')).toBe(false);
    expect(describedBy()).toBeNull();
    expect(warn).toHaveBeenCalledWith(WARNING);
  });

  it('gives no id to a FieldError in hint and a Hint in error, does not list them and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      field({
        hint: <FieldError force>Wrong zone error</FieldError>,
        error: <Hint>Wrong zone hint</Hint>,
      }),
    );
    expect(screen.getByText('Wrong zone error').hasAttribute('id')).toBe(false);
    expect(screen.getByText('Wrong zone hint').hasAttribute('id')).toBe(false);
    expect(describedBy()).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(WARNING);
  });

  it('does not warn for Hints, FieldErrors and plain text', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      field({
        hint: (
          <>
            Help <Hint>More</Hint>
          </>
        ),
        error: <FieldError>Wrong</FieldError>,
      }),
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it('does not read into a wrapper, gives it no id and warns in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      field({
        hint: (
          <div data-testid="wrapper">
            <Hint>One</Hint>
            <Hint>Two</Hint>
          </div>
        ),
      }),
    );
    expect(screen.getByTestId('wrapper').hasAttribute('id')).toBe(false);
    expect(document.querySelectorAll('.cck-hint[id]')).toHaveLength(0);
    expect(describedBy()).toBeNull();
    expect(warn).toHaveBeenCalledWith(WARNING);
  });

  it('renders plain hint text in a Hint whose id is listed', () => {
    render(field({ hint: 'Help' }));
    const hint = screen.getByText('Help');
    expect(hint.className).toBe('cck-hint');
    expect(hint.id).toBe('f-hint-1');
    expect(screen.getByRole('textbox', { description: 'Help' })).toBeDefined();
  });

  it('renders plain error text in a FieldError that always shows, as the plain text did before', () => {
    render(field({ hint: 'Help', error: 'Enter a name.' }));
    const error = screen.getByText('Enter a name.');
    expect(error.className).toBe('cck-field-error');
    expect(error.id).toBe('f-error-1');
    expect(describedBy()).toBe('f-hint-1 f-error-1');
  });

  it('lists a Hint and a FieldError added before static ones in document order, and drops removed ones', () => {
    const view = (extra: boolean): ReactElement =>
      field({
        hint: (
          <>
            {extra && <Hint id="new-hint">New</Hint>}
            <Hint id="old-hint">Old</Hint>
          </>
        ),
        error: (
          <>
            {extra && <FieldError id="new-error">New</FieldError>}
            <FieldError id="old-error">Old</FieldError>
          </>
        ),
      });
    const { rerender } = render(view(false));
    expect(describedBy()).toBe('old-hint old-error');
    rerender(view(true));
    expect(describedBy()).toBe('new-hint old-hint new-error old-error');
    rerender(view(false));
    expect(describedBy()).toBe('old-hint old-error');
  });

  it('numbers generated ids in document order after a part is added before the others', () => {
    const view = (extra: boolean): ReactElement =>
      field({
        hint: (
          <>
            {extra && <Hint>New</Hint>}
            <Hint>Old</Hint>
          </>
        ),
      });
    const { rerender } = render(view(false));
    expect(screen.getByText('Old').id).toBe('f-hint-1');
    rerender(view(true));
    expect(screen.getByText('New').id).toBe('f-hint-1');
    expect(screen.getByText('Old').id).toBe('f-hint-2');
    expect(describedBy()).toBe('f-hint-1 f-hint-2');
  });

  it('gives the server HTML the same description as the client', () => {
    const ui = field({
      hint: (
        <>
          Help
          <span>Note</span>
          <Hint>More</Hint>
        </>
      ),
      error: 'Enter a name.',
    });
    const server = /aria-describedby="([^"]*)"/.exec(renderToString(ui))?.[1];
    render(ui);
    expect(server).toBe('f-hint-1 f-hint-2 f-error-1');
    expect(describedBy()).toBe(server);
  });
});

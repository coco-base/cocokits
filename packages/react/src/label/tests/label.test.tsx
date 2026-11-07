// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { labelAnatomy, labelMeta } from '@cocokits/machines/label';
import { ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig } from '@cocokits/shared';
import { FormField } from '../../form-field';
import { Input } from '../../input';
import { Label } from '../index';

afterEach(cleanup);

describe('Label', () => {
  it('renders the native label of the meta with the class and no other attribute', () => {
    render(<Label data-testid="label">Email</Label>);
    const label = screen.getByTestId('label');
    expect(label.tagName.toLowerCase()).toBe(labelMeta.defaultElements?.root);
    expect(label.className).toBe(labelAnatomy.classes.root);
    expect(label.getAttributeNames().sort()).toEqual(['class', 'data-testid']);
    expect(label.textContent).toBe('Email');
  });

  it('passes htmlFor as for, and id, and forwards ref', () => {
    const ref = createRef<HTMLLabelElement>();
    render(
      <Label data-testid="label" ref={ref} htmlFor="email" id="email-label" className="mine" style={{ color: 'red' }}>
        Email
      </Label>,
    );
    const label = screen.getByTestId('label');
    expect(label.getAttribute('for')).toBe('email');
    expect(label.id).toBe('email-label');
    expect(label.className).toBe(`${labelAnatomy.classes.root} mine`);
    expect(label.style.color).toBe('red');
    expect(ref.current).toBe(label);
  });

  it('focuses the input it names when clicked', async () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    );
    await userEvent.click(screen.getByText('Email'));
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Email' }));
  });

  it('puts the theme attribute on its root', () => {
    const config = defineThemeConfig({
      name: 'test',
      components: {
        label: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(labelAnatomy.parts) },
        },
      },
    });
    render(
      <ThemeProvider themeConfig={config}>
        <Label data-testid="label">Email</Label>
      </ThemeProvider>,
    );
    expect(screen.getByTestId('label').getAttribute('data-probe')).toBe('on');
  });
});

describe('Label in a FormField', () => {
  it('renders the required marker as a hidden span, the last child, only while the field is required', () => {
    const { rerender } = render(
      <FormField label={<Label data-testid="label">Email</Label>}>
        <Input />
      </FormField>,
    );
    expect(screen.getByTestId('label').querySelector('span')).toBeNull();
    rerender(
      <FormField required label={<Label data-testid="label">Email</Label>}>
        <Input />
      </FormField>,
    );
    const label = screen.getByTestId('label');
    const marker = label.lastElementChild;
    expect(marker?.tagName.toLowerCase()).toBe(labelMeta.defaultElements?.requiredMarker);
    expect(marker?.className).toBe(labelAnatomy.classes.requiredMarker);
    expect(marker?.getAttribute('aria-hidden')).toBe('true');
    expect(marker?.textContent).toBe('*');
  });

  it('hides the marker with hideRequiredMarker and puts the theme attribute on it', () => {
    const config = defineThemeConfig({
      name: 'test',
      components: {
        label: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(labelAnatomy.parts) },
        },
      },
    });
    const ui = (hide: boolean) => (
      <ThemeProvider themeConfig={config}>
        <FormField required hideRequiredMarker={hide} label={<Label>Email</Label>}>
          <Input />
        </FormField>
      </ThemeProvider>
    );
    const { rerender } = render(ui(false));
    expect(screen.getByText('*').getAttribute('data-probe')).toBe('on');
    rerender(ui(true));
    expect(screen.queryByText('*')).toBeNull();
  });

  it('keeps an explicit htmlFor over the default', () => {
    render(
      <FormField id="f" label={<Label htmlFor="mine">Email</Label>}>
        <Input />
      </FormField>,
    );
    expect(screen.getByText('Email').getAttribute('for')).toBe('mine');
  });
});

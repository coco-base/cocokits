// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, StrictMode, type ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { iconButtonAnatomy, iconButtonMeta } from '@cocokits/machines/icon-button';
import { ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig } from '@cocokits/shared';
import { SvgIcon } from '../../svg-icon';
import { strictThemed, themed } from '../../internal/tests/icon-fixtures';
import { IconButton } from '../index';

beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    setTimeout(() => {
      callback(0);
    }, 0),
  );
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    clearTimeout(id);
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const optionsConfig = defineThemeConfig({
  name: 'test',
  components: {
    [iconButtonAnatomy.block]: {
      size: { attrName: 'size', values: ['sm', 'md'], default: 'md', partNames: ['root'] },
      rounded: { attrName: 'rounded', values: [true, false], default: false, partNames: ['root'] },
    },
  },
});

const strict = (ui: ReactElement): ReactElement => <StrictMode>{ui}</StrictMode>;
const icon = <SvgIcon iconName="star" />;

describe('IconButton (rendered contract)', () => {
  it('renders a button with the cck-icon-button class and type="button"', () => {
    render(strict(<IconButton aria-label="Add">{icon}</IconButton>));
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button.tagName).toBe('BUTTON');
    expect(button.className).toBe(iconButtonAnatomy.classes.root);
    expect(button.getAttribute('type')).toBe('button');
    expect(button.hasAttribute('role')).toBe(false);
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('lets the author set the type, and passes native props, ref, className and style', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <IconButton aria-label="Send" type="submit" className="mine" style={{ opacity: 0.5 }} ref={ref} name="go">
        {icon}
      </IconButton>,
    );
    const button = screen.getByRole('button');
    expect(button.getAttribute('type')).toBe('submit');
    expect(button.className).toBe('cck-icon-button mine');
    expect(button.style.opacity).toBe('0.5');
    expect(button.getAttribute('name')).toBe('go');
    expect(ref.current).toBe(button);
  });

  it('renders the theme options of its own block on the root', () => {
    render(
      <ThemeProvider themeConfig={optionsConfig}>
        <IconButton aria-label="Add">{icon}</IconButton>
      </ThemeProvider>,
    );
    const button = screen.getByRole('button');
    expect(button.getAttribute('data-size')).toBe('md');
    expect(button.hasAttribute('data-rounded')).toBe(false);
  });

  it('declares the root data-* the machine renders in its meta', () => {
    render(<IconButton aria-label="Add" disabled />);
    const attributes = screen
      .getByRole('button')
      .getAttributeNames()
      .filter((name) => name.startsWith('data-'));
    expect(attributes).toEqual(['data-disabled']);
    expect(iconButtonMeta.dataAttrs.root).toContain('data-disabled');
  });
});

describe('IconButton disabled', () => {
  it('uses the native disabled on a button and does not click', async () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Add" disabled onClick={onClick}>
        {icon}
      </IconButton>,
    );
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.hasAttribute('data-disabled')).toBe(true);
    await userEvent.setup().click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  const links: readonly [string, (props: { disabled?: boolean; onClick?: () => void }) => ReactElement][] = [
    [
      'element',
      ({ disabled, onClick }) => (
        <IconButton
          aria-label="Go"
          nativeButton={false}
          disabled={disabled}
          onClick={onClick}
          render={<a href="#go" />}
        >
          {icon}
        </IconButton>
      ),
    ],
    [
      'function',
      ({ disabled, onClick }) => (
        <IconButton
          aria-label="Go"
          nativeButton={false}
          disabled={disabled}
          onClick={onClick}
          render={(props) => <a {...props} href="#go" />}
        >
          {icon}
        </IconButton>
      ),
    ],
  ];

  describe.each(links)('as a link (%s form)', (_form, link) => {
    it('renders an <a> with the class and no type', () => {
      render(strict(link({})));
      const anchor = screen.getByRole('link', { name: 'Go' });
      expect(anchor.tagName).toBe('A');
      expect(anchor.className).toBe('cck-icon-button');
      expect(anchor.hasAttribute('type')).toBe(false);
      expect(anchor.hasAttribute('aria-disabled')).toBe(false);
    });

    it('marks a disabled link and stops its clicks', async () => {
      const onClick = vi.fn();
      render(link({ disabled: true, onClick }));
      const anchor = screen.getByRole('link', { name: 'Go' });
      expect(anchor.getAttribute('aria-disabled')).toBe('true');
      expect(anchor.getAttribute('tabindex')).toBe('-1');
      expect(anchor.hasAttribute('data-disabled')).toBe(true);
      await userEvent.setup().click(anchor);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('lets a consumer onClickCapture veto the guard', async () => {
      const onClick = vi.fn();
      render(
        <IconButton
          aria-label="Go"
          nativeButton={false}
          disabled
          onClick={onClick}
          onClickCapture={(event) => {
            event.preventDefault();
          }}
          render={<a href="#go" />}
        >
          {icon}
        </IconButton>,
      );
      await userEvent.setup().click(screen.getByRole('link'));
      expect(onClick).toHaveBeenCalledOnce();
    });
  });
});

describe('IconButton name check (development)', () => {
  const settle = async (): Promise<void> => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  };

  it('logs one CocoKits error in StrictMode when it has no accessible name', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(strictThemed(<IconButton>{icon}</IconButton>));
    await settle();
    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0]?.[0])).toMatch(/^CocoKits: a IconButton has no accessible name/);
  });

  it.each<[string, ReactElement]>([
    ['aria-label', <IconButton aria-label="Add">{icon}</IconButton>],
    [
      'aria-labelledby',
      <>
        <span id="name">Add</span>
        <IconButton aria-labelledby="name">{icon}</IconButton>
      </>,
    ],
    ['title', <IconButton title="Add">{icon}</IconButton>],
    [
      'a labelled SvgIcon inside',
      <IconButton>
        <SvgIcon iconName="star" label="Add" />
      </IconButton>,
    ],
  ])('logs nothing with %s', async (_name, ui) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(strictThemed(ui));
    await settle();
    expect(error).not.toHaveBeenCalled();
  });

  it('checks again when the aria-label is removed', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { rerender } = render(themed(<IconButton aria-label="Add">{icon}</IconButton>));
    await settle();
    rerender(themed(<IconButton>{icon}</IconButton>));
    await settle();
    expect(error).toHaveBeenCalledTimes(1);
  });

  it('keeps the element kind check of the Button, named for the IconButton', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      themed(
        <IconButton aria-label="Go" render={<a href="#go" />}>
          {icon}
        </IconButton>,
      ),
    );
    await settle();
    expect(String(error.mock.calls[0]?.[0])).toContain('<IconButton> renders a native <button>');
  });
});

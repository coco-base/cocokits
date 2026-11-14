// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type ReactElement, type SubmitEvent as ReactSubmitEvent } from 'react';
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { buttonAnatomy, buttonMeta } from '@cocokits/machines/button';
import { ThemeProvider } from '@cocokits/react-core';
import { defineThemeConfig } from '@cocokits/shared';
import { Button } from '../index';
import { strict, testThemeConfig } from './fixtures';

afterEach(cleanup);

// An option that targets every part of the anatomy.
const allPartsConfig = defineThemeConfig({
  name: 'test',
  components: {
    [buttonAnatomy.block]: {
      probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: Object.keys(buttonAnatomy.parts) },
    },
  },
});

describe('Button (rendered contract)', () => {
  it('renders a button with the class and type="button", and no role', () => {
    render(strict(<Button>Save</Button>));
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.tagName).toBe('BUTTON');
    expect(button.classList.contains('cck-button')).toBe(true);
    expect(button.getAttribute('type')).toBe('button');
    expect(button.hasAttribute('role')).toBe(false);
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.hasAttribute('tabindex')).toBe(false);
  });

  it('joins className after the class and merges style', () => {
    render(
      <Button className="mine" style={{ color: 'red' }}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button.className).toBe('cck-button mine');
    expect(button.style.color).toBe('red');
  });

  it('puts ref on the element, as a plain prop', () => {
    const ref = createRef<HTMLButtonElement>();
    render(strict(<Button ref={ref}>Save</Button>));
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('passes native button props through and lets an undefined prop leave the default', () => {
    render(
      <Button type={undefined} name="n" value="v" form="f" aria-label="Close">
        x
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button.getAttribute('type')).toBe('button');
    expect(button.getAttribute('name')).toBe('n');
    expect(button.getAttribute('value')).toBe('v');
    expect(button.getAttribute('form')).toBe('f');
  });

  it('emits only declared data-* and the theme options, and logs no dev warning', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const allowed = new Set([...buttonMeta.dataAttrs.root, 'data-variant', 'data-cck-color', 'data-size']);
    const dataNames = (): string[] =>
      screen
        .getByRole('button')
        .getAttributeNames()
        .filter((name) => name.startsWith('data-'));
    const { rerender } = render(
      strict(
        <ThemeProvider themeConfig={testThemeConfig}>
          <Button disabled>Off</Button>
        </ThemeProvider>,
      ),
    );
    expect(dataNames().every((name) => allowed.has(name))).toBe(true);
    expect(dataNames()).toContain('data-disabled');
    rerender(strict(<Button>On</Button>));
    expect(dataNames()).toEqual([]);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});

describe('Button (keyboard and click)', () => {
  it('activates on click, Enter and Space, and Tab moves in and out', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      strict(
        <>
          <button>before</button>
          <Button onClick={onClick}>Go</Button>
          <button>after</button>
        </>,
      ),
    );
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Go' }));
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledTimes(3);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Go' }));
  });

  it('is disabled natively, skipped by Tab, and runs no click handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      strict(
        <>
          <button>before</button>
          <Button disabled onClick={onClick}>
            Off
          </Button>
          <button>after</button>
        </>,
      ),
    );
    const off = screen.getByRole('button', { name: 'Off' });
    expect((off as HTMLButtonElement).disabled).toBe(true);
    expect(off.getAttribute('data-disabled')).toBe('');
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'after' }));
    await user.click(off);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('runs the consumer onClickCapture first', async () => {
    const calls: string[] = [];
    render(
      <Button onClickCapture={() => calls.push('capture')} onClick={() => calls.push('click')}>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(calls).toEqual(['capture', 'click']);
  });
});

describe('Button (forms)', () => {
  function Form({ onSubmit, type }: { onSubmit: () => void; type?: 'submit' | 'reset' }): ReactElement {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <input aria-label="field" defaultValue="start" />
        <Button type={type}>Action</Button>
      </form>
    );
  }

  it('submits nothing by default', async () => {
    const onSubmit = vi.fn();
    render(<Form onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a real form with type="submit"', async () => {
    const onSubmit = vi.fn();
    render(<Form onSubmit={onSubmit} type="submit" />);
    await userEvent.click(screen.getByRole('button'));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('resets a real form with type="reset"', async () => {
    render(<Form onSubmit={vi.fn()} type="reset" />);
    const field = screen.getByLabelText('field');
    await userEvent.clear(field);
    await userEvent.type(field, 'changed');
    await userEvent.click(screen.getByRole('button'));
    expect((field as HTMLInputElement).value).toBe('start');
  });
});

type Submit = Mock<(event: ReactSubmitEvent<HTMLFormElement>) => void>;

/** A submit handler that stops jsdom from navigating. */
function onSubmit(): Submit {
  return vi.fn((event) => {
    event.preventDefault();
  });
}

/** The native submit event of the first call. */
function nativeEvent(handler: Submit): SubmitEvent {
  const event = handler.mock.calls.at(0)?.[0];
  if (!event) throw new Error('no submit');
  return event.nativeEvent;
}

function submitted(handler: Submit): FormData {
  const event = nativeEvent(handler);
  return new FormData(event.target as HTMLFormElement, event.submitter);
}

describe('Button in a real form', () => {
  it('submits an outside form through the form attribute', async () => {
    const handler = onSubmit();
    render(
      <>
        <form id="f" onSubmit={handler} />
        <Button type="submit" form="f">
          Go
        </Button>
      </>,
    );
    await userEvent.setup().click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('sends the submitter name and value', async () => {
    const handler = onSubmit();
    render(
      <form onSubmit={handler}>
        <Button type="submit" name="action" value="save">
          Save
        </Button>
        <Button type="submit" name="action" value="draft">
          Draft
        </Button>
      </form>,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Draft' }));
    expect(submitted(handler).get('action')).toBe('draft');
  });

  it('keeps the form* overrides on the element', async () => {
    const handler = onSubmit();
    render(
      <form action="/a" method="get" onSubmit={handler}>
        <Button type="submit" formAction="/b" formMethod="post" formTarget="_blank" formEncType="text/plain">
          Go
        </Button>
      </form>,
    );
    const button = screen.getByRole<HTMLButtonElement>('button');
    expect(button.getAttribute('formaction')).toBe('/b');
    expect(button.getAttribute('formmethod')).toBe('post');
    expect(button.getAttribute('formtarget')).toBe('_blank');
    expect(button.getAttribute('formenctype')).toBe('text/plain');
    await userEvent.setup().click(button);
    expect(nativeEvent(handler).submitter).toBe(button);
  });

  it('blocks submit on an invalid form and keeps formNoValidate', async () => {
    const handler = onSubmit();
    render(
      <form onSubmit={handler}>
        <input aria-label="Name" required />
        <Button type="submit">Go</Button>
        <Button type="submit" formNoValidate>
          Skip
        </Button>
      </form>,
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'Go' }));
    expect(handler).not.toHaveBeenCalled();
    // jsdom does not honour formnovalidate on click, so only the attribute is asserted.
    expect(screen.getByRole('button', { name: 'Skip' }).hasAttribute('formnovalidate')).toBe(true);
  });

  it('leaves a disabled submitter out of the submission and renders no hidden input', async () => {
    const handler = onSubmit();
    render(
      <form onSubmit={handler}>
        <input aria-label="Name" name="n" defaultValue="x" />
        <Button type="submit" name="action" value="save" disabled>
          Save
        </Button>
      </form>,
    );
    await userEvent.setup().click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
    const form = document.querySelector('form');
    if (!form) throw new Error('no form');
    expect(new FormData(form).has('action')).toBe(false);
    expect(form.querySelector('input[type="hidden"]')).toBeNull();
  });

  it('adds no hidden input for an enabled submitter', async () => {
    const handler = onSubmit();
    render(
      <form onSubmit={handler}>
        <Button type="submit" name="action" value="save">
          Save
        </Button>
      </form>,
    );
    await userEvent.setup().click(screen.getByRole('button'));
    expect(document.querySelector('input[type="hidden"]')).toBeNull();
    expect(document.querySelectorAll('form input')).toHaveLength(0);
  });

  describe('inside <fieldset disabled>', () => {
    const ui = (onClick: () => void, onLink: () => void): ReactElement => (
      <>
        <input aria-label="before" />
        <fieldset disabled>
          <Button onClick={onClick}>Go</Button>
          <Button nativeButton={false} render={<a href="#go" />} onClick={onLink}>
            Link
          </Button>
        </fieldset>
        <input aria-label="after" />
      </>
    );

    it('disables the button natively, without data-disabled', () => {
      render(ui(vi.fn(), vi.fn()));
      const button = screen.getByRole('button');
      expect(button.matches(':disabled')).toBe(true);
      expect(button.hasAttribute('disabled')).toBe(false);
      expect(button.hasAttribute('data-disabled')).toBe(false);
    });

    it('is skipped by Tab and Shift+Tab and fires no click', async () => {
      const onClick = vi.fn();
      render(ui(onClick, vi.fn()));
      const user = userEvent.setup();
      screen.getByLabelText('before').focus();
      await user.tab();
      expect(document.activeElement).not.toBe(screen.getByRole('button'));
      await user.tab({ shift: true });
      expect(document.activeElement).not.toBe(screen.getByRole('button'));
      await user.click(screen.getByRole('button'));
      screen.getByRole('button').focus();
      await user.keyboard('{Enter}');
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not disable a link: it stays focusable and activates', () => {
      const onLink = vi.fn();
      render(ui(vi.fn(), onLink));
      const link = screen.getByRole('link');
      expect(link.hasAttribute('aria-disabled')).toBe(false);
      expect(link.hasAttribute('data-disabled')).toBe(false);
      // user-event treats everything in a disabled fieldset as disabled, so drive the DOM directly.
      link.focus();
      expect(document.activeElement).toBe(link);
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      link.dispatchEvent(click);
      expect(onLink).toHaveBeenCalledTimes(1);
      expect(click.defaultPrevented).toBe(false);
    });
  });
});

describe('Button theme', () => {
  it('puts the theme attribute on every rendered part', () => {
    const { container } = render(
      <ThemeProvider themeConfig={allPartsConfig}>
        <Button>Save</Button>
      </ThemeProvider>,
    );
    for (const className of Object.values(buttonAnatomy.classes)) {
      const part = container.querySelector(`.${className}`);
      expect(part, className).not.toBeNull();
      expect(part?.getAttribute('data-probe'), className).toBe('on');
    }
  });
});

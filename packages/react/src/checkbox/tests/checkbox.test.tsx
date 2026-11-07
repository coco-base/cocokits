// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState, type ReactElement } from 'react';
import { afterEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { checkboxAnatomy } from '@cocokits/machines/checkbox';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/react-core';
import { Checkbox, type CheckboxChangeDetails } from '../index';
import { isSet, must, nextFrame, strict } from '../../internal/tests/choice-fixtures';
import { box, rootOf } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** A controlled checkbox whose parent accepts the change. */
function Accepting({ onEvent }: { readonly onEvent: (value: boolean, details: CheckboxChangeDetails) => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={(value, details) => {
        onEvent(value, details);
        setChecked(value);
      }}
    >
      Accept the terms
    </Checkbox>
  );
}

describe('Checkbox rendering', () => {
  it('renders the anatomy around a native checkbox with the label content', () => {
    render(strict(<Checkbox>Accept the terms</Checkbox>));
    const root = rootOf();
    expect(root.tagName).toBe('DIV');
    expect(
      root.querySelector('.cck-checkbox__wrapper > .cck-checkbox__input-wrapper > input.cck-checkbox__input'),
    ).toBe(box());
    expect(root.querySelector('.cck-checkbox__wrapper > label.cck-checkbox__label')?.textContent).toBe(
      'Accept the terms',
    );
    expect(box().type).toBe('checkbox');
    expect(isSet(box(), 'role')).toBe(false);
    for (const part of ['backdrop', 'background']) {
      expect(root.querySelector(`.cck-checkbox__${part}`)?.getAttribute('aria-hidden')).toBe('true');
    }
    expect(root.querySelector('.cck-checkbox__input-wrapper')?.hasAttribute('aria-hidden')).toBe(false);
    expect(root.querySelector('[aria-checked]')).toBeNull();
  });

  it('sends className, style and hidden to the root, and ref and the other attributes to the input', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Checkbox
        ref={ref}
        className="mine"
        style={{ color: 'red' }}
        hidden
        id="terms"
        name="terms"
        form="f"
        value="yes"
        aria-label="Terms"
        data-testid="x"
      />,
    );
    const input = must(document.querySelector('input'));
    const root = must(input.closest<HTMLElement>('.cck-checkbox'));
    expect(ref.current).toBe(input);
    expect(root.className).toBe('cck-checkbox mine');
    expect(root.style.color).toBe('red');
    expect(root.hidden).toBe(true);
    expect(isSet(root, 'data-hidden')).toBe(false);
    expect(input.id).toBe('terms');
    expect(input.name).toBe('terms');
    expect(input.getAttribute('form')).toBe('f');
    expect(input.value).toBe('yes');
    expect(input.getAttribute('aria-label')).toBe('Terms');
    expect(input.getAttribute('data-testid')).toBe('x');
    for (const name of ['id', 'name', 'form', 'aria-label', 'value', 'data-testid']) {
      expect(root.hasAttribute(name), name).toBe(false);
    }
  });

  it('replaces the root through render, keeps the parts and the element own ref, and gives the function the state', () => {
    const own = createRef<HTMLElement>();
    const seen = vi.fn();
    render(
      <>
        <Checkbox render={<section ref={own} data-testid="root" />}>One</Checkbox>
        <Checkbox
          defaultChecked
          render={(props, state) => {
            seen(state);
            return <p data-testid="fn" {...props} />;
          }}
        >
          Two
        </Checkbox>
      </>,
    );
    expect(screen.getByTestId('root').tagName).toBe('SECTION');
    expect(own.current).toBe(screen.getByTestId('root'));
    expect(screen.getByTestId('root').querySelector('label')?.textContent).toBe('One');
    expect(screen.getByTestId('fn').tagName).toBe('P');
    expect(screen.getByTestId('fn').querySelector('label')?.textContent).toBe('Two');
    expect(seen).toHaveBeenCalledWith(expect.objectContaining({ checked: true, indeterminate: false }));
  });

  it('puts the theme attribute of the checkbox anatomy on the root', () => {
    const config = defineThemeConfig({
      name: 'test',
      components: {
        [checkboxAnatomy.block]: {
          probe: { attrName: 'probe', values: ['on'], default: 'on', partNames: ['root'] },
        },
      },
    });
    render(
      <ThemeProvider themeConfig={config}>
        <Checkbox>Caption</Checkbox>
      </ThemeProvider>,
    );
    expect(rootOf().getAttribute('data-probe')).toBe('on');
  });

  it('renders disabled natively and as a fact, and required natively', () => {
    render(
      <Checkbox disabled required>
        Caption
      </Checkbox>,
    );
    expect(box().disabled).toBe(true);
    expect(box().required).toBe(true);
    expect(isSet(rootOf(), 'data-disabled')).toBe(true);
    expect(isSet(rootOf(), 'data-required')).toBe(true);
  });

  it('points the label at the input and generates an id when there is none', () => {
    render(<Checkbox>Caption</Checkbox>);
    expect(box().id).not.toBe('');
    expect(document.querySelector('label')?.getAttribute('for')).toBe(box().id);
    expect(box().labels?.length).toBe(1);
  });
});

describe('Checkbox change callback', () => {
  it('toggles an uncontrolled checkbox on a click, the label and Space, and emits user with the event', async () => {
    const onCheckedChange = vi.fn();
    render(strict(<Checkbox onCheckedChange={onCheckedChange}>Caption</Checkbox>));
    const user = userEvent.setup();
    await user.click(box());
    expect(box().checked).toBe(true);
    expect(isSet(rootOf(), 'data-checked')).toBe(true);
    expect(isSet(rootOf(), 'data-dirty')).toBe(true);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true, { reason: 'user', event: expect.any(Event) as Event });
    expect((onCheckedChange.mock.calls[0] as [boolean, { event: Event }])[1].event.type).toBe('change');
    await user.click(must(document.querySelector('label')));
    expect(box().checked).toBe(false);
    box().focus();
    await user.keyboard(' ');
    expect(box().checked).toBe(true);
    expect(onCheckedChange.mock.calls.map((call: unknown[]) => call[0])).toEqual([true, false, true]);
    expect(isSet(rootOf(), 'data-checked')).toBe(true);
  });

  it('starts from defaultChecked and carries the checked attribute', () => {
    render(<Checkbox defaultChecked>Caption</Checkbox>);
    expect(box().checked).toBe(true);
    expect(isSet(rootOf(), 'data-checked')).toBe(true);
  });

  it('follows an accepting parent, and emits nothing when the parent writes the value', async () => {
    const onEvent = vi.fn();
    const view = render(strict(<Accepting onEvent={onEvent} />));
    await userEvent.click(box());
    expect(box().checked).toBe(true);
    expect(isSet(rootOf(), 'data-checked')).toBe(true);
    expect(onEvent).toHaveBeenCalledTimes(1);

    const onCheckedChange = vi.fn();
    view.rerender(
      strict(
        <Checkbox checked={false} onCheckedChange={onCheckedChange}>
          Accept the terms
        </Checkbox>,
      ),
    );
    expect(box().checked).toBe(false);
    view.rerender(
      strict(
        <Checkbox checked onCheckedChange={onCheckedChange}>
          Accept the terms
        </Checkbox>,
      ),
    );
    expect(box().checked).toBe(true);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('restores a change the controlling parent rejects and keeps FormData', async () => {
    const onCheckedChange = vi.fn();
    render(
      <form data-testid="form">
        <Checkbox checked={false} name="a" onCheckedChange={onCheckedChange}>
          Caption
        </Checkbox>
      </form>,
    );
    await userEvent.click(box());
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'user' }));
    expect(box().checked).toBe(false);
    expect(isSet(rootOf(), 'data-checked')).toBe(false);
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).has('a')).toBe(false);
  });

  it('treats a null checked as the controlled unchecked value and does not echo it', () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox checked={null} onCheckedChange={onCheckedChange}>
        Caption
      </Checkbox>,
    );
    expect(box().checked).toBe(false);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('runs the native onChange and onClick of the author before its own handlers', async () => {
    const order: string[] = [];
    render(
      <Checkbox
        onClick={() => order.push('click')}
        onChange={() => order.push('change')}
        onCheckedChange={() => order.push('checked')}
      >
        Caption
      </Checkbox>,
    );
    await userEvent.click(box());
    expect(order).toEqual(['click', 'change', 'checked']);
  });
});

describe('Checkbox indeterminate', () => {
  it('renders the mixed fact, sets the DOM property after mount, and the prop wins after a click', async () => {
    const onCheckedChange = vi.fn();
    const view = render(
      strict(
        <Checkbox indeterminate onCheckedChange={onCheckedChange}>
          All
        </Checkbox>,
      ),
    );
    expect(isSet(rootOf(), 'data-indeterminate')).toBe(true);
    expect(box().indeterminate).toBe(true);
    await userEvent.click(box());
    expect(box().checked).toBe(true);
    expect(box().indeterminate).toBe(true);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    view.rerender(strict(<Checkbox onCheckedChange={onCheckedChange}>All</Checkbox>));
    expect(box().indeterminate).toBe(false);
    expect(isSet(rootOf(), 'data-indeterminate')).toBe(false);
  });

  it('stays mixed after repeated clicks while the parent does not change it', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Checkbox checked={false} indeterminate onCheckedChange={onCheckedChange}>
        All
      </Checkbox>,
    );
    const user = userEvent.setup();
    await user.click(box());
    expect(box().indeterminate).toBe(true);
    await user.click(box());
    expect(box().indeterminate).toBe(true);
    expect(box().checked).toBe(false);
    expect(onCheckedChange).toHaveBeenCalledTimes(2);
    expect(isSet(rootOf(), 'data-indeterminate')).toBe(true);
  });

  it('lets the parent that owns the mixed state recompute it in the handler', async () => {
    function SelectAll(): ReactElement {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          checked={checked}
          indeterminate={!checked}
          onCheckedChange={(value) => {
            setChecked(value);
          }}
        >
          All
        </Checkbox>
      );
    }
    render(<SelectAll />);
    expect(box().indeterminate).toBe(true);
    await userEvent.click(box());
    expect(box().checked).toBe(true);
    expect(box().indeterminate).toBe(false);
    expect(isSet(rootOf(), 'data-indeterminate')).toBe(false);
  });

  it('leaves the property at the prop after a form reset', async () => {
    render(
      <form data-testid="form">
        <Checkbox indeterminate>All</Checkbox>
      </form>,
    );
    await userEvent.click(box());
    screen.getByTestId<HTMLFormElement>('form').reset();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(box().indeterminate).toBe(true);
  });
});

describe('Checkbox read-only', () => {
  it.each([
    ['uncontrolled', { defaultChecked: true }],
    ['controlled', { checked: true }],
  ])('blocks every user toggle when %s, stays focusable and submits', async (_name, props) => {
    const onCheckedChange = vi.fn();
    render(
      <form data-testid="form">
        <Checkbox readOnly name="a" onCheckedChange={onCheckedChange} {...props}>
          Caption
        </Checkbox>
      </form>,
    );
    const user = userEvent.setup();
    expect(box().getAttribute('aria-readonly')).toBe('true');
    expect(isSet(rootOf(), 'data-readonly')).toBe(true);
    await user.click(box());
    await user.click(must(document.querySelector('label')));
    box().focus();
    await user.keyboard(' ');
    await user.click(box());
    expect(box().checked).toBe(true);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(box());
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).get('a')).toBe('on');
  });

  it('toggles and emits again once the read-only is lifted', async () => {
    const onCheckedChange = vi.fn();
    const view = render(
      <Checkbox readOnly onCheckedChange={onCheckedChange}>
        Caption
      </Checkbox>,
    );
    await userEvent.click(box());
    expect(box().checked).toBe(false);
    view.rerender(<Checkbox onCheckedChange={onCheckedChange}>Caption</Checkbox>);
    await userEvent.click(box());
    expect(box().checked).toBe(true);
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });
});

describe('Checkbox facts', () => {
  it('renders aria-invalid only after the control was touched, or the form submitted', async () => {
    render(
      <Checkbox invalid pending>
        Caption
      </Checkbox>,
    );
    expect(isSet(box(), 'aria-invalid')).toBe(false);
    expect(isSet(rootOf(), 'data-invalid')).toBe(true);
    expect(isSet(rootOf(), 'data-pending')).toBe(true);
    await userEvent.click(box());
    expect(isSet(box(), 'aria-invalid')).toBe(false);
    await userEvent.tab();
    expect(box().getAttribute('aria-invalid')).toBe('true');
    expect(isSet(rootOf(), 'data-touched')).toBe(true);
    expect(isSet(rootOf(), 'data-focused')).toBe(false);
  });

  it('takes touched, dirty and submitted from the props when they are given', () => {
    render(
      <Checkbox invalid touched dirty submitted>
        Caption
      </Checkbox>,
    );
    expect(box().getAttribute('aria-invalid')).toBe('true');
    for (const name of ['touched', 'dirty', 'submitted']) expect(isSet(rootOf(), `data-${name}`), name).toBe(true);
  });

  it('shows focus as a fact and steals no focus on mount', async () => {
    render(<Checkbox>Caption</Checkbox>);
    expect(document.activeElement).toBe(document.body);
    await userEvent.tab();
    expect(document.activeElement).toBe(box());
    expect(isSet(rootOf(), 'data-focused')).toBe(true);
  });
});

describe('Checkbox accessible name warning', () => {
  const warned = (warn: MockInstance): boolean =>
    warn.mock.calls.some(([text]: unknown[]) => String(text).includes('has no accessible name'));

  it('warns for an empty label part with no other name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<Checkbox />);
    await nextFrame();
    expect(warned(warn)).toBe(true);
  });

  it.each([
    ['content', <Checkbox key="a">Caption</Checkbox>],
    ['aria-label', <Checkbox key="b" aria-label="Name" />],
    ['aria-labelledby', <Checkbox key="c" aria-labelledby="x" />],
    ['title', <Checkbox key="d" title="Name" />],
  ])('does not warn with %s', async (_name, ui) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(ui);
    await nextFrame();
    expect(warned(warn)).toBe(false);
  });

  it('does not warn when a label outside points at the id', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <>
        <label htmlFor="mine">Outside</label>
        <Checkbox id="mine" />
      </>,
    );
    await nextFrame();
    expect(warned(warn)).toBe(false);
  });
});

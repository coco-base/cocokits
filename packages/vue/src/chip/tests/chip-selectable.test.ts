// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { cleanup, screen } from '@testing-library/vue';
import { createSSRApp, h, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { chipMeta } from '@cocokits/machines/chip';
import { mountView, pick } from '../../internal/tests/mount-helpers';
import { Chip } from '../index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const toggle = (): HTMLButtonElement => pick(document.body, '.cck-chip__content-wrapper') as HTMLButtonElement;

describe('Selectable chip (chip-01)', () => {
  it('renders the content as a toggle button with aria-pressed and a check while selectable', () => {
    mountView(() => h(Chip, { selected: false, 'onUpdate:selected': () => undefined }, () => 'Pizza'));
    expect(toggle().tagName).toBe('BUTTON');
    expect(toggle().type).toBe('button');
    expect(toggle().getAttribute('aria-pressed')).toBe('false');
    expect(toggle().hasAttribute('data-selected')).toBe(false);
    const check = pick(document.body, '.cck-chip__check');
    expect(check.getAttribute('aria-hidden')).toBe('true');
    expect(check.hasAttribute('data-state')).toBe(false);
    expect(check.querySelector('.cck-svg-icon')?.getAttribute('data-icon')).toBe('check');
    expect(screen.getByRole('button', { name: 'Pizza' })).toBe(toggle());
  });

  it('renders a plain span and no check while selected is not set', () => {
    mountView(() => h(Chip, null, () => 'Pizza'));
    expect(toggle().tagName).toBe('SPAN');
    expect(toggle().hasAttribute('aria-pressed')).toBe(false);
    expect(document.querySelector('.cck-chip__check')).toBeNull();
  });

  it.each([
    { name: 'selected', props: { selected: true } },
    { name: 'defaultSelected', props: { defaultSelected: true } },
  ])('marks a selected chip with $name: data-selected, aria-pressed true, checked check', ({ props }) => {
    mountView(() => h(Chip, { ...props, 'onUpdate:selected': () => undefined }, () => 'Pizza'));
    expect(toggle().getAttribute('aria-pressed')).toBe('true');
    expect(toggle().hasAttribute('data-selected')).toBe(true);
    expect(pick(document.body, '.cck-chip__check').getAttribute('data-state')).toBe('checked');
  });

  it('toggles with a click, Enter and Space, and the label never changes', async () => {
    const onUpdate = vi.fn();
    mountView(() => h(Chip, { defaultSelected: false, 'onUpdate:selected': onUpdate }, () => 'Pizza'));
    await userEvent.click(toggle());
    expect(onUpdate).toHaveBeenLastCalledWith(true);
    expect(toggle().getAttribute('aria-pressed')).toBe('true');
    toggle().focus();
    await userEvent.keyboard('{Enter}');
    expect(onUpdate).toHaveBeenLastCalledWith(false);
    await userEvent.keyboard(' ');
    expect(onUpdate).toHaveBeenLastCalledWith(true);
    expect(onUpdate).toHaveBeenCalledTimes(3);
    expect(toggle().textContent).toBe('Pizza');
  });

  it('follows a bound selected and keeps the old value when the parent ignores the update', async () => {
    const selected = ref(false);
    mountView(() => h(Chip, { selected: selected.value, 'onUpdate:selected': () => undefined }, () => 'Pizza'));
    await userEvent.click(toggle());
    expect(toggle().getAttribute('aria-pressed')).toBe('false');
    selected.value = true;
    cleanup();
    mountView(() => h(Chip, { selected: selected.value, 'onUpdate:selected': () => undefined }, () => 'Pizza'));
    expect(toggle().getAttribute('aria-pressed')).toBe('true');
  });

  it('puts the remove button next to the toggle, never inside it, and names it "Remove Pizza"', () => {
    mountView(() => h(Chip, { defaultSelected: false, removable: true }, () => 'Pizza'));
    const remove = pick(document.body, '.cck-chip__remove');
    expect(toggle().contains(remove)).toBe(false);
    expect(remove.parentElement).toBe(toggle().parentElement);
    expect(screen.getByRole('button', { name: 'Remove Pizza' })).toBe(remove);
  });

  it('renders a disabled toggle and no remove button while disabled', async () => {
    const onUpdate = vi.fn();
    mountView(() =>
      h(
        Chip,
        { defaultSelected: false, removable: true, disabled: true, 'onUpdate:selected': onUpdate },
        () => 'Pizza',
      ),
    );
    expect(toggle().disabled).toBe(true);
    expect(document.querySelector('.cck-chip__remove')).toBeNull();
    await userEvent.click(toggle());
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { container } = mountView(() => h(Chip, { defaultSelected: true, removable: true }, () => 'Pizza'));
    expect((await axe(container)).violations).toEqual([]);
  });

  it('lists the check among the parts of the meta', () => {
    expect(Object.keys(chipMeta.dataAttrs)).toContain('check');
  });
});

describe('Chip remove name (chip-08)', () => {
  it.each([
    { name: 'the default "Remove <text>"', props: {}, label: 'Remove', labelledBy: true, accessible: 'Remove Pizza' },
    {
      name: 'removeLabel replaces the whole name',
      props: { removeLabel: 'Delete pizza' },
      label: 'Delete pizza',
      labelledBy: false,
      accessible: 'Delete pizza',
    },
    {
      name: 'an empty removeLabel counts as not set',
      props: { removeLabel: '' },
      label: 'Remove',
      labelledBy: true,
      accessible: 'Remove Pizza',
    },
  ])('$name', ({ props, label, labelledBy, accessible }) => {
    mountView(() => h(Chip, { removable: true, ...props }, () => 'Pizza'));
    const remove = pick(document.body, '.cck-chip__remove');
    expect(remove.getAttribute('aria-label')).toBe(label);
    expect(remove.hasAttribute('aria-labelledby')).toBe(labelledBy);
    expect(screen.getByRole('button', { name: accessible })).toBe(remove);
  });
});

describe('Selectable chip on the server', () => {
  const render = (props: Record<string, unknown>): Promise<string> =>
    renderToString(createSSRApp({ render: () => h(Chip, { id: 'c', ...props }, () => 'Pizza') }));

  it('renders the toggle, the check and the named remove button', async () => {
    const html = await render({ defaultSelected: true, removable: true });
    const content = /<button\b[^>]*cck-chip__content-wrapper[^>]*>/.exec(html)?.[0] ?? '';
    expect(content).toContain('aria-pressed="true"');
    expect(content).toMatch(/\sdata-selected(?=[\s>=])/);
    expect(content).toContain('type="button"');
    expect(html).toContain('class="cck-chip__check"');
    expect(html).toContain('data-state="checked"');
    expect(html).toContain('aria-labelledby="c-remove c-content"');
  });

  it('hydrates without a warning and keeps working', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const make = () =>
      createSSRApp({ render: () => h(Chip, { id: 'c', defaultSelected: false, removable: true }, () => 'Pizza') });
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(make());
    const app = make();
    app.mount(container);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    await userEvent.click(toggle());
    expect(toggle().getAttribute('aria-pressed')).toBe('true');
    app.unmount();
  });
});

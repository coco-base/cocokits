import { signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { avatarLabelAnatomy } from '@cocokits/machines/avatar-label';
import { describe, expect, it } from 'vitest';
import { CckAvatarImports } from '@cocokits/angular/avatar';
import { CckAvatarLabel, CckAvatarLabelImports } from '../index';

const imports = [...CckAvatarLabelImports, ...CckAvatarImports];

const avatar = `<cck-avatar id="av"><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>`;

function root(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('.cck-avatar-label');
  if (!el) throw new Error('no label rendered');
  return el;
}

describe('CckAvatarLabel', () => {
  it('renders the avatar first, then the text with the name and the description', async () => {
    const { container } = await render(
      `<cck-avatar-label name="Ada Lovelace" description="Mathematician">${avatar}</cck-avatar-label>`,
      { imports },
    );
    const el = root(container);
    expect(el.tagName).toBe('CCK-AVATAR-LABEL');
    expect(el.className).toBe(avatarLabelAnatomy.classes.root);
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.hasAttribute('name')).toBe(false);
    expect(el.hasAttribute('description')).toBe(false);
    expect(Array.from(el.children, (c) => c.className)).toEqual(['cck-avatar', 'cck-avatar-label__text']);
    const text = el.querySelector('.cck-avatar-label__text');
    expect(text?.tagName).toBe('SPAN');
    expect(Array.from(text?.children ?? [], (c) => [c.tagName, c.className, c.textContent])).toEqual([
      ['SPAN', 'cck-avatar-label__name', 'Ada Lovelace'],
      ['SPAN', 'cck-avatar-label__description', 'Mathematician'],
    ]);
  });

  it('leaves out the text when neither is set', async () => {
    const { container } = await render(`<cck-avatar-label name="" description="">${avatar}</cck-avatar-label>`, {
      imports,
    });
    expect(container.querySelector('.cck-avatar-label__text')).toBeNull();
  });

  it('leaves out the description when it is empty', async () => {
    const { container } = await render(`<cck-avatar-label name="Ada">${avatar}</cck-avatar-label>`, { imports });
    expect(container.querySelector('.cck-avatar-label__name')?.textContent).toBe('Ada');
    expect(container.querySelector('.cck-avatar-label__description')).toBeNull();
  });

  it('shows only the description when there is no name', async () => {
    const { container } = await render(`<cck-avatar-label description="Mathematician"></cck-avatar-label>`, {
      imports,
    });
    expect(container.querySelector('.cck-avatar-label__name')).toBeNull();
    expect(container.querySelector('.cck-avatar-label__description')?.textContent).toBe('Mathematician');
  });

  it('reacts to changes of the name and the description', async () => {
    const name = signal<string | undefined>('Ada');
    const { container, fixture } = await render(
      `<cck-avatar-label [name]="name()" description="x"></cck-avatar-label>`,
      { imports, componentProperties: { name } },
    );
    expect(container.querySelector('.cck-avatar-label__name')?.textContent).toBe('Ada');
    name.set(undefined);
    await fixture.whenStable();
    expect(container.querySelector('.cck-avatar-label__name')).toBeNull();
  });

  it('sends id, class, role and aria attributes of the author to the root', async () => {
    const { container } = await render(
      `<cck-avatar-label id="l" class="mine" role="group" aria-label="Author" name="Ada">${avatar}</cck-avatar-label>`,
      { imports },
    );
    const el = container.querySelector<HTMLElement>('#l');
    expect(el?.className).toContain('mine');
    expect(el?.className).toContain('cck-avatar-label');
    expect(el?.getAttribute('role')).toBe('group');
    expect(el?.getAttribute('aria-label')).toBe('Author');
  });

  it('exports the component under the exportAs name', async () => {
    const { fixture } = await render(`<cck-avatar-label #l="cckAvatarLabel"></cck-avatar-label>`, { imports });
    expect(fixture.debugElement.children[0]?.injector.get(CckAvatarLabel)).toBeInstanceOf(CckAvatarLabel);
  });

  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckAvatarLabel></div>`, { imports });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});

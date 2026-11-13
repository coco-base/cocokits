import { render } from '@testing-library/angular';
import { avatarGroupAnatomy } from '@cocokits/machines/avatar-group';
import { describe, expect, it } from 'vitest';
import { CckAvatarImports } from '../../avatar';
import { CckAvatarGroup, CckAvatarGroupImports } from '../index';

const imports = [...CckAvatarGroupImports, ...CckAvatarImports];

describe('CckAvatarGroup', () => {
  it('renders the anatomy class on a cck-avatar-group, with no role and no inline style', async () => {
    const { container } = await render(`<cck-avatar-group></cck-avatar-group>`, { imports });
    const root = container.querySelector<HTMLElement>('.cck-avatar-group');
    expect(root?.tagName).toBe('CCK-AVATAR-GROUP');
    expect(root?.className).toBe(avatarGroupAnatomy.classes.root);
    expect(root?.hasAttribute('role')).toBe(false);
    expect(root?.hasAttribute('style')).toBe(false);
  });

  it('keeps its children in order', async () => {
    const { container } = await render(
      `<cck-avatar-group>
         <cck-avatar id="a"><cck-avatar-fallback>A</cck-avatar-fallback></cck-avatar>
         <cck-avatar id="b"><cck-avatar-fallback>B</cck-avatar-fallback></cck-avatar>
         <cck-avatar id="c"><cck-avatar-fallback>C</cck-avatar-fallback></cck-avatar>
       </cck-avatar-group>`,
      { imports },
    );
    const root = container.querySelector('.cck-avatar-group');
    expect(Array.from(root?.children ?? [], (c) => c.id)).toEqual(['a', 'b', 'c']);
  });

  it('sends id, class, role and aria attributes of the author to the root', async () => {
    const { container } = await render(
      `<cck-avatar-group id="team" class="mine" role="group" aria-label="Team"></cck-avatar-group>`,
      { imports },
    );
    const root = container.querySelector<HTMLElement>('#team');
    expect(root?.className).toContain('mine');
    expect(root?.className).toContain('cck-avatar-group');
    expect(root?.getAttribute('role')).toBe('group');
    expect(root?.getAttribute('aria-label')).toBe('Team');
  });

  it('exports the directive under the exportAs name', async () => {
    const { fixture } = await render(`<cck-avatar-group #g="cckAvatarGroup"></cck-avatar-group>`, { imports });
    expect(fixture.debugElement.children[0]?.injector.get(CckAvatarGroup)).toBeInstanceOf(CckAvatarGroup);
  });

  it('creates no part from the attribute form on another element', async () => {
    const { container } = await render(`<div cckAvatarGroup></div>`, { imports });
    expect(container.querySelector('[class*="cck-"]')).toBeNull();
  });
});

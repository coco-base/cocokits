import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { badgeContainerMeta } from '@cocokits/machines/badge-container';
import { badgeMeta } from '@cocokits/machines/badge';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { CckBadgeContainerImports } from '../../badge-container';
import { CckButtonImports } from '../../button';
import { CckBadgeImports } from '../index';

const imports = [...CckBadgeImports, ...CckBadgeContainerImports, ...CckButtonImports];

describe('Badge accessibility', () => {
  it('becomes part of the button name', async () => {
    await render(`<button cckButton>Inbox <span cckBadge [content]="5"></span></button>`, {
      imports,
    });
    expect(screen.getByRole('button', { name: 'Inbox 5' })).toBeTruthy();
  });

  it('reads a truncated badge as "99 +"', async () => {
    await render(`<button cckButton>Inbox <span cckBadge [content]="120" [max]="99"></span></button>`, { imports });
    expect(screen.getByRole('button', { name: /Inbox 99\s*\+/ })).toBeTruthy();
  });

  it.each([
    ['badge', `<span cckBadge [content]="5"></span>`],
    ['empty', `<span cckBadge></span>`],
    ['truncated', `<span cckBadge [content]="120" [max]="99"></span>`],
    ['hidden', `<span cckBadge [content]="5" hide></span>`],
    ['badge in a button', `<button cckButton>Inbox <span cckBadge [content]="5"></span></button>`],
    [
      'container with an icon-only button',
      `<div cckBadgeContainer><button cckButton aria-label="Notifications, 2 new"><svg aria-hidden="true" width="8" height="8"></svg></button><span cckBadge></span></div>`,
    ],
  ])('has no axe violations: %s', async (_name, template) => {
    const { container } = await render(template, { imports });
    expect((await axe(container)).violations).toEqual([]);
  });

  it('adds no role, aria-* or tabindex to the badge or the container', async () => {
    const { container } = await render(
      `<div cckBadgeContainer><button cckButton>Inbox</button><span cckBadge [content]="120" [max]="99"></span></div>`,
      { imports },
    );
    for (const el of container.querySelectorAll('.cck-badge, .cck-badge *, .cck-badge-container')) {
      const names = Array.from(el.attributes, (a) => a.name);
      expect(names.filter((n) => n === 'role' || n === 'tabindex' || n.startsWith('aria-'))).toEqual([]);
    }
  });

  it('is not tabbable and leaves the Tab order of a Button unchanged', async () => {
    await render(
      `<button cckButton id="a">Inbox <span cckBadge [content]="5"></span></button><button cckButton id="b">Next</button>`,
      { imports },
    );
    const user = userEvent.setup();
    await user.tab();
    expect(document.activeElement?.id).toBe('a');
    await user.tab();
    expect(document.activeElement?.id).toBe('b');
    await user.tab();
    expect(document.activeElement?.closest('.cck-badge')).toBeNull();
  });

  it('emits only the data-* the metas declare, on every part', async () => {
    const { container } = await render(
      `<span cckBadge [content]="1"></span><span cckBadge hide></span>
       <div cckBadgeContainer position="bottom-left"><span cckBadge [content]="120" [max]="99"></span></div>`,
      { imports },
    );
    const declared: Record<string, readonly string[]> = {
      'cck-badge': badgeMeta.dataAttrs.root,
      'cck-badge__content': badgeMeta.dataAttrs.content,
      'cck-badge__max-indicator': badgeMeta.dataAttrs.maxIndicator,
      'cck-badge-container': badgeContainerMeta.dataAttrs.root,
    };
    for (const [cls, allowed] of Object.entries(declared)) {
      const els = container.querySelectorAll(`.${cls}`);
      expect(els.length).toBeGreaterThan(0);
      for (const el of els) {
        const names = Array.from(el.attributes, (a) => a.name).filter((n) => n.startsWith('data-'));
        expect(names.every((n) => allowed.includes(n))).toBe(true);
      }
    }
  });
});

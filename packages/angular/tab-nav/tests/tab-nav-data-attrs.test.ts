import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { tabNavAnatomy, tabNavMeta } from '@cocokits/machines/tab-nav';
import { describe, expect, it } from 'vitest';
import { CckTabNavImports } from '../index';

describe('TabNav data attributes', () => {
  it('only emits data-* declared in the meta, on every part', async () => {
    const user = userEvent.setup();
    await render(
      `<nav cckTabNav aria-label="Project">
        <a cckTabNavLink href="#a" [active]="true">A</a>
        <a cckTabNavLink href="#b" disabled>B</a>
      </nav>`,
      { imports: [...CckTabNavImports] },
    );
    await user.tab();
    const declared: Readonly<Record<string, readonly string[]>> = tabNavMeta.dataAttrs;
    let checked = 0;
    for (const [part, allowed] of Object.entries(declared)) {
      for (const el of document.querySelectorAll(`.${(tabNavAnatomy.classes as Record<string, string>)[part]}`)) {
        const names = Array.from(el.attributes, (a) => a.name).filter((n) => n.startsWith('data-'));
        expect(
          names.filter((n) => !allowed.includes(n)),
          part,
        ).toEqual([]);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(1);
  });
});

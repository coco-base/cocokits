import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { tabsAnatomy, tabsMeta } from '@cocokits/machines/tabs';
import { describe, expect, it } from 'vitest';
import { CckTabsImports } from '../index';

describe('Tabs data attributes', () => {
  it('only emits data-* declared in the meta, on every part', async () => {
    const user = userEvent.setup();
    await render(
      `<cck-tabs aria-label="Settings">
        <cck-tab label="A">A body</cck-tab>
        <cck-tab label="B" disabled>B body</cck-tab>
      </cck-tabs>`,
      { imports: [...CckTabsImports] },
    );
    await user.tab();
    const declared: Readonly<Record<string, readonly string[]>> = tabsMeta.dataAttrs;
    let checked = 0;
    for (const [part, allowed] of Object.entries(declared)) {
      for (const el of document.querySelectorAll(`.${(tabsAnatomy.classes as Record<string, string>)[part]}`)) {
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

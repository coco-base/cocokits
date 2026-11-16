// @vitest-environment node
import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { attrIn, rootOf, rows, values } from './inherit-cases';
import { renderThemedApp } from './ssr-helpers';

describe.each(rows.map((row) => ({ name: `${row.child} ${row.option} from ${row.parent}`, row })))(
  'group inheritance on the server: $name',
  ({ row }) => {
    const v = values[row.option];
    const attr = async (parent: string | null | undefined, own: string | null | undefined): Promise<string | null> =>
      attrIn(await renderThemedApp(rootOf(row, parent, own), true), row);

    it('renders the value of the parent in the server HTML', async () => {
      expect(await attr(v.parent, undefined)).toBe(v.parent);
    });

    it('renders its own value over the parent', async () => {
      expect(await attr(v.parent, v.own)).toBe(v.own);
    });

    it('renders no attribute for an own null, and none when the parent is null', async () => {
      expect(await attr(v.parent, null)).toBeNull();
      expect(await attr(null, undefined)).toBeNull();
    });
  },
);

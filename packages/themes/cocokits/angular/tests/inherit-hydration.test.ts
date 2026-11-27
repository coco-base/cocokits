import { ApplicationRef, destroyPlatform } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { attrIn, dataAttrsIn, rootOf, rows, values } from './inherit-cases';
import { providers } from './helpers';

afterEach(() => {
  destroyPlatform();
  delete (globalThis as { ngServerMode?: boolean }).ngServerMode;
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe.each(rows.map((row) => ({ name: `${row.child} ${row.option} from ${row.parent}`, row })))(
  'group inheritance hydration: $name',
  ({ row }) => {
    const v = values[row.option];

    it.each([
      { label: 'the parent value', parent: v.parent, own: undefined, expected: v.parent },
      { label: 'an own value over the parent', parent: v.parent, own: v.own, expected: v.own },
      { label: 'an own null', parent: v.parent, own: null, expected: null },
    ])('keeps $label unchanged after hydration', async ({ parent, own, expected }) => {
      const Root = rootOf(row, parent, own);
      const server = await renderApplication(
        (context) =>
          bootstrapApplication(
            Root,
            { providers: [provideServerRendering(), provideClientHydration(), ...providers] },
            context,
          ),
        { document: '<html><body><app-root></app-root></body></html>' },
      );
      destroyPlatform();
      expect(attrIn(server, row)).toBe(expected);

      (globalThis as { ngServerMode?: boolean }).ngServerMode = false;
      document.body.innerHTML = new DOMParser().parseFromString(server, 'text/html').body.innerHTML;
      const logged: unknown[][] = [];
      for (const method of ['error', 'warn'] as const) {
        vi.spyOn(console, method).mockImplementation((...args: unknown[]) => void logged.push(args));
      }

      const app = await bootstrapApplication(Root, { providers: [provideClientHydration(), ...providers] });
      await app.injector.get(ApplicationRef).whenStable();

      expect(logged).toEqual([]);
      expect(dataAttrsIn(document.body.innerHTML)).toEqual(dataAttrsIn(server.slice(server.indexOf('<body'))));
      expect(attrIn(document.body.innerHTML, row)).toBe(expected);
      app.destroy();
    });
  },
);

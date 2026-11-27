import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** The roots, the Dialog options and the triggers of the overlays whose content is an `ng-template` that a trigger names. */
const FILES = [
  'menu/menu.ts',
  'menu/menu-trigger.ts',
  'menu/menu-sub-trigger.ts',
  'popover/popover.ts',
  'popover/popover-trigger.ts',
  'tooltip/tooltip.ts',
  'tooltip/tooltip-trigger.ts',
  'dialog/dialog-root.ts',
  'dialog/dialog-trigger.ts',
  'dialog/dialog-options.ts',
];

/** The content parts: each one is written in a template. */
const CONTENT = /<cck-(?:menu|menu-sub|popover|tooltip)-content\b|<dialog cckDialogContent\b/;

/** The `@example` blocks of a source file, without the comment stars. */
function examplesOf(source: string): string[] {
  return [...source.matchAll(/\/\*\*([\s\S]*?)\*\//g)].flatMap(([, comment]) =>
    comment
      .split(/^\s*\* @example\s*$/m)
      .slice(1)
      .map((block) =>
        block
          .split(/^\s*\* @\w+/m)[0]
          .split('\n')
          .map((line) => line.replace(/^\s*\* ?/, ''))
          .join('\n')
          .trim(),
      ),
  );
}

describe.each(FILES)('the examples of %s', (file) => {
  const examples = examplesOf(readFileSync(join(import.meta.dirname, '..', file), 'utf8'));

  it('has examples', () => {
    expect(examples.length).toBeGreaterThan(0);
  });

  it('leaves no placeholder for the content of an element', () => {
    for (const example of examples) expect(example, example).not.toMatch(/\.\.\.|…/);
  });

  it('writes each content in an ng-template that a trigger in the example names', () => {
    for (const example of examples.filter((text) => CONTENT.test(text) || text.includes('<ng-template'))) {
      const templates = [...example.matchAll(/<ng-template #(\w+)>/g)].map(([, name]) => name);
      expect(templates, example).not.toEqual([]);
      for (const name of templates)
        expect(example, example).toMatch(new RegExp(`\\[cck(?:Menu|Popover|Tooltip|Dialog)TriggerFor\\]="${name}"`));
      const firstTemplate = example.indexOf('<ng-template');
      expect(example.search(CONTENT), example).toBeGreaterThan(firstTemplate);
      expect(firstTemplate, example).toBeGreaterThan(-1);
    }
  });
});

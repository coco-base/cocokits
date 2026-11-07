import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

/**
 * A template compiled with `strictTemplates` rejects `value` on a `[formField]` control with a `checked` model
 * and accepts `submitValue`. This test detects Angular releases that change that contract.
 * The scratch folder is below an ignored `tmp/` folder.
 */
const REPO = resolve(import.meta.dirname, '..', '..', '..', '..');
const TMP = join(REPO, 'tmp', 'angular-strict-template');

const posix = (path: string): string => path.split('\\').join('/');

function compile(name: string, element: string, selector: string, cls: string): { ok: boolean; output: string } {
  const dir = join(TMP, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'host.ts'),
    `import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { ${cls} } from '@cocokits/angular/${selector}';

@Component({
  selector: 'spike-host',
  imports: [FormField, ${cls}],
  template: \`${element}\`,
})
export class SpikeHost {
  readonly f = form(signal({ terms: false }));
}
`,
  );
  writeFileSync(
    join(dir, 'tsconfig.json'),
    JSON.stringify({
      extends: posix(join(REPO, 'tsconfig.base.json')),
      compilerOptions: {
        strict: true,
        types: [],
        skipLibCheck: true,
        noEmit: true,
        experimentalDecorators: true,
        rootDir: posix(REPO),
      },
      include: ['host.ts'],
      angularCompilerOptions: { strictTemplates: true, strictInjectionParameters: true },
    }),
  );
  const script = join(REPO, 'node_modules', '@angular', 'compiler-cli', 'bundles', 'src', 'bin', 'ngc.js');
  const result = spawnSync(process.execPath, [script, '-p', join(dir, 'tsconfig.json')], {
    cwd: dirname(join(dir, 'tsconfig.json')),
    encoding: 'utf8',
  });
  return { ok: result.status === 0, output: `${result.stdout}${result.stderr}` };
}

/** Each case runs the Angular compiler on a scratch project, which takes seconds and more under load. */
const COMPILE_TIMEOUT = 120_000;

describe('strict template checking of a [formField] choice control', { timeout: COMPILE_TIMEOUT }, () => {
  afterAll(() => {
    rmSync(TMP, { recursive: true, force: true });
  });

  it.each([
    ['cckCheckbox', 'checkbox', 'CckCheckbox'],
    ['cckSwitch', 'switch', 'CckSwitch'],
  ])('compiles %s with [formField] and submitValue', (selector, entry, cls) => {
    const result = compile(
      `ok-${entry}`,
      `<div ${selector} [formField]="f.terms" submitValue="yes">Accept</div>`,
      entry,
      cls,
    );
    expect(result.output).toBe('');
    expect(result.ok).toBe(true);
  });

  it.each([
    ['cckCheckbox', 'checkbox', 'CckCheckbox'],
    ['cckSwitch', 'switch', 'CckSwitch'],
  ])('rejects a value on %s with [formField]', (selector, entry, cls) => {
    const result = compile(
      `bad-${entry}`,
      `<div ${selector} [formField]="f.terms" value="yes">Accept</div>`,
      entry,
      cls,
    );
    expect(result.ok).toBe(false);
    expect(result.output).toMatch(/NG8022/);
  });
});

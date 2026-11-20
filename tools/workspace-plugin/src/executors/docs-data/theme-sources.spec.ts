import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import executor from './executor';

let dir = '';

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'docs-data-sources-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function write(path: string, content: string): void {
  mkdirSync(dirname(join(dir, path)), { recursive: true });
  writeFileSync(join(dir, path), content);
}

/** A fake theme core (`packages/t`) with the given components, each with one `size` option. */
function theme(components: string[]): void {
  const option = `{ attrName: 'size', values: ['sm'], default: 'sm' }`;
  const entries = components.map((name) => `'${name}': { size: ${option} }`).join(', ');
  write(
    'packages/t/package.json',
    JSON.stringify({ type: 'module', exports: { '.': { default: './dist/index.js' } } }),
  );
  write(
    'packages/t/dist/index.js',
    `export const moodThemeConfig = { name: 'mood', components: { ${entries} } };\nexport const modeCollections = [];\n`,
  );
}

async function sourceFiles(): Promise<unknown> {
  const context = {
    root: dir,
    projectName: 'theme-mood',
    projectsConfigurations: { projects: { 'theme-mood': { root: 'packages/t' } } },
  } as never;
  expect((await executor({ source: 'theme' }, context)).success).toBe(true);
  const written = JSON.parse(readFileSync(join(dir, 'dist/docs-data/theme-mood/theme.json'), 'utf8')) as {
    sourceFiles: unknown;
  };
  return written.sourceFiles;
}

describe('docs-data: theme source files', () => {
  it('names the source file of each theme component per framework, relative to the workspace root', async () => {
    theme(['button']);
    write('packages/angular/src/button-theme.ts', '');
    write('packages/react/src/button.tsx', '');
    write('packages/vue/src/Button.vue', '');
    write('packages/react/src/other.tsx', '');
    expect(await sourceFiles()).toEqual({
      button: {
        angular: 'packages/angular/src/button-theme.ts',
        react: 'packages/react/src/button.tsx',
        vue: 'packages/vue/src/Button.vue',
      },
    });
  });

  it('names the root file of a compound component and leaves out a framework with no wrapper', async () => {
    theme(['avatar-label', 'hint']);
    write('packages/angular/src/avatar-label-theme.ts', '');
    write('packages/react/src/avatar-label-root.tsx', '');
    expect(await sourceFiles()).toEqual({
      'avatar-label': {
        angular: 'packages/angular/src/avatar-label-theme.ts',
        react: 'packages/react/src/avatar-label-root.tsx',
      },
    });
  });

  it('names the PascalCase Vue file of a kebab-case component', async () => {
    theme(['form-field']);
    write('packages/vue/src/FormFieldRoot.vue', '');
    expect(await sourceFiles()).toEqual({ 'form-field': { vue: 'packages/vue/src/FormFieldRoot.vue' } });
  });

  it('names the namespace file of React and the content file of Vue for a component with an unthemed root', async () => {
    theme(['menu']);
    write('packages/angular/src/menu-theme.ts', '');
    write('packages/react/src/menu.ts', '');
    write('packages/vue/src/MenuContent.vue', '');
    expect(await sourceFiles()).toEqual({
      menu: {
        angular: 'packages/angular/src/menu-theme.ts',
        react: 'packages/react/src/menu.ts',
        vue: 'packages/vue/src/MenuContent.vue',
      },
    });
  });
});

// @vitest-environment node
/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = fileURLToPath(new URL('../', import.meta.url));
const packages = join(here, '..', '..', '..');
const files = [
  ...readdirSync(here)
    .filter((name) => /\.tsx?$/.test(name))
    .map((name) => join(here, name)),
  join(packages, 'react', 'core', 'src', 'use-theme-icons.ts'),
  join(packages, 'themes', 'cocokits', 'react', 'src', 'svg-icon.tsx'),
];

const SINKS = [
  'innerHTML',
  'outerHTML',
  'insertAdjacentHTML',
  'dangerouslySetInnerHTML',
  'v-html',
  'DOMParser',
  'createContextualFragment',
  'bypassSecurityTrust',
  'DomSanitizer',
];

describe('SvgIcon sources (safety)', () => {
  it('finds the SvgIcon sources', () => {
    expect(files.length).toBeGreaterThanOrEqual(5);
  });

  it.each(files.map((file) => [file.slice(file.indexOf('packages')).replaceAll('\\', '/'), file] as const))(
    'uses no markup sink: %s',
    (_name, file) => {
      expect(SINKS.filter((sink) => readFileSync(file, 'utf8').includes(sink))).toEqual([]);
    },
  );
});

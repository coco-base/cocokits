/**
 * Tool versions used when the generator adds dev tooling to the root package.json (latest stable when written).
 * Framework versions are never listed here: they come from compatibility.json (`high`).
 */
export const TOOL_VERSIONS = {
  tsdown: '0.23.1',
  sass: '1.105.2',
  vite: '8.3.4',
  '@vitejs/plugin-vue': '6.0.10',
  '@vitejs/plugin-react': '6.1.2',
  jsdom: '30.1.3',
  '@testing-library/react': '16.3.3',
  '@testing-library/vue': '8.1.0',
  'vue-tsc': '3.3.13',
  'ng-packagr': '22.2.4',
  rxjs: '7.8.2',
  tslib: '2.8.1',
  '@types/react': '19.3.0',
  '@types/react-dom': '19.3.0',
  '@floating-ui/dom': '1.8.0',
  '@internationalized/date': '3.12.4',
  '@internationalized/number': '3.6.9',
  'alien-signals': '3.2.1',
  '@playwright/test': '1.64.1',
} as const;

/** Used only when the root package.json does not pin `nx`; the Nx plugins must match the installed Nx. */
export const NX_FALLBACK_VERSION = '23.3.0';

/** Caret range on the major of a looked-up version, e.g. 3.12.4 -> ^3.0.0. */
export function majorRange(version: string): string {
  return `^${version.split('.')[0] ?? '0'}.0.0`;
}

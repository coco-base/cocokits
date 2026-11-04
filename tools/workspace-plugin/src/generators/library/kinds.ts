export const PACKAGE_KINDS = [
  'shared-lib',
  'cdk',
  'machines',
  'fw-core',
  'fw',
  'theme-core',
  'theme-fw',
  'tool',
  'app',
  'docs-stories',
  'docs-shared',
  'docs-e2e',
] as const;
export const ENTRY_KINDS = ['cdk-module', 'machine', 'fw-entry', 'angular-testing'] as const;
export const KINDS = [...PACKAGE_KINDS, ...ENTRY_KINDS] as const;
export const FRAMEWORKS = ['angular', 'react', 'vue'] as const;

export type PackageKind = (typeof PACKAGE_KINDS)[number];
export type EntryKind = (typeof ENTRY_KINDS)[number];
export type Framework = (typeof FRAMEWORKS)[number];
/** `none`: nothing to build; the sources run as they are (a private tool). */
export type Builder = 'tsdown' | 'ng-packagr' | 'vite-vue' | 'none';

export const NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

export function isPackageKind(value: string): value is PackageKind {
  return (PACKAGE_KINDS as readonly string[]).includes(value);
}

export function isEntryKind(value: string): value is EntryKind {
  return (ENTRY_KINDS as readonly string[]).includes(value);
}

export function isFramework(value: string): value is Framework {
  return (FRAMEWORKS as readonly string[]).includes(value);
}

export interface FrameworkInfo {
  readonly label: string;
  readonly builder: Builder;
  /** Peer packages of the framework, named as in compatibility.json. */
  readonly peers: readonly string[];
}

export const FRAMEWORK_INFO: Record<Framework, FrameworkInfo> = {
  angular: { label: 'Angular', builder: 'ng-packagr', peers: ['@angular/core'] },
  react: { label: 'React', builder: 'tsdown', peers: ['react', 'react-dom'] },
  vue: { label: 'Vue', builder: 'vite-vue', peers: ['vue'] },
};

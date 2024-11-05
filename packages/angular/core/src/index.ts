export * from './tokens';
export * from './ui-base.component';
export * from './providers';

/**
 * Re-exports modules from the current package to ensure proper type definitions and paths are used in production builds.
 *
 * This export is crucial for components that need to override the additional properties. Without this export,
 * the type definitions in the build file will reference the relative path to the dist folder instead of the package path.
 *
 * Example result without this export:
 * ```typescript
 * additional: import("@angular/core").Signal<{
 *   [x: string]: import("dist/packages/common/core/src").ThemeUIComponentPropValue;
 * }>;
 * ```
 *
 * Example result after adding this export:
 * ```typescript
 * additional: import("@angular/core").Signal<{
 *   [x: string]: import("@cocokits/angular-core").ThemeUIComponentPropValue;
 * }>;
 * ```
 */
export { UIBaseComponentsPropValue as ThemeUIComponentPropValue } from '@cocokits/core';

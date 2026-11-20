declare const process: { readonly env: { readonly NODE_ENV?: string } };

/**
 * Whether development-only checks run. The `process.env.NODE_ENV` expression stays in this form so
 * bundlers replace it in a browser build; without a bundler and without `process` it is false.
 *
 * @internal
 * @returns `true` outside production.
 */
export function isDevelopment(): boolean {
  try {
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
}

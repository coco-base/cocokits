/**
 * The pairs of `contrast.test.ts` that fail their WCAG level under one of the five brand modes and that the maintainer
 * accepted, keyed `<Brand>: <pair key>` as the suite names them. Each is asserted at its measured ratio to two decimals
 * with the decision id, so a token change that moves one shows in the test. Add an entry only with a decision.
 */
export const ACCEPTED: Readonly<Record<string, { readonly ratio: string; readonly decision: string } | undefined>> = {};

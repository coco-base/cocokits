import { CckSwitch } from './switch';

export { CckSwitch } from './switch';
export type { SwitchChangeDetails, SwitchChangeReason } from './switch';

/**
 * Everything you need to write a Switch in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckSwitchImports]
 */
export const CckSwitchImports = [CckSwitch] as const;

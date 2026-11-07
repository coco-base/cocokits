import { CckSwitch } from './switch';

export { CckSwitch } from './switch';
export type { SwitchChangeDetails, SwitchChangeReason } from './switch';

/** Everything needed to author a Switch: `imports: [CckSwitchImports]`. */
export const CckSwitchImports = [CckSwitch] as const;

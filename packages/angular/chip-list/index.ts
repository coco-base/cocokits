import { CckChipList } from './chip-list';

export { CckChipList } from './chip-list';
export type { ChipListChangeDetails, ChipListChangeReason } from './chip-list';

/**
 * Everything you need to write a Chip list in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckChipListImports]
 */
export const CckChipListImports = [CckChipList] as const;

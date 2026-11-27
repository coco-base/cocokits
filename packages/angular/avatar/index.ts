import { CckAvatar } from './avatar';
import { CckAvatarFallback } from './avatar-fallback';
import { CckAvatarImage } from './avatar-image';

export { CckAvatar } from './avatar';
export { CckAvatarImage } from './avatar-image';
export { CckAvatarFallback } from './avatar-fallback';
export type { AvatarImageLoadingStatus } from '@cocokits/machines/avatar';

/**
 * Everything you need to write an Avatar in a template. Add it to the `imports` of your component.
 * @example
 * imports: [CckAvatarImports]
 */
export const CckAvatarImports = [CckAvatar, CckAvatarImage, CckAvatarFallback] as const;

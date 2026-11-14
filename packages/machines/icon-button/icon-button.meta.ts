import type { ComponentMeta } from '@cocokits/shared';
import { buttonMeta } from '../button';

/**
 * IconButton meta: the Button meta (data attributes, roles, keyboard rows and form contract are the same), data for
 * tests and docs, never read at runtime.
 */
export const iconButtonMeta: ComponentMeta<'root'> = { ...buttonMeta };

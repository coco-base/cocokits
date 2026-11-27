import { inject, type InjectionKey, type Ref } from 'vue';
import type { AvatarImageLoadingStatus } from '@cocokits/machines/avatar';

/** What an AvatarRoot gives its parts. */
export interface AvatarContextValue {
  /** The loading status of the picture; `idle` until the image has probed its source. */
  readonly status: Readonly<Ref<AvatarImageLoadingStatus>>;
  /** Writes the status. Only the image calls it. */
  readonly setStatus: (status: AvatarImageLoadingStatus) => void;
  /** Counts a mounted image; returns the function that removes it. The root warns about a second one in development. */
  readonly registerImage: () => () => void;
}

/** Injection key of the avatar context. Not exported from any entry point. */
export const AVATAR_KEY: InjectionKey<AvatarContextValue> = Symbol('cck-avatar');

/**
 * The context of the nearest AvatarRoot.
 *
 * @param part - The name of the calling part, for the error.
 * @returns The context.
 * @throws When the part is used outside an AvatarRoot.
 */
export function useAvatarContext(part: string): AvatarContextValue {
  const context = inject(AVATAR_KEY, undefined);
  if (!context) throw new Error(`CocoKits: <${part}> must be used inside <AvatarRoot>.`);
  return context;
}

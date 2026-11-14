import { AvatarFallback } from './avatar-fallback';
import { AvatarImage } from './avatar-image';
import { AvatarRoot } from './avatar-root';
import type { AvatarFallbackProps, AvatarImageProps, AvatarPart, AvatarRootProps } from './avatar.types';

/** The shape of the {@link Avatar} namespace. */
interface AvatarNamespace {
  readonly Root: AvatarPart<AvatarRootProps>;
  readonly Image: AvatarPart<AvatarImageProps>;
  readonly Fallback: AvatarPart<AvatarFallbackProps>;
}

/**
 * The Avatar parts as a namespace: `Avatar.Root`, `Avatar.Image` and `Avatar.Fallback`. A person as a picture, or as
 * initials or an icon when there is no picture.
 */
export const Avatar: AvatarNamespace = { Root: AvatarRoot, Image: AvatarImage, Fallback: AvatarFallback };

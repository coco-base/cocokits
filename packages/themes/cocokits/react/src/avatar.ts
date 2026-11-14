import { Avatar as BaseAvatar } from '@cocokits/react/avatar';
import { AvatarRoot, type AvatarRootComponent } from './avatar-root';

/** The cocokits {@link Avatar} parts: the themed `Root` and the base `Image` and `Fallback`. */
interface AvatarNamespace {
  readonly Root: AvatarRootComponent;
  readonly Image: typeof BaseAvatar.Image;
  readonly Fallback: typeof BaseAvatar.Fallback;
}

/**
 * The cocokits Avatar as a namespace: the themed `Avatar.Root` and the base `Avatar.Image` and `Avatar.Fallback`.
 */
export const Avatar: AvatarNamespace = {
  Root: AvatarRoot,
  Image: BaseAvatar.Image,
  Fallback: BaseAvatar.Fallback,
};

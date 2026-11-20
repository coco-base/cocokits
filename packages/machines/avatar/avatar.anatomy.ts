import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Avatar anatomy: the root, the picture and the fallback shown while there is no picture. */
export const avatarAnatomy: Anatomy<
  'avatar',
  { readonly root: AnatomyPart; readonly image: AnatomyPart; readonly fallback: AnatomyPart }
> = defineAnatomy({
  block: 'avatar',
  parts: {
    root: { name: 'Root', description: 'Holds the picture and the fallback of a person.' },
    image: { name: 'Image', description: 'The picture, always a native `img`. Hidden until it has loaded.' },
    fallback: {
      name: 'Fallback',
      description: 'Initials, an icon or any content shown while the picture is not loaded.',
    },
  },
});

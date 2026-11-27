import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** AvatarLabel anatomy: the root, the text block, the name and the description. */
export const avatarLabelAnatomy: Anatomy<
  'avatar-label',
  {
    readonly root: AnatomyPart;
    readonly text: AnatomyPart;
    readonly name: AnatomyPart;
    readonly description: AnatomyPart;
  }
> = defineAnatomy({
  block: 'avatar-label',
  parts: {
    root: { name: 'Root', description: 'Holds an avatar, written first by the author, and the text beside it.' },
    text: { name: 'Text', description: 'Wraps the name and the description; rendered when either is set.' },
    name: { name: 'Name', description: 'The name of the person.' },
    description: { name: 'Description', description: 'A second line about the person, such as a role or an email.' },
  },
});

import { defineAnatomy, type Anatomy, type AnatomyPart } from '@cocokits/shared';

/** Switch anatomy: a root around a label that wraps the track (with the native switch input) and the content. */
export const switchAnatomy: Anatomy<
  'switch',
  {
    readonly root: AnatomyPart;
    readonly label: AnatomyPart;
    readonly track: AnatomyPart;
    readonly input: AnatomyPart;
    readonly thumb: AnatomyPart;
    readonly backdrop: AnatomyPart;
  }
> = defineAnatomy({
  block: 'switch',
  parts: {
    root: { name: 'Root', description: 'The root. It renders the facts as `data-*`; it has no role.' },
    label: {
      name: 'Label',
      description: 'The native `label` of the input; it wraps the track and the author content.',
    },
    track: { name: 'Track', description: 'The track and hit area that the native input lies over.' },
    input: {
      name: 'Input',
      description: 'The native `input type="checkbox" role="switch"`. The focus and ref target.',
    },
    thumb: { name: 'Thumb', description: 'Empty, decorative: the sliding knob.' },
    backdrop: { name: 'Backdrop', description: 'Empty, decorative: the hover and press halo hook.' },
  },
});

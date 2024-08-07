import { animate, group, query, state, style, transition, trigger } from '@angular/animations';

const BACKDROP_DURATION = '100ms';
const CONTENT_DURATION = '200ms';

const FROM_BOTTOM_TO_CENTER_TRANSFORM_START_ANIM = 'translateY(30%) rotateX(-5deg)';
const FROM_BOTTOM_TO_CENTER_TRANSFORM_END_ANIM = 'translateY(0) rotateX(0)';

function backdrop() {
  return trigger('overlayAnimBackdrop', [state('*', style({ opacity: '1' }))]);
}

function content() {
  return trigger('overlayAnimContent', []);
}

function overlay() {
  return trigger('overlayAnim', [
    // Enter animation: Must be with css, because we need to calculate the position of wrapper element, when overlay is connected to other element

    // Leave Animation: Must be with angular, to keep the component alive until the exist animation has done, otherwise we can not dispatch the close event
    transition(
      ':leave',
      [
        group([
          // Backdrop - Leave Animation
          query('@overlayAnimBackdrop', [style({ opacity: '*' }), animate(BACKDROP_DURATION, style({ opacity: 0 }))], {
            optional: true,
          }),

          // Content - Leave Animation
          query(
            '@overlayAnimContent',
            [
              style({ opacity: 1, transform: '{{transformEnd}}' }),
              animate(CONTENT_DURATION, style({ opacity: 0, transform: '{{transformStart}}' })),
            ],
            { optional: true }
          ),
        ]),
      ],
      {
        // Default Params
        params: {
          transformStart: FROM_BOTTOM_TO_CENTER_TRANSFORM_START_ANIM,
          transformEnd: FROM_BOTTOM_TO_CENTER_TRANSFORM_END_ANIM,
        },
      }
    ),
  ]);
}

export const overlayAnimation = {
  backdrop,
  content,
  overlay,
};

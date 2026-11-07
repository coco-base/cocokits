import { Directive } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { getSuffixProps, suffixAnatomy } from '@cocokits/machines/suffix';

/**
 * Content inside the box of a FormField, after the control.
 * While the control is focused, a drag cannot start a text selection here. It renders its content as
 * written, adds no ARIA and has no style. It sits on the author's element (a `<div>` by default) and works outside a
 * `[cckFormField]` too, where it has no placement. An icon-only suffix needs `aria-hidden="true"`; an
 * interactive one is a real `button` or `a` with its own accessible name. Its text is not part of the
 * control's name or description.
 *
 * @example
 * <div cckFormField>
 *   <label cckLabel>Weight</label>
 *   <input cckInput />
 *   <span cckSuffix>kg</span>
 * </div>
 * @cckPart root
 * @cckSlot default - The content of the zone.
 */
@Directive({
  selector: '[cckSuffix]',
  exportAs: 'cckSuffix',
  host: {
    '[class]': 'parts.root.class',
  },
})
export class CckSuffix {
  protected readonly parts = getSuffixProps();

  constructor() {
    themeAttrs(suffixAnatomy); // applies the root part's theme attributes to the host
  }
}

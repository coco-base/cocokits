import { Directive } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { getPrefixProps, prefixAnatomy } from '@cocokits/machines/prefix';

/**
 * Content inside the box of a FormField, before the control.
 * While the control is focused, a drag cannot start a text selection here. It renders its content as
 * written, adds no ARIA and has no style. It sits on the author's element (a `<div>` by default) and works outside a
 * `cck-form-field` too, where it has no placement. An icon-only prefix needs `aria-hidden="true"`; an
 * interactive one is a real `button` or `a` with its own accessible name. Its text is not part of the
 * control's name or description.
 *
 * @example
 * <cck-form-field>
 *   <label cckLabel>Price</label>
 *   <span cckPrefix>$</span>
 *   <input cckInput />
 * </cck-form-field>
 * @cckPart root
 * @cckSlot default - The content of the zone.
 */
@Directive({
  selector: '[cckPrefix]',
  exportAs: 'cckPrefix',
  host: {
    '[class]': 'parts.root.class',
  },
})
export class CckPrefix {
  protected readonly parts = getPrefixProps();

  constructor() {
    themeAttrs(prefixAnatomy); // applies the root part's theme attributes to the host
  }
}

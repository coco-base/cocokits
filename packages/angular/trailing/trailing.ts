import { Directive } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { getTrailingProps, trailingAnatomy } from '@cocokits/machines/trailing';

/**
 * Content outside the box of a FormField, after it. It renders its content as written,
 * adds no ARIA and has no style. It sits on the author's element (a `<div>` by default) and works outside a
 * `[cckFormField]` too, where it has no placement. An icon-only trailing needs `aria-hidden="true"`; an
 * interactive one is a real `button` or `a` with its own accessible name. Its text is not part of the
 * control's name or description.
 *
 * @example
 * <div cckFormField>
 *   <label cckLabel>Search</label>
 *   <input cckInput />
 *   <button cckTrailing type="button">Go</button>
 * </div>
 * @cckPart root
 * @cckSlot default - The content of the zone.
 */
@Directive({
  selector: '[cckTrailing]',
  exportAs: 'cckTrailing',
  host: {
    '[class]': 'parts.root.class',
  },
})
export class CckTrailing {
  protected readonly parts = getTrailingProps();

  constructor() {
    themeAttrs(trailingAnatomy); // applies the root part's theme attributes to the host
  }
}

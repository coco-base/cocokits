import { Directive } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { getLeadingProps, leadingAnatomy } from '@cocokits/machines/leading';

/**
 * Content outside the box of a FormField, before it. It renders its content as written,
 * adds no ARIA and has no style. It sits on the author's element (a `<div>` by default) and works outside a
 * `cck-form-field` too, where it has no placement. An icon-only leading needs `aria-hidden="true"`; an
 * interactive one is a real `button` or `a` with its own accessible name. Its text is not part of the
 * control's name or description.
 *
 * @example
 * <cck-form-field>
 *   <label cckLabel>Search</label>
 *   <button cckLeading type="button" aria-label="Filters">...</button>
 *   <input cckInput />
 * </cck-form-field>
 * @cckPart root
 * @cckSlot default - The content of the zone.
 */
@Directive({
  selector: '[cckLeading]',
  exportAs: 'cckLeading',
  host: {
    '[class]': 'parts.root.class',
  },
})
export class CckLeading {
  protected readonly parts = getLeadingProps();

  constructor() {
    themeAttrs(leadingAnatomy); // applies the root part's theme attributes to the host
  }
}

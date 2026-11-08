import { Directive } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { getLeadingProps, leadingAnatomy } from '@cocokits/machines/leading';

/**
 * Content outside the box of a `cck-form-field`, before the box. Put the attribute on any element, like a `<span>` or a `<button>`. Outside a field, it has no place of its own.
 *
 * It adds no ARIA and no style. Its text is not part of the name or the description of the control. Give an icon without text `aria-hidden="true"`. Make an interactive leading content a real `<button>` or `<a>` with its own accessible name.
 *
 * @example
 * <cck-form-field>
 *   <label cckLabel>Search</label>
 *   <button cckLeading type="button" aria-label="Filters">...</button>
 *   <input cckInput />
 * </cck-form-field>
 * @cckPart root
 * @cckSlot default - The content to show. When not set, the element is empty.
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

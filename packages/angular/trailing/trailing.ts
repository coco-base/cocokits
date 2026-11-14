import { Directive } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { getTrailingProps, trailingAnatomy } from '@cocokits/machines/trailing';

/**
 * Content outside the box of a `cck-form-field`, after the box. Put the attribute on any element, like a `<span>` or a `<button>`. Outside a field, it has no place of its own.
 *
 * It adds no ARIA and no style. Its text is not part of the name or the description of the control. An SVG icon is hidden from screen readers by default; give your own `<svg>` `aria-hidden="true"`. Make an interactive trailing content a real `<button>` or `<a>` with its own accessible name.
 *
 * @example
 * <cck-form-field>
 *   <label cckLabel>Search</label>
 *   <input cckInput />
 *   <button cckTrailing type="button">Go</button>
 * </cck-form-field>
 * @cckPart root
 * @cckSlot default - The content to show. When not set, the element is empty.
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

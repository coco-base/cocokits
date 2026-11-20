import { Directive } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { getPrefixProps, prefixAnatomy } from '@cocokits/machines/prefix';

/**
 * Content inside the box of a `cck-form-field`, before the control. Put the attribute on any element, like a `<span>` or a `<button>`. Outside a field, it has no place of its own.
 *
 * While the control has focus, a drag here cannot start a text selection. It adds no ARIA and no style. Its text is not part of the name or the description of the control. An SVG icon is hidden from screen readers by default; give your own `<svg>` `aria-hidden="true"`. Make an interactive prefix a real `<button>` or `<a>` with its own accessible name.
 *
 * @example
 * <cck-form-field>
 *   <label cckLabel>Price</label>
 *   <span cckPrefix>$</span>
 *   <input cckInput />
 * </cck-form-field>
 * @cckPart root
 * @cckSlot default - The content to show. When not set, the element is empty.
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

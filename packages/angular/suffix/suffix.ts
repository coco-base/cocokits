import { Directive } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { getSuffixProps, suffixAnatomy } from '@cocokits/machines/suffix';

/**
 * Content inside the box of a `cck-form-field`, after the control. Put the attribute on any element, like a `<span>` or a `<button>`. Outside a field, it has no place of its own.
 *
 * While the control has focus, a drag here cannot start a text selection. It adds no ARIA and no style. Its text is not part of the name or the description of the control. An SVG icon is hidden from screen readers by default; give your own `<svg>` `aria-hidden="true"`. Make an interactive suffix a real `<button>` or `<a>` with its own accessible name.
 *
 * @example
 * <cck-form-field>
 *   <label cckLabel>Weight</label>
 *   <input cckInput />
 *   <span cckSuffix>kg</span>
 * </cck-form-field>
 * @cckPart root
 * @cckSlot default - The content to show. When not set, the element is empty.
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

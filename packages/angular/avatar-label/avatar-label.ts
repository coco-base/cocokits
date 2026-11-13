import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { avatarLabelAnatomy, getAvatarLabelProps } from '@cocokits/machines/avatar-label';

/**
 * An avatar with a name and a description beside it. Write the `cck-avatar` first, as a direct child; the text follows it.
 *
 * The text part shows only when `name` or `description` is set, and each line only when it is not empty. The name is printed, so hide the avatar from screen readers with `aria-hidden="true"` on the `cck-avatar`.
 *
 * @example
 * <cck-avatar-label name="Ada Lovelace" description="Mathematician">
 *   <cck-avatar aria-hidden="true">
 *     <cck-avatar-fallback>AL</cck-avatar-fallback>
 *   </cck-avatar>
 * </cck-avatar-label>
 * @cckPart root
 * @cckSection text name description
 * @cckSlot default - The avatar, written first. When not set, only the text shows.
 */
@Component({
  selector: 'cck-avatar-label',
  exportAs: 'cckAvatarLabel',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'parts().root.class',
    '[attr.name]': 'null',
    '[attr.description]': 'null',
  },
  template: `
    <ng-content />
    @if (parts().text; as text) {
      <span [class]="text.class">
        @if (parts().name; as nameProps) {
          <span [class]="nameProps.class">{{ name() }}</span>
        }
        @if (parts().description; as descriptionProps) {
          <span [class]="descriptionProps.class">{{ description() }}</span>
        }
      </span>
    }
  `,
})
export class CckAvatarLabel {
  /**
   * The name of the person. When not set, or empty, no name shows.
   */
  readonly name = input<string | undefined>();

  /**
   * A second line, such as a role or an email. When not set, or empty, no description shows.
   */
  readonly description = input<string | undefined>();

  protected readonly parts = computed(() =>
    getAvatarLabelProps({ name: this.name(), description: this.description() }),
  );

  constructor() {
    themeAttrs(avatarLabelAnatomy); // applies the root part's theme attributes to the host
  }
}

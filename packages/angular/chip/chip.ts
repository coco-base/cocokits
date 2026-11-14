import { Component, ViewEncapsulation, booleanAttribute, computed, inject, input, output } from '@angular/core';
import { CckAttrs, IdGenerator, injectPartIconName, themeAttrs } from '@cocokits/angular-core';
import { CckSvgIcon } from '@cocokits/angular/svg-icon';
import { chipAnatomy, getChipProps } from '@cocokits/machines/chip';

/**
 * A chip: one short value, such as a tag, a filter or a choice. The content you write inside it is the text of the chip. While `removable`, it also shows a button that asks to remove it.
 *
 * The chip never removes itself. Listen to `removed` and take the chip out of your data. The remove button is named by the text of the chip, so the screen reader says the text and that it is a button. To say "Remove Pizza", put visually hidden text inside the chip.
 *
 * When you remove a chip that is not in a `cck-chip-list`, move the focus yourself. Move it to the next chip or to the control that added it. The chip cannot know where it should go.
 *
 * The remove button draws the icon your theme names in `components.chip.icons.remove`, else the default `close`. Register a theme icon with `provideCckIcons`.
 *
 * @example
 * <cck-chip removable (removed)="remove('Pizza')">Pizza</cck-chip>
 * @cckPart root
 * @cckPart contentWrapper
 * @cckPart remove
 * @cckSlot default - The text of the chip. When not set, the chip is empty.
 */
@Component({
  selector: 'cck-chip',
  exportAs: 'cckChip',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs, CckSvgIcon],
  host: {
    '[class]': 'parts().root.class',
    '[attr.id]': 'parts().root.id',
    '[attr.data-disabled]': 'parts().root["data-disabled"]',
  },
  template: `
    <span
      [class]="parts().contentWrapper.class"
      [attr.id]="parts().contentWrapper.id"
      [cckAttrs]="theme().contentWrapper"
    >
      <ng-content />
    </span>
    @if (parts().remove; as remove) {
      <button
        [class]="remove.class"
        [cckAttrs]="theme().remove"
        [attr.type]="remove.type"
        [attr.aria-labelledby]="remove['aria-labelledby']"
        [attr.disabled]="remove.disabled ? '' : null"
        [attr.data-disabled]="remove['data-disabled']"
        (click)="removed.emit()"
      >
        <cck-svg-icon [iconName]="removeIconName()" />
      </button>
    }
  `,
})
export class CckChip {
  /**
   * Whether the chip shows the remove button. The button asks to remove the chip; it does not remove it.
   * @cckSemantic chip.removable
   * @defaultValue false
   */
  readonly removable = input(false, { transform: booleanAttribute });

  /**
   * Whether the chip is disabled. A disabled chip has `data-disabled`, and its remove button is natively disabled, so it emits nothing.
   * @cckSemantic chip.disabled
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * The `id` of the chip. When not set, the chip gets a generated id. The id of the text is `<id>-content`.
   * @cckSemantic chip.id
   */
  readonly id = input<string | undefined>(undefined);

  /**
   * Emits when the user activates the remove button, with a click or with Enter or Space. It sends no value.
   * @remarks The chip stays until you remove it. A disabled chip never emits.
   * @example
   * <cck-chip removable (removed)="onRemoved()">Pizza</cck-chip>
   * <!-- In the class: onRemoved() { this.dishes.update((list) => list.filter((dish) => dish !== 'Pizza')); } -->
   * @cckSemantic chip.remove
   */
  readonly removed = output();

  private readonly generatedId = inject(IdGenerator).getId(chipAnatomy.classes.root);

  /** The theme attributes of every part; the root's are applied to the host. */
  protected readonly theme = themeAttrs(chipAnatomy);

  /** The theme's icon when registered, else the default; the remove button shows it always. */
  protected readonly removeIconName = injectPartIconName(chipAnatomy.block, 'remove');

  protected readonly parts = computed(() =>
    getChipProps({
      id: this.id() ?? this.generatedId,
      removable: this.removable(),
      disabled: this.disabled(),
    }),
  );
}

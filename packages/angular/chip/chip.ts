import { NgTemplateOutlet } from '@angular/common';
import { Component, ViewEncapsulation, booleanAttribute, computed, inject, input, model, output } from '@angular/core';
import { CckAttrs, IdGenerator, injectPartIconName, themeAttrs } from '@cocokits/angular-core';
import { CckSvgIcon } from '@cocokits/angular/svg-icon';
import { chipAnatomy, getChipProps } from '@cocokits/machines/chip';

/**
 * A chip: one short value, such as a tag, a filter or a choice. The content you write inside it is the text of the chip. While `removable`, it also shows a button that asks to remove it.
 *
 * The chip never removes itself. Listen to `removed` and take the chip out of your data. The remove button is named "Remove" and the text of the chip, for example "Remove Pizza". Set `removeLabel` to replace the whole name. A disabled chip shows no remove button.
 *
 * Set `selected` to make the chip selectable. The content then is a toggle `button` with `aria-pressed`, and a check shows while the chip is selected. Use `[(selected)]` to read and change it. The remove button is a sibling of the toggle, never inside it.
 *
 * When you remove a chip that is not in a `cck-chip-list`, move the focus yourself. Move it to the next chip or to the control that added it. The chip cannot know where it should go.
 *
 * The remove button draws the icon your theme names in `components.chip.icons.remove`, else the default `close`; the check draws `components.chip.icons.check`, else `check`. Register a theme icon with `provideCckIcons`.
 *
 * @example
 * <cck-chip removable (removed)="remove('Pizza')">Pizza</cck-chip>
 * @cckPart root
 * @cckPart contentWrapper
 * @cckPart check
 * @cckPart remove
 * @cckSlot default - The text of the chip. When not set, the chip is empty.
 */
@Component({
  selector: 'cck-chip',
  exportAs: 'cckChip',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs, CckSvgIcon, NgTemplateOutlet],
  host: {
    '[class]': 'parts().root.class',
    '[attr.id]': 'parts().root.id',
    '[attr.data-disabled]': 'parts().root["data-disabled"]',
    '[attr.removable]': 'null',
    '[attr.disabled]': 'null',
    '[attr.selected]': 'null',
    '[attr.removelabel]': 'null',
  },
  template: `
    <ng-template #content><ng-content /></ng-template>
    @if (parts().check; as check) {
      <span
        [class]="check.class"
        [attr.aria-hidden]="check['aria-hidden']"
        [attr.data-state]="check['data-state']"
        [cckAttrs]="theme().check"
      >
        <cck-svg-icon [iconName]="checkIconName()" />
      </span>
    }
    @if (selected() === undefined) {
      <span
        [class]="parts().contentWrapper.class"
        [attr.id]="parts().contentWrapper.id"
        [cckAttrs]="theme().contentWrapper"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </span>
    } @else {
      <button
        [class]="parts().contentWrapper.class"
        [attr.id]="parts().contentWrapper.id"
        [attr.type]="parts().contentWrapper.type"
        [attr.aria-pressed]="parts().contentWrapper['aria-pressed']"
        [attr.disabled]="parts().contentWrapper.disabled ? '' : null"
        [attr.data-selected]="parts().contentWrapper['data-selected']"
        [cckAttrs]="theme().contentWrapper"
        (click)="toggle()"
      >
        <ng-container [ngTemplateOutlet]="content" />
      </button>
    }
    @if (parts().remove; as remove) {
      <button
        [class]="remove.class"
        [cckAttrs]="theme().remove"
        [attr.id]="remove.id"
        [attr.type]="remove.type"
        [attr.aria-label]="remove['aria-label']"
        [attr.aria-labelledby]="remove['aria-labelledby']"
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
   * Whether the chip is disabled. A disabled chip shows no remove button and, while selectable, has a disabled toggle.
   *
   * @remarks
   * The root gets `data-disabled`.
   *
   * @cckSemantic chip.disabled
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Whether the chip is selected. A chip is selectable while this is `true` or `false`; with no value it is a plain chip. When not set, the chip has no toggle and no check.
   * @remarks Use `[(selected)]` to read and change it. A press on the toggle changes it and emits `selectedChange`.
   * @cckSemantic chip.selected
   */
  readonly selected = model<boolean | undefined>(undefined);

  /**
   * The accessible name of the remove button, as `aria-label`. When not set, the name is "Remove" and the text of the chip.
   * @cckSemantic chip.removeLabel
   * @defaultValue "Remove <chip text>"
   */
  readonly removeLabel = input<string | undefined>(undefined);

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

  /** The theme's icon when registered, else the default; the check shows it while the chip is selected. */
  protected readonly checkIconName = injectPartIconName(chipAnatomy.block, 'check');

  protected readonly parts = computed(() =>
    getChipProps({
      id: this.id() ?? this.generatedId,
      removable: this.removable(),
      disabled: this.disabled(),
      selected: this.selected(),
      removeLabel: this.removeLabel(),
    }),
  );

  /** A press on the toggle of a selectable chip. */
  protected toggle(): void {
    this.selected.set(!this.selected());
  }
}

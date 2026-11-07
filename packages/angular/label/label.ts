import { Component, DestroyRef, ViewEncapsulation, computed, effect, inject, input } from '@angular/core';
import { CckAttrs, themeAttrs } from '@cocokits/angular-core';
import { CckFormField } from '@cocokits/angular/form-field';
import { formFieldIds } from '@cocokits/machines/form-field';
import { getLabelProps, labelAnatomy } from '@cocokits/machines/label';

/**
 * The visible label of a control, on a native `<label>`. Inside a `[cckFormField]` with a CocoKits
 * control (the Input), `for` points at that control by itself, whatever order the two are written in,
 * and the label ends with a `*` marker while the field's control is required. Set `for` to choose
 * another control or to label a native control; set `hideRequiredMarker` on the field to hide the
 * marker. A control that is not labelable names itself with `aria-labelledby` and the id of the label.
 * It works on its own, outside a field, and sets no style.
 *
 * @example
 * <div cckFormField>
 *   <label cckLabel>Email address</label>
 *   <input cckInput type="email" required />
 * </div>
 * @cckPart root
 * @cckPart requiredMarker
 * @cckSlot default - The label text, as written.
 */
@Component({
  selector: 'label[cckLabel]',
  exportAs: 'cckLabel',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs],
  host: {
    '[class]': 'parts().root.class',
    '[attr.for]': 'parts().root.for ?? null',
    '[attr.id]': 'parts().root.id ?? null',
  },
  template: `
    <ng-content />
    @if (parts().requiredMarker; as marker) {
      <span [class]="marker.class" [attr.aria-hidden]="marker['aria-hidden']" [cckAttrs]="theme().requiredMarker">{{
        marker.text
      }}</span>
    }
  `,
})
export class CckLabel {
  private readonly field = inject(CckFormField, { optional: true });

  /**
   * The id of the control to label. Inside a field with a CocoKits control it defaults to that control's
   * id; an explicit value always wins.
   */
  readonly forId = input<string | undefined>(undefined, { alias: 'for' });

  /**
   * The id of the label, static or bound. Without one, inside a field, the label takes the field's generated
   * label id; either way the field hands the id on to a control that names itself by the label.
   * @cckSemantic none
   * @cckParity Declared as an input.
   */
  readonly authorId = input<string | undefined>(undefined, { alias: 'id' });

  /** The id the label renders: the author's, else the field's generated one. */
  private readonly id = computed(
    () => this.authorId() ?? (this.field ? formFieldIds(this.field._fieldId()).label : undefined),
  );

  protected readonly parts = computed(() => {
    const own = this.forId();
    return getLabelProps({
      for: own === undefined || own === '' ? this.field?._controlId() : own,
      id: this.id(),
      required: this.field?._state().required,
      hideRequiredMarker: this.field?._fieldInput().hideRequiredMarker,
    });
  });

  /** The theme attributes of every part; the root's are applied to the host. */
  protected readonly theme = themeAttrs(labelAnatomy);

  constructor() {
    const field = this.field;
    if (!field) return;
    // The field hands this id to the control that names itself by the label (the Select list).
    effect(() => {
      field._labelId.set(this.id());
    });
    inject(DestroyRef).onDestroy(() => {
      field._labelId.set(undefined);
    });
  }
}

import { Component, DestroyRef, ViewEncapsulation, computed, effect, inject, input } from '@angular/core';
import { CckAttrs, themeAttrs } from '@cocokits/angular-core';
import { CckFormField } from '@cocokits/angular/form-field';
import { formFieldIds } from '@cocokits/machines/form-field';
import { getLabelProps, labelAnatomy } from '@cocokits/machines/label';

/**
 * The visible label of a control, on a native `<label>`. It works inside a `cck-form-field` and on its own.
 *
 * Inside a form field with a CocoKits control, `for` points at that control without your help. The order of the label and the control does not matter. While the control is required, the label ends with a `*` marker. To hide the marker, set `hideRequiredMarker` on the field.
 *
 * A control that cannot take a `<label>` names itself with `aria-labelledby` and the id of the label.
 *
 * @example
 * <label cckLabel for="email">Email address</label>
 * <input id="email" type="email" required />
 * @cckPart root
 * @cckPart requiredMarker
 * @cckSlot default - The text of the label. When not set, the label is empty and names nothing.
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
   * The `id` of the control that the label names. Use it for a native control or for another control. When not set, the label points at the CocoKits control of the form field, or at nothing outside a field.
   */
  readonly forId = input<string | undefined>(undefined, { alias: 'for' });

  /**
   * The `id` of the label. When not set, the label gets an id from the form field, or no id outside a field.
   * @remarks The form field gives the id to a control that names itself with the label.
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

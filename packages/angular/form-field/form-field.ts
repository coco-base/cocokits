import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
  viewChild,
  type Signal,
} from '@angular/core';
import { CckAttrs, IdGenerator, themeAttrs } from '@cocokits/angular-core';
import {
  formFieldAnatomy,
  formFieldIds,
  getFormFieldProps,
  resolveFormFieldState,
  type FormFieldControlState,
  type FormFieldOwnFacts,
} from '@cocokits/machines/form-field';
import { shouldFocusControl } from '@cocokits/utils';

/**
 * Lays out a label, a control, its zones and its hints in fixed places: the label first; inside the
 * wrapper the leading zone, then the input wrapper (prefix, control, suffix), then the trailing zone;
 * the hints and the field errors last.
 *
 * The places, not the order the author writes things, fix the order. A click on the input wrapper (its
 * padding, a prefix or a suffix) focuses the control, unless it lands on interactive content, on a
 * disabled control or after selecting text. With a CocoKits control (the
 * Input or the Textarea) inside, the field works out the ids: the control gets `<fieldId>-control`, the label's
 * `for` points at it, and the control's `aria-describedby` ends with the feedback wrapper that holds
 * the hints. Set `id` on the field to choose the `<fieldId>` part. The field state props
 * (`disabled`, `readonly`, `required`, `invalid`) reach the control, and the control's own state
 * reaches the field root as `data-*` facts. A native or third-party control gets no defaults: give it
 * an `id`, the label a matching `for`, and the control its own `aria-describedby`.
 *
 * @example
 * <div cckFormField>
 *   <label cckLabel>Email address</label>
 *   <input cckInput type="email" />
 *   <div cckHint>We only use it for the receipt.</div>
 * </div>
 * @cckPart root
 * @cckPart wrapper
 * @cckPart inputWrapper
 * @cckPart feedbackWrapper
 * @cckSlot label [cckLabel] - The label of the control.
 * @cckSlot default - The control.
 * @cckSlot leading [cckLeading] - Content outside the box, before it.
 * @cckSlot prefix [cckPrefix] - Content inside the box, before the control.
 * @cckSlot suffix [cckSuffix] - Content inside the box, after the control.
 * @cckSlot trailing [cckTrailing] - Content outside the box, after it.
 * @cckSlot hint [cckHint] - The hints.
 * @cckSlot error [cckFieldError] - The field errors, after the hints.
 */
@Component({
  selector: '[cckFormField]',
  exportAs: 'cckFormField',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs],
  host: {
    '[class]': 'parts().root.class',
    '[attr.id]': 'id() || null',
    '[attr.hidden]': 'hidden() || parts().root.hidden ? "" : null',
    '[attr.data-disabled]': 'parts().root["data-disabled"]',
    '[attr.data-readonly]': 'parts().root["data-readonly"]',
    '[attr.data-required]': 'parts().root["data-required"]',
    '[attr.data-invalid]': 'parts().root["data-invalid"]',
    '[attr.data-pending]': 'parts().root["data-pending"]',
    '[attr.data-touched]': 'parts().root["data-touched"]',
    '[attr.data-dirty]': 'parts().root["data-dirty"]',
    '[attr.data-submitted]': 'parts().root["data-submitted"]',
    '[attr.data-focused]': 'parts().root["data-focused"]',
    '[attr.data-filled]': 'parts().root["data-filled"]',
  },
  template: `
    <ng-content select="[cckLabel]" />
    <div [class]="parts().wrapper.class" [cckAttrs]="theme().wrapper">
      <ng-content select="[cckLeading]" />
      <div
        #inputWrapper
        [class]="parts().inputWrapper.class"
        [cckAttrs]="theme().inputWrapper"
        (mousedown)="onInputWrapperPress($event)"
        (click)="onInputWrapperPress($event)"
      >
        <ng-content select="[cckPrefix]" />
        <ng-content />
        <ng-content select="[cckSuffix]" />
      </div>
      <ng-content select="[cckTrailing]" />
    </div>
    <div
      [class]="parts().feedbackWrapper.class"
      [attr.id]="parts().feedbackWrapper.id"
      [cckAttrs]="theme().feedbackWrapper"
    >
      <ng-content select="[cckHint]" />
      <ng-content select="[cckFieldError]" />
    </div>
  `,
})
export class CckFormField {
  private readonly generatedId = inject(IdGenerator).getId(formFieldAnatomy.classes.root);
  private readonly reported = signal<Signal<FormFieldControlState> | undefined>(undefined);
  private owner: object | undefined;
  private controlElement: (() => HTMLElement | null | undefined) | null = null;
  private readonly inputWrapper = viewChild<ElementRef<HTMLElement>>('inputWrapper');

  /**
   * The id of the field, reflected to the host. Without it the host renders no `id` and a generated one
   * is used. The control id is `<id>-control` and the feedback wrapper id `<id>-feedback`.
   */
  readonly id = input<string | undefined>(undefined);

  /**
   * Whether the field disables its control. The control's own `disabled` adds to it; neither can turn the
   * other off.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Whether the field makes its control read-only.
   * @cckSemantic form-field.readOnly
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * Whether the field makes its control required and shows the label's required marker.
   * @defaultValue false
   */
  readonly required = input(false, { transform: booleanAttribute });

  /**
   * Whether the field marks its control invalid.
   * @defaultValue false
   */
  readonly invalid = input(false, { transform: booleanAttribute });

  /**
   * Whether the label's required marker is hidden. It does not change `required`.
   * @defaultValue false
   */
  readonly hideRequiredMarker = input(false, { transform: booleanAttribute });

  /**
   * Whether the field root is hidden. It is also hidden while its control is.
   * @cckSemantic none
   * @remarks React and Vue take the native `hidden` attribute.
   * @defaultValue false
   */
  readonly hidden = input(false, { transform: booleanAttribute });

  /**
   * The id the derived ids start from: the author's `id`, or a generated one.
   * @internal
   */
  readonly _fieldId = computed(() => {
    const own = this.id();
    return own === undefined || own === '' ? this.generatedId : own;
  });

  /**
   * The id the Label renders, once there is a Label: an `id` the author wrote on it wins over the generated one.
   * @internal
   */
  readonly _labelId = signal<string | undefined>(undefined);

  /**
   * The ids of the control, the feedback wrapper and the label.
   * @internal
   */
  readonly _ids = computed(() => {
    const ids = formFieldIds(this._fieldId());
    return { ...ids, label: this._labelId() ?? ids.label };
  });

  /**
   * The facts the author set on the field.
   * @internal
   */
  readonly _fieldInput = computed<FormFieldOwnFacts>(() => ({
    disabled: this.disabled(),
    readOnly: this.readonly(),
    required: this.required(),
    invalid: this.invalid(),
    hideRequiredMarker: this.hideRequiredMarker(),
  }));

  /**
   * The effective facts: the field's own value or the control's, for each fact both can set.
   * @internal
   */
  readonly _state = computed(() => resolveFormFieldState(this._fieldInput(), this.reported()?.()));

  /**
   * The effective id of the control in the field, or `undefined` while no CocoKits control is in it.
   * @internal
   */
  readonly _controlId = computed(() => this.reported()?.().id);

  protected readonly parts = computed(() => getFormFieldProps({ state: this._state(), fieldId: this._fieldId() }));

  /** The theme attributes of every part; the root's are applied to the host. */
  protected readonly theme = themeAttrs(formFieldAnatomy);

  /**
   * Registers the control that is being created. Call it in the control's injection context. The first
   * control is the field's control for as long as it exists; a further one is not, and no one takes over
   * when the first is destroyed.
   *
   * @param element - A function that returns the native control, or nothing while it does not exist yet (an input
   *   inside the control's own template); a click on the input wrapper focuses it.
   * @returns Whether the control is the field's control (`primary`), how it reports its state, and `anchor`, the
   *   input wrapper element (the box an overlay of the control lines up with); it is `undefined` for a control
   *   that is not primary and before the wrapper has rendered.
   * @internal
   */
  _register(element: () => HTMLElement | null | undefined): {
    readonly primary: boolean;
    readonly anchor: Signal<HTMLElement | undefined>;
    report(state: Signal<FormFieldControlState>): void;
  } {
    const token = {};
    const primary = this.owner === undefined;
    if (primary) {
      this.owner = token;
      this.controlElement = element;
    } else if (typeof ngDevMode === 'undefined' || ngDevMode) {
      console.warn(
        'CocoKits: a FormField holds one control. This control gets no generated id and no description from the field, and its state does not reach the field. Use a second FormField.',
      );
    }
    inject(DestroyRef).onDestroy(() => {
      if (this.owner !== token) return;
      this.owner = undefined;
      this.controlElement = null;
      this.reported.set(undefined);
    });
    return {
      primary,
      anchor: computed(() => (primary ? this.inputWrapper()?.nativeElement : undefined)),
      report: (state) => {
        if (this.owner === token) this.reported.set(state);
      },
    };
  }

  /**
   * A press on the input wrapper. Where `shouldFocusControl` says it belongs to the control, a `mousedown`
   * keeps an already focused control focused (so it is not blurred, touched or announced) and a `click`
   * focuses it.
   */
  protected onInputWrapperPress(event: MouseEvent): void {
    const control = this.controlElement?.();
    if (!control || !shouldFocusControl(event, control)) return;
    if (event.type === 'click') control.focus();
    else if (control.ownerDocument.activeElement === control) event.preventDefault();
  }
}

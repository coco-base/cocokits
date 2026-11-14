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
import { CckAttrs, IdGenerator, domOrderedList, themeAttrs, type DomOrderedList } from '@cocokits/angular-core';
import {
  formFieldAnatomy,
  formFieldIds,
  getFormFieldProps,
  resolveFormFieldState,
  type FormFieldControlState,
  type FormFieldOwnFacts,
} from '@cocokits/machines/form-field';
import { shouldFocusControl } from '@cocokits/utils';

/** A Hint or a FieldError the field lists: its host element, for the document order, and the author's id. */
interface FieldPart {
  readonly element: HTMLElement;
  readonly ownId: Signal<string | undefined>;
}

type FieldPartKind = 'hints' | 'errors';

const elementOf = (part: FieldPart): HTMLElement => part.element;

/**
 * Places a label, one control, its extra content, hints and errors in fixed places. The order you write them in does not matter.
 *
 * The label comes first. Then come the leading content, the box with the prefix, the control and the suffix, and the trailing content. The hints and the errors come last.
 *
 * A click in the box focuses the control. This does not happen on interactive content, on a disabled control or after the user selects text.
 *
 * @remarks With a CocoKits control inside, the field links the parts for you. The control gets the id `<fieldId>-control`, and the label points at it. The control is described by the hints, then by the errors. Set `id` on the field to choose `<fieldId>`.
 *
 * The `disabled`, `readonly`, `required` and `invalid` inputs of the field reach the control. The state of the control shows on the field as `data-*` attributes.
 *
 * A native or third-party control gets none of this. Give it an `id`, give the label a matching `for`, and give the control its own `aria-describedby`.
 *
 * @example
 * <cck-form-field>
 *   <label cckLabel>Amount</label>
 *   <span cckPrefix>€</span>
 *   <input cckInput type="number" required />
 *   <span cckSuffix>.00</span>
 *   <button cckTrailing type="button">Max</button>
 *   <cck-hint>You can send up to 500 euros.</cck-hint>
 *   <cck-field-error>Enter an amount.</cck-field-error>
 * </cck-form-field>
 * @cckPart root
 * @cckPart wrapper
 * @cckPart inputWrapper
 * @cckPart feedbackWrapper
 * @cckSlot label [cckLabel] - The label of the control. When not set, the field shows no label, so name the control another way.
 * @cckSlot default - The control. When not set, the field has no control.
 * @cckSlot leading [cckLeading] - Content outside the box, before it. When not set, nothing shows there.
 * @cckSlot prefix [cckPrefix] - Content inside the box, before the control. When not set, nothing shows there.
 * @cckSlot suffix [cckSuffix] - Content inside the box, after the control. When not set, nothing shows there.
 * @cckSlot trailing [cckTrailing] - Content outside the box, after it. When not set, nothing shows there.
 * @cckSlot hint cck-hint - The hints. When not set, the field shows no hint.
 * @cckSlot error cck-field-error - The errors, after the hints. When not set, the field shows no error.
 */
@Component({
  selector: 'cck-form-field',
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
      <ng-content select="cck-hint" />
      <ng-content select="cck-field-error" />
    </div>
  `,
})
export class CckFormField {
  private readonly generatedId = inject(IdGenerator).getId(formFieldAnatomy.classes.root);
  private readonly reported = signal<Signal<FormFieldControlState> | undefined>(undefined);
  /** The registered parts in document order, also on the server and at the first client render. */
  private readonly registered: Record<FieldPartKind, DomOrderedList<FieldPart>> = {
    hints: domOrderedList(elementOf),
    errors: domOrderedList(elementOf),
  };
  private owner: object | undefined;
  private controlElement: (() => HTMLElement | null | undefined) | null = null;
  private readonly inputWrapper = viewChild<ElementRef<HTMLElement>>('inputWrapper');

  /**
   * The `id` of the field. The ids of the parts start with it, like `<id>-control` for the control. When not set, the host gets no `id`, and the parts use a generated id.
   */
  readonly id = input<string | undefined>(undefined);

  /**
   * Whether the user cannot use the control. The control can also be disabled on its own.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Whether the control is read-only. The user can focus it but cannot change it.
   * @cckSemantic form-field.readOnly
   * @defaultValue false
   */
  readonly readonly = input(false, { transform: booleanAttribute });

  /**
   * Whether the control needs a value. The label then shows its required marker.
   * @defaultValue false
   */
  readonly required = input(false, { transform: booleanAttribute });

  /**
   * Whether the value of the control is not valid.
   * @defaultValue false
   */
  readonly invalid = input(false, { transform: booleanAttribute });

  /**
   * Whether the required marker of the label is hidden. It does not change `required`.
   * @defaultValue false
   */
  readonly hideRequiredMarker = input(false, { transform: booleanAttribute });

  /**
   * Whether the field is hidden with the native `hidden` attribute. The field also hides while its control is hidden, which Signal Forms sets through `[formField]`.
   * @cckGroup forms
   * @cckSemantic none
   * @cckParity Declared as an input.
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
    const ownIds = (kind: FieldPartKind): (string | undefined)[] =>
      this.registered[kind].items().map((part) => part.ownId());
    const ids = formFieldIds(this._fieldId(), { hints: ownIds('hints'), errors: ownIds('errors') });
    return { ...ids, label: this._labelId() ?? ids.label };
  });

  /**
   * Registers a Hint or a FieldError. Call it in the part's injection context: the host element of the part gives
   * its place. The control's `aria-describedby` lists the ids of the registered parts: hints first, then errors,
   * each in document order, in the same render.
   *
   * @param kind - `hints` for a Hint, `errors` for a FieldError.
   * @param ownId - The `id` the author gives the part; an empty or missing id gets a generated one.
   * @returns The id the part renders: the author's, or `<fieldId>-hint-<n>` / `<fieldId>-error-<n>`.
   * @internal
   */
  _registerPart(kind: FieldPartKind, ownId: Signal<string | undefined>): Signal<string | undefined> {
    const list = this.registered[kind];
    const part: FieldPart = { element: inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, ownId };
    inject(DestroyRef).onDestroy(list.add(part));
    return computed(() => this._ids()[kind]?.[list.items().indexOf(part)]);
  }

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

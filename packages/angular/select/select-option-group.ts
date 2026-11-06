import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { CckAttrs, IdGenerator, bindAttrs } from '@cocokits/angular-core';
import { selectAnatomy, type SelectGroupItem } from '@cocokits/machines/select';
import { injectCckSelect } from './select';

/**
 * A group of options with a label. Disabling the group disables every option in it. The label is the `label` text, or your own markup.
 *
 * For markup, put a `cckSelectOptionGroupLabel` template inside the group. The markup must not be interactive.
 *
 * @example
 * <div cckSelectOptionGroup label="Desserts">
 *   <div cckSelectOption value="Cake">Cake</div>
 * </div>
 * @cckPart optionGroup
 * @cckSection optionGroupLabel label label
 * @cckSlot default - The options of the group.
 * @cckSlot label ng-template[cckSelectOptionGroupLabel] - Your own markup for the label, in place of the `label` text.
 */
@Component({
  selector: '[cckSelectOptionGroup]',
  exportAs: 'cckSelectOptionGroup',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs, NgTemplateOutlet],
  host: {
    '[class]': 'props().class',
    '[attr.role]': 'props().role',
    '[attr.aria-labelledby]': 'props()["aria-labelledby"]',
    '[attr.aria-disabled]': 'props()["aria-disabled"]',
    '[attr.data-disabled]': 'props()["data-disabled"]',
  },
  template: `
    <div [class]="labelProps().class" [attr.id]="labelProps().id" [cckAttrs]="_root._theme().optionGroupLabel">
      @if (_labelTemplate(); as template) {
        <ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="labelContext" />
      } @else {
        {{ label() }}
      }
    </div>
    <ng-content />
  `,
})
export class CckSelectOptionGroup {
  /**
   * The text of the label of the group. When not set, the group has no label text. To write markup, use the `cckSelectOptionGroupLabel` template.
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue ''
   */
  readonly label = input('');

  /**
   * Whether the group is disabled. The user cannot choose its options.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @internal */
  readonly _root = injectCckSelect<unknown>('OptionGroup');
  /** @internal */
  readonly _labelTemplate = signal<TemplateRef<object> | null>(null);

  protected readonly labelContext = {};
  private readonly key = inject(IdGenerator).getId(selectAnatomy.classes.optionGroup);
  private readonly item = computed<SelectGroupItem>(() => ({ key: this.key, disabled: this.disabled() }));
  protected readonly props = computed(() => this._root.parts().optionGroup(this.item()));
  protected readonly labelProps = computed(() => this._root.parts().optionGroupLabel(this.item()));

  constructor() {
    bindAttrs(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this._root._theme().optionGroup);
  }
}

/**
 * Your own markup for the label of an option group, in place of the `label` text.
 *
 * The group uses this template instead of the text of the `label` input. The markup must not be interactive.
 *
 * @defaultValue The group shows the text of the `label` input.
 * @example
 * <div cckSelectOptionGroup>
 *   <ng-template cckSelectOptionGroupLabel><b>Desserts</b></ng-template>
 *   <div cckSelectOption value="Cake">Cake</div>
 * </div>
 * @cckTemplate ng-template[cckSelectOptionGroupLabel]
 */
@Directive({ selector: 'ng-template[cckSelectOptionGroupLabel]', exportAs: 'cckSelectOptionGroupLabel' })
export class CckSelectOptionGroupLabel {
  private readonly group = inject(CckSelectOptionGroup);
  private readonly template = inject<TemplateRef<object>>(TemplateRef);

  constructor() {
    this.group._labelTemplate.set(this.template);
    inject(DestroyRef).onDestroy(() => {
      this.group._labelTemplate.update((current) => (current === this.template ? null : current));
    });
  }
}

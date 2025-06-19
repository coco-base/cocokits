import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { IconButtonComponent } from '@cocokits/angular-button';
import { _UiBaseComponent } from '@cocokits/angular-core';
import { SvgIconComponent } from '@cocokits/angular-icon';

import { AccordionStore } from '../accordion.store';
import { AccordionComponent } from '../accordion/accordion.component';
import { AccordionHeaderIconTemplateDirective } from '../accordion-header-icon.tmpl-directive';
import { AccordionPanelComponent } from '../accordion-panel/accordion-panel.component';

@Component({
  standalone: true,
  imports: [IconButtonComponent, SvgIconComponent, CommonModule],
  selector: 'cck-accordion-header',
  templateUrl: './accordion-header.component.html',
  styleUrls: ['./accordion-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'hostClassNames()',
    '(click)': 'onHostClick()',
  },
})
export class AccordionHeaderComponent extends _UiBaseComponent<'accordionHeader'> {
  protected readonly componentName = 'accordionHeader';
  protected extraHostElementClassConditions = computed(() => [
    { if: this.accordionRef.iconPosition() === 'left', classes: this.classNames().iconLeft },
    { if: this.accordionRef.iconPosition() === 'right', classes: this.classNames().iconRight },
    { if: this.accordionRef.toggleTrigger() === 'icon', classes: this.classNames().triggerIcon },
    { if: this.accordionRef.toggleTrigger() === 'header', classes: this.classNames().triggerHeader },
  ]);

  protected accordionRef = inject(AccordionComponent);
  protected panelRef = inject(AccordionPanelComponent);
  protected store = inject(AccordionStore);

  protected expandedIcon: string;
  protected collapsedIcon: string;

  protected readonly isExpanded = this.store.isExpanded(this.panelRef._id);

  private customIconTemp = contentChild(AccordionHeaderIconTemplateDirective, { read: TemplateRef<HTMLElement> });
  private defaultIconTemp = viewChild.required<TemplateRef<HTMLElement>>('defaultIconTemp');

  protected template = computed(
    () => this.customIconTemp() ?? this.accordionRef._customIconTemp() ?? this.defaultIconTemp()
  );

  constructor() {
    super();

    const expandedIcon = this.themeConfig.components.accordion?.templates?.accordionExpandedIcon;
    const collapsedIcon = this.themeConfig.components.accordion?.templates?.accordionCollapsedIcon;
    if (!expandedIcon) {
      throw new Error('`accordionExpandedIcon` has not defined in `ThemeConfig` of selected theme');
    }
    if (!collapsedIcon) {
      throw new Error('`accordionCollapsedIcon` has not defined in `ThemeConfig` of selected theme');
    }

    this.expandedIcon = expandedIcon;
    this.collapsedIcon = collapsedIcon;
  }

  protected onHostClick() {
    if (this.panelRef.disabled() || this.accordionRef.toggleTrigger() !== 'header') {
      return;
    }
    this.store.toggle(this.panelRef._id);
  }

  protected toggle() {
    if (this.panelRef.disabled() || this.accordionRef.toggleTrigger() !== 'icon') {
      return;
    }
    this.store.toggle(this.panelRef._id);
  }
}

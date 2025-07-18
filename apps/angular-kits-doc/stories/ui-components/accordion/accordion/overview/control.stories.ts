import { Component, effect, input } from '@angular/core';

import { moduleMetadata } from '@storybook/angular';

import { AccordionComponent, AccordionHeaderComponent, AccordionPanelComponent } from '@cocokits/angular-accordion';
import { Selection } from '@cocokits/common-utils';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-angular';

@Component({
  selector: 'cck-accordion-control',
  imports: [AccordionComponent, AccordionHeaderComponent, AccordionPanelComponent],
  styles: [
    `
      hr {
        width: 100%;
        margin: 12px 0;
      }
    `,
  ],
  template: `
    <div class="cck-doc-story__radio-selection-group">
      @if (selection.isMultipleSelection()) {
        <button class="cck-doc-story__button--basic" (click)="selection.clear()">Collapse All</button>
        <button class="cck-doc-story__button--basic" (click)="selection.setSelection(['1', '2', '3'])">
          Expand All
        </button>
      }
      <div
        class="cck-doc-story__radio-selection"
        [class.cck-doc-story__radio-selection--selected]="selection.isSelected('1')"
        (click)="selection.toggle('1')">
        1
      </div>
      <div
        class="cck-doc-story__radio-selection"
        [class.cck-doc-story__radio-selection--selected]="selection.isSelected('2')"
        (click)="selection.toggle('2')">
        2
      </div>
      <div
        class="cck-doc-story__radio-selection"
        [class.cck-doc-story__radio-selection--selected]="selection.isSelected('3')"
        (click)="selection.toggle('3')">
        3
      </div>
    </div>

    <hr />

    <cck-accordion
      [multiMode]="selection.isMultipleSelection()"
      [expanded]="selection.selected"
      (expandedChange)="selection.setSelection($event)">
      <cck-accordion-panel value="1">
        <cck-accordion-header>Accordion Header 1</cck-accordion-header>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.
      </cck-accordion-panel>

      <cck-accordion-panel value="2" disabled>
        <cck-accordion-header>Accordion Header 2</cck-accordion-header>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.
      </cck-accordion-panel>

      <cck-accordion-panel value="3">
        <cck-accordion-header>Accordion Header 3</cck-accordion-header>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua.
      </cck-accordion-panel>
    </cck-accordion>
  `,
})
export class StoryAccordionControlComponent {
  multiMode = input.required<boolean>();
  selection = new Selection<string>();

  __onMultiModeChange = effect(() => {
    this.selection.updateOptions({
      multiple: this.multiMode(),
    });
  });
}

export const Control: StoryObj<AccordionComponent> = {
  name: 'Control',
  decorators: [
    moduleMetadata({
      imports: [StoryAccordionControlComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Panels can be controlled programmatically to collapse or expand.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'example.component.html',
          language: 'angular-html',
          code: `
            <div class="cck-doc-story__radio-selection-group">
              @if(selection.isMultipleSelection()) {
                <button
                  class="cck-doc-story__button--basic"
                  (click)="selection.clear()">
                  Collapse All
                </button>
                <button
                  class="cck-doc-story__button--basic"
                  (click)="selection.setSelection(['1', '2', '3'])">
                  Expand All
                </button>
              }
              <div
                class="cck-doc-story__radio-selection"
                [class.cck-doc-story__radio-selection--selected]="selection.isSelected('1')"
                (click)="selection.toggle('1')">
                1
              </div>
              <div
                class="cck-doc-story__radio-selection"
                [class.cck-doc-story__radio-selection--selected]="selection.isSelected('2')"
                (click)="selection.toggle('2')">
                2
              </div>
              <div
                class="cck-doc-story__radio-selection"
                [class.cck-doc-story__radio-selection--selected]="selection.isSelected('3')"
                (click)="selection.toggle('3')">
                3
              </div>
            </div>

            <hr />

            <cck-accordion
              [multiMode]="selection.isMultipleSelection()"
              [expanded]="selection.selected"
              (expandedChange)="selection.setSelection($event)">
              <cck-accordion-panel value="1">
                <cck-accordion-header>Accordion Header 1</cck-accordion-header>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
                  magna aliqua.
              </cck-accordion-panel>

              <cck-accordion-panel value="2" disabled>
                <cck-accordion-header>Accordion Header 2</cck-accordion-header>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
                  magna aliqua.
              </cck-accordion-panel>

              <cck-accordion-panel value="3">
                <cck-accordion-header>Accordion Header 3</cck-accordion-header>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
                  magna aliqua.
              </cck-accordion-panel>
            </cck-accordion>
          `,
        },
        {
          filename: 'example.component.ts',
          language: 'angular-ts',
          code: `
            @Component({
              selector: 'cck-accordion-control',
              imports: [AccordionComponent, AccordionHeaderComponent, AccordionPanelComponent],
              stylesUrls: ['./example.component.scss'],
              templateUrl: './example.component.html',
            })
            export class StoryAccordionControlComponent {
              multiMode = input.required<boolean>();
              selection = new Selection<string>();

              __onMultiModeChange = effect(() => {
                this.selection.updateOptions({
                  multiple: this.multiMode(),
                });
              });
            }
          `,
        },
        {
          filename: 'example.component.scss',
          language: 'scss',
          code: `
            // Warning: The styles below are optimized for dark mode.

            .cck-doc-story__radio-selection-group {
              display: flex;
              justify-content: center;
              gap: 8px;
            }

            .cck-doc-story__radio-selection {
              width: 32px;
              height: 32px;
              border: 1px solid var(--cck-doc-color-border-3, #ffffff33);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--cck-doc-color-font-1, #fff);
              font: var(--cck-doc-text-sm-light, 300 14px/24px Inter);
              cursor: pointer;
              user-select: none;
            }

            .cck-doc-story__radio-selection--selected {
              background-color: var(--cck-doc-color-bg-selected-2, #14513c);
            }

            .cck-doc-story__button--basic {
              padding: 0 16px 0 16px;
              background-color: transparent;
              color: var(--cck-doc-color-font-1, #fff);
              gap: 8px;
              height: 40px;
              align-items: center;
              border: none;
              border-radius: var(--cck-doc-radius-sm, 4px);
              box-sizing: border-box;
              cursor: pointer;
              display: flex;
              font: var(--cck-doc-text-sm-medium, 500 14px/24px Inter);
              justify-content: center;
              margin: 0;
              min-width: 80px;
              outline: transparent;

              &:hover {
                background-color: var(--cck-doc-color-bg-hover-2, #15171e);
              }
          }
          `,
        },
      ],
      singleControls: ['mode'],
      hasControl: false,
      controls: [CCK_CONTROL.customSelect('Mode', ['Single', 'Multi'])],
    },
  },
  render: (args) => {
    return {
      props: {
        ...args,
        selected: null,
      },
      template: `
        <cck-accordion-control [multiMode]="cckControl.mode === 'Multi'"/>
      `,
    };
  },
};

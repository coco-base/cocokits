import { Accordion, AccordionHeader, AccordionPanel } from '@cocokits/react-accordion';
import { useSelection } from '@cocokits/react-utils';
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj } from '@cocokits/storybook-addon-theme-react';

function AccordionControl({ multiMode = false }: { multiMode: boolean }) {
  const { selected, selection } = useSelection({ multiple: multiMode });

  return (
    <>
      <div className="cck-doc-story__radio-selection-group">
        {multiMode && (
          <>
            <button className="cck-doc-story__button--basic" onClick={() => selection.clear()}>
              Collapse All
            </button>
            <button className="cck-doc-story__button--basic" onClick={() => selection.setSelection(['1', '2', '3'])}>
              Expand All
            </button>
          </>
        )}
        <div
          className={
            'cck-doc-story__radio-selection' +
            (selected?.includes('1') ? ' cck-doc-story__radio-selection--selected' : '')
          }
          onClick={() => selection.toggle('1')}>
          1
        </div>
        <div
          className={
            'cck-doc-story__radio-selection' +
            (selected?.includes('2') ? ' cck-doc-story__radio-selection--selected' : '')
          }
          onClick={() => selection.toggle('2')}>
          2
        </div>
        <div
          className={
            'cck-doc-story__radio-selection' +
            (selected?.includes('3') ? ' cck-doc-story__radio-selection--selected' : '')
          }
          onClick={() => selection.toggle('3')}>
          3
        </div>
      </div>
      <hr style={{ width: '100%', margin: '12px 0' }} />
      <Accordion multiMode={multiMode} expanded={selected} expandedChange={(e: string[]) => selection.setSelection(e)}>
        <AccordionPanel value="1">
          <AccordionHeader>Accordion Header 1</AccordionHeader>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </AccordionPanel>

        <AccordionPanel value="2" disabled>
          <AccordionHeader>Accordion Header 2</AccordionHeader>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </AccordionPanel>

        <AccordionPanel value="3">
          <AccordionHeader>Accordion Header 3</AccordionHeader>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </AccordionPanel>
      </Accordion>
    </>
  );
}

export const Control: StoryObj<typeof Accordion> = {
  name: 'Control',
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
          filename: 'example.tsx',
          language: 'tsx',
          code: `
            import { Accordion, AccordionHeader, AccordionPanel } from '@cocokits/react-components';
            import { useSelection } from '@cocokits/react-utils'; 

            function AccordionControl({ multiMode = false }: { multiMode: boolean }) {
              const {selected, selection} = useSelection({multiple: multiMode});

              return (
                <>
                  <div className="cck-doc-story__radio-selection-group">
                    {multiMode && (
                      <>
                        <button className="cck-doc-story__button--basic" onClick={() => selection.clear()}>
                          Collapse All
                        </button>
                        <button className="cck-doc-story__button--basic" onClick={() => selection.setSelection(['1', '2', '3'])}>
                          Expand All
                        </button>
                      </>
                    )}
                    <div
                      className={
                        'cck-doc-story__radio-selection' +
                        (selected?.includes('1') ? ' cck-doc-story__radio-selection--selected' : '')
                      }
                      onClick={() => selection.toggle('1')}>
                      1
                    </div>
                    <div
                      className={
                        'cck-doc-story__radio-selection' +
                        (selected?.includes('2') ? ' cck-doc-story__radio-selection--selected' : '')
                      }
                      onClick={() => selection.toggle('2')}>
                      2
                    </div>
                    <div
                      className={
                        'cck-doc-story__radio-selection' +
                        (selected?.includes('3') ? ' cck-doc-story__radio-selection--selected' : '')
                      }
                      onClick={() => selection.toggle('3')}>
                      3
                    </div>
                  </div>
                  <hr/>
                  <Accordion
                    multiMode={multiMode}
                    expanded={selected}
                    expandedChange={(e: string[]) => selection.setSelection(e)}>
                    <AccordionPanel value="1">
                      <AccordionHeader>Accordion Header 1</AccordionHeader>
                      
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                        dolore magna aliqua.
                      
                    </AccordionPanel>

                    <AccordionPanel value="2" disabled>
                      <AccordionHeader>Accordion Header 2</AccordionHeader>
                      
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                        dolore magna aliqua.
                      
                    </AccordionPanel>

                    <AccordionPanel value="3">
                      <AccordionHeader>Accordion Header 3</AccordionHeader>
                      
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                        dolore magna aliqua.
                      
                    </AccordionPanel>
                  </Accordion>
                </>
              );
            }
          `,
        },
        {
          filename: 'styles.scss',
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

            hr {
              width: 100%;
              margin: 12px 0;
            }
          `,
        },
      ],
      singleControls: ['mode'],
      hasControl: false,
      controls: [CCK_CONTROL.customSelect('Mode', ['Single', 'Multi'])],
    },
  },
  render: (args) => <AccordionControl multiMode={args.cckControl.mode === 'Multi'} />,
};

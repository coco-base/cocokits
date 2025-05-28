import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj, withWrapperDecorator } from '@cocokits/storybook-addon-theme-react';

import { OverlayPortalExample } from './portal';

export const Portal: StoryObj<typeof OverlayPortalExample> = {
  name: 'Portal',
  decorators: [withWrapperDecorator({ insideBox: true })],
  parameters: {
    docs: {
      description: {
        story:
          'Shows the default example with no additional configurations, providing an interactive example in its most basic form.',
      },
    },
    cckAddon: {
      renderConditions: [renderWithPageTab('Overview')],
      source: [
        {
          filename: 'OverlayPortalExample.tsx',
          language: 'tsx',
          code: `
          import './OverlayPortalExample.scss';
          import { useState } from "react";
          
          import { Button, FormField, Input, OverlayPortal, OverlayPortalManager } from "@cocokits/react-components";
          
          
          export const OverlayPortalExample = () => {
          
            const id = 'OverlayPortalExample';
            const portalManager = OverlayPortalManager.getWithId(id);
          
            const [text, setText] = useState('');
            const [result, setResult] = useState('');
          
          
            const openOverlay = async () => {
              portalManager.open({
                disableBackdropClose: <%= disableBackdropClose %>,
                hasBackdrop: <%= hasBackdrop %>,
                panelClass: ['overlay-portal-example']
              });
            };
          
            const onCloseClick = () => {
              portalManager.close();
            };
          
            return (
              <div className='overlay-portal__host'>
                <FormField>
                  <Input placeholder='Enter any text' onInput={e => setText(e.currentTarget.value)}/>
                </FormField>
          
                <p className="overlay-portal__text">
                  <b>Overlay Result: </b>
                  {result}
                </p>
          
                <Button onClick={openOverlay}>Open</Button>
          
                <OverlayPortal portalId={id}>
                  <div className="overlay-dialog-standalone__host">
                    <h3 className='overlay-dialog-standalone__header'>THIS IS A OVERLAY</h3>
                    <p className='overlay-dialog-standalone__text'>
                      <b>Data: </b>
                      {text}
                    </p>
          
                    <FormField>
                      <Input placeholder="Enter the result text" onInput={(e) => setResult(e.currentTarget.value)}/>
                    </FormField>
          
                    <Button onClick={onCloseClick}>Close Overlay</Button>
                  </div>
                </OverlayPortal>
              </div>
            );
          };
            
          `,
        },
        {
          filename: 'OverlayPortalExample.scss',
          language: 'scss',
          code: `
            .overlay-dialog-portal__host {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            .overlay-dialog-portal__header {
              font: var(--cck-doc-display-xs-medium, 500 24px / 38px Inter);
              color: var(--cck-doc-color-font-1, #000);
            }

            .overlay-dialog-portal__text {
              font: var(--cck-doc-text-sm-regular, 400 14px / 24px Inter);
              color: var(--cck-doc-color-font-3, #ccc);
            }

            .overlay-portal__host {
              padding: 8px 4px;
              display: flex;
              gap: 12px;
              flex-direction: column;
              align-items: center;
            }

            .overlay-portal__text {
              font: var(--cck-doc-text-sm-regular, 400 14px/24px Inter);
              color: var(--cck-doc-color-font-3, #ccc);
            }


            .overlay-portal-example .cck-overlay__content-wrapper {
              background-color: var(--cck-doc-color-bg-2, #15171e);
              border: 1px solid var(--cck-doc-color-border-1, #2d2f36);
              padding: 12px 24px 24px;
              border-radius: var(--cck-doc-radius-md, 8px);
            }

            .overlay-portal-example .cck-overlay__backdrop {
              background-color: color-mix(in srgb, var(--cck-doc-color-bg-1, #0d0e11) 80%, transparent);
            }

          `,
        },
      ],
      hasControl: true,
      controls: [CCK_CONTROL.hasBackdrop(), CCK_CONTROL.disableBackdropClose()],
    },
  },
  render: (args) => {
    return (
      <OverlayPortalExample
        hasBackdrop={args.cckControl.hasBackdrop}
        disableBackdropClose={args.cckControl.disableBackdropClose}
      />
    );
  },
};

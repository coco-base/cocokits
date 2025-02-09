
import { CCK_CONTROL, renderWithPageTab } from '@cocokits/storybook-addon-theme';
import { StoryObj, withWrapperDecorator } from '@cocokits/storybook-addon-theme-react';

import {OverlayPortalAsComponentExample} from './portal-as-component';


export const PortalAsComponent: StoryObj<typeof OverlayPortalAsComponentExample> = {
  name: 'Portal as Component',
  decorators: [withWrapperDecorator({insideBox: true})],
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
          filename: 'OverlayPortalAsComponentExample.tsx',
          language: 'tsx',
          code: `
            import './OverlayPortalAsComponentExample.scss';
            import { useState } from "react";
            
            import { Button, FormField, Input, OverlayPortal, OverlayPortalManager, useOverlayRef } from "@cocokits/react-components";
            
            
            interface OverlayDialogData {
              text: string;
            }
            
            interface OverlayDialogResult {
              result: string;
            }
            
            const OverlayPortalAsComponentDialogExample = () => {
            
              const {data, close} = useOverlayRef<OverlayDialogData | null, OverlayDialogResult>();
              const [text, setText] = useState('');
            
              const onCloseClick = () => {
                close({result: text});
              };
              
              return (
                <div className="overlay-dialog-standalone__host">
                  <h3 className='overlay-dialog-standalone__header'>THIS IS A OVERLAY</h3>
                  <p className='overlay-dialog-standalone__text'>
                    <b>Data: </b>
                    {data ? JSON.stringify(data, null, 2) : ''}
                  </p>
            
                  <FormField>
                    <Input placeholder="Enter the result text" onInput={(e) => setText(e.currentTarget.value)}/>
                  </FormField>
            
                  <Button onClick={onCloseClick}>Close Overlay</Button>
                </div>
              );
            };
            
            
            export const OverlayPortalAsComponentExample = ({hasBackdrop, disableBackdropClose}: {
              hasBackdrop: boolean,
              disableBackdropClose: boolean,
            }) => {
            
              const id = 'OverlayPortalAsComponentExample';
            
              const [text, setText] = useState('');
              const [result, setResult] = useState<OverlayDialogResult>();
            
            
              const openOverlay = async () => {
                const portal = OverlayPortalManager.getWithId<OverlayDialogData | null, OverlayDialogResult>(id);
                
                if(portal.getState().isOpened) {
                  return;
                }
            
                const renderedOverlay = portal.open({
                  disableBackdropClose,
                  hasBackdrop,
                  panelClass: ['overlay-portal-as-component-example'],
                  data: text ? {text} : null,
                });
            
                const overlayResult = await renderedOverlay.afterClosed;
                setResult(overlayResult ?? {result: 'No result'});
              };
            
              return (
                <div className='overlay-portal__host'>
                  <FormField>
                    <Input placeholder='Enter any text' onInput={e => setText(e.currentTarget.value)}/>
                  </FormField>
            
                  <p className="overlay-portal__text">
                    <b>Overlay Result: </b>
                    {JSON.stringify(result, null, 2)}
                  </p>
            
                  <Button onClick={openOverlay}>Open</Button>
            
                  <OverlayPortal portalId={id}>
                    <OverlayPortalAsComponentDialogExample />
                  </OverlayPortal>
                </div>
              );
            };
          `
        },
        {
          filename: 'OverlayPortalAsComponentExample.scss',
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


              .overlay-portal-as-component-example .cck-overlay__content-wrapper {
                background-color: var(--cck-doc-color-bg-2, #15171e);
                border: 1px solid var(--cck-doc-color-border-1, #2d2f36);
                padding: 12px 24px 24px;
                border-radius: var(--cck-doc-radius-md, 8px);
              }

              .overlay-portal-as-component-example .cck-overlay__backdrop {
                background-color: color-mix(in srgb, var(--cck-doc-color-bg-1, #0d0e11) 80%, transparent);
              }

          `
        },
      ],
      hasControl: true,
      controls: [
        CCK_CONTROL.hasBackdrop(),
        CCK_CONTROL.disableBackdropClose()
      ],
    },
  },
  render: (args) => {
    return (
      <OverlayPortalAsComponentExample
        hasBackdrop={args.cckControl.hasBackdrop}
        disableBackdropClose={args.cckControl.disableBackdropClose}
      />
    );
  },
};



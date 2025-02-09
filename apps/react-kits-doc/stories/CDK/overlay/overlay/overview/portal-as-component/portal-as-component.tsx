import './portal-as-component.scss';
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
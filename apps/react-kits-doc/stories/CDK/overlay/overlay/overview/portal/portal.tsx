import './portal.scss';
import { useState } from 'react';

import { Button, FormField, Input, OverlayPortal, OverlayPortalManager } from '@cocokits/react-components';

export const OverlayPortalExample = ({
  hasBackdrop,
  disableBackdropClose,
}: {
  hasBackdrop: boolean;
  disableBackdropClose: boolean;
}) => {
  const id = 'OverlayPortalExample';
  const portalManager = OverlayPortalManager.getWithId(id);

  const [text, setText] = useState('');
  const [result, setResult] = useState('');

  const openOverlay = async () => {
    portalManager.open({
      disableBackdropClose,
      hasBackdrop,
      panelClass: ['overlay-portal-example'],
    });
  };

  const onCloseClick = () => {
    portalManager.close();
  };

  return (
    <div className="overlay-portal__host">
      <FormField>
        <Input placeholder="Enter any text" onInput={(e) => setText(e.currentTarget.value)} />
      </FormField>

      <p className="overlay-portal__text">
        <b>Overlay Result: </b>
        {result}
      </p>

      <Button onClick={openOverlay}>Open</Button>

      <OverlayPortal portalId={id}>
        <div className="overlay-dialog-standalone__host">
          <h3 className="overlay-dialog-standalone__header">THIS IS A OVERLAY</h3>
          <p className="overlay-dialog-standalone__text">
            <b>Data: </b>
            {text}
          </p>

          <FormField>
            <Input placeholder="Enter the result text" onInput={(e) => setResult(e.currentTarget.value)} />
          </FormField>

          <Button onClick={onCloseClick}>Close Overlay</Button>
        </div>
      </OverlayPortal>
    </div>
  );
};

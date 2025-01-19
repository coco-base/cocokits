import React from 'react';
import styled from 'styled-components';

import { Icons } from "@cocokits/common-icons";
import { IconButton } from '@cocokits/react-button';
import { SvgIcon } from '@cocokits/react-icon';
import { OverlayRef } from '@cocokits/react-overlay';

/**
 * This component will be render in manager
 */

export type SidebarProps<TData, TResult> = TData extends void
  ? {
      title: string;
      componentRef: React.ReactNode | React.ReactNode[] | React.FC<OverlayRef<void, TResult>>;
    }
  : {
      title: string;
      data: TData;
      componentRef: React.ReactNode | React.ReactNode[] | React.FC<OverlayRef<TData, TResult>>;
    };

export function Sidebar<TData, TResult>({ data, close }: OverlayRef<SidebarProps<TData, TResult>, TResult>) {
  return (
    <StyledHost>
      <StyledHeader>
        <h3>{data.title}</h3>
        <IconButton onClick={() => close()}>
          <SvgIcon icon={Icons.close} />
        </IconButton>
      </StyledHeader>

      <StyledContent>
        {typeof data.componentRef === 'function' ? (
          'data' in data
            ? <data.componentRef data={data.data} close={close} />
            : <data.componentRef data={void 0} close={close} />
        ) : (
          data.componentRef
        )}
      </StyledContent>
    </StyledHost>
  );
}

const StyledHost = styled.div`
  width: 360px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--cck-doc-color-bg-2);
  border-left: 1px solid var(--cck-doc-color-border-2);
  padding: 16px 24px;
`;

const StyledHeader = styled.div`
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledContent = styled.div`
  width: 100%;
  flex: 1;
  padding-top: 48px;
  overflow-y: auto;
`;

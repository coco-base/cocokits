import styled from 'styled-components';

import { UIBaseComponentsPropValue } from '@cocokits/core';

import { DocMarkdown } from './DocMarkdown';

export interface DocArgTypesList {
  name: string;
  description: string | undefined;
  defaultValue?: UIBaseComponentsPropValue;
  type: UIBaseComponentsPropValue[] | (string | undefined)[];
}

interface DocArgTypesProps {
  argTypesList: DocArgTypesList[],
  hideDefault?: boolean,
  header?: string
}

export const DocArgTypesTable = ({argTypesList, hideDefault = false, header}: DocArgTypesProps) => {

  if (argTypesList.length === 0) {
    return;
  }

  return (
    <>
      { header && <StyledH4>{header}</StyledH4> }
      <table className='arg-type-table arg-type-table--full-width'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            { !hideDefault && <th>Default</th> }
          </tr>
        </thead>
        <tbody>
          {argTypesList.map(argType => (
            <tr key={argType.name}>

              <td>{argType.name}</td>

              <td>
                <StyledTypeWrapper>
                  {
                    argType.type.map(type => <code>{type?.toString()}</code>)
                  }
                </StyledTypeWrapper>
              </td>

              <td>
                {argType.description && <DocMarkdown>{argType.description}</DocMarkdown>}
              </td>

              {
                !hideDefault &&
                <td>
                  {
                    argType.defaultValue !== null &&
                    argType.defaultValue !== undefined &&
                    argType.defaultValue !== '' &&
                    argType.defaultValue !== "''" &&
                    argType.defaultValue !== '""' &&
                    <code>{argType.defaultValue?.toString()}</code>}
                </td>
              }

            </tr>
          ))}

        </tbody>
      </table>
    </>
  );
};

// region ---------------- STYLES ----------------
const StyledH4 = styled.h4`
  margin-top: 24px;
`;

const StyledTypeWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
`;
// endregion
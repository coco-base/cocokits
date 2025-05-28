import { Markdown } from '@storybook/addon-docs';
import styled from 'styled-components';

import { StoryDocPageComponentArgType } from './story-doc-page-api.model';

interface StoryDocPageApiTableProps {
  hideDefault?: boolean;
  argTypes: StoryDocPageComponentArgType[];
}

export function StoryDocPageApiTable({ hideDefault = false, argTypes }: StoryDocPageApiTableProps) {
  return (
    <StyledTableWrapper>
      <table className="arg-type-table arg-type-table--full-width">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            {!hideDefault && <th>Default</th>}
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {argTypes.map((argType, index) => (
            <tr key={index}>
              <td>{argType.name}</td>
              <td>
                <div className="arg-type-table--gap-8">
                  {argType.type.startsWith('{') ? (
                    /* If the value is ab object such as `{'{ rounded: boolean }'}`, it will be displayed as a single code block. */
                    <code key={argType.type}>{argType.type}</code>
                  ) : (
                    /* If the type is multi such as `value1 | value2`, it will be displayed as separate code blocks. */
                    argType.type.split('|').map((type) => <code key={type}>{type}</code>)
                  )}
                </div>
              </td>
              {!hideDefault && (
                <td>
                  <Markdown>{argType.defaultValue?.toString() ?? ''}</Markdown>
                </td>
              )}
              <StyledTdDescription>
                <Markdown>{argType.description ?? ''}</Markdown>
              </StyledTdDescription>
            </tr>
          ))}
        </tbody>
      </table>
    </StyledTableWrapper>
  );
}

const StyledTableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTdDescription = styled.td`
  .cck-breakpoint--mobile & {
    min-width: 300px;
  }
`;

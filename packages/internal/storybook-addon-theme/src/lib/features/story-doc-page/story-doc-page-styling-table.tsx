import styled from 'styled-components';

import { StoryDocPageStylingTableVariants } from './story-doc-page-styling.model';
import { DocPageMarkdown } from '../doc-page/doc-page-markdown';

interface StoryDocPageStylingTableProps {
  tableProps: StoryDocPageStylingTableVariants[];
}

export function StoryDocPageStylingTable({ tableProps }: StoryDocPageStylingTableProps) {
  return (
    <StyledTableWrapper>
      <table className="arg-type-table arg-type-table--full-width">
        <thead>
          <tr>
            <th>Selector</th>
            <th>Element</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {tableProps.map((tableProp, index) => (
            <tr key={index}>
              <td className="arg-type-table--no-wrap">{tableProp.cssSelector}</td>
              <td>{tableProp.elementName}</td>
              <StyledTdDescription>
                <DocPageMarkdown>{tableProp.description}</DocPageMarkdown>
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

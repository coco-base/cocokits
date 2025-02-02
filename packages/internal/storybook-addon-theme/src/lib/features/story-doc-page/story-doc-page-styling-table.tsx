import { StoryDocPageStylingTableVariants } from './story-doc-page-styling.model';
import { DocPageMarkdown } from '../doc-page/doc-page-markdown';

interface StoryDocPageStylingTableProps {
  tableProps: StoryDocPageStylingTableVariants[];
}

export function StoryDocPageStylingTable({ tableProps }: StoryDocPageStylingTableProps) {
  return (
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
            <td>
              <DocPageMarkdown>{tableProp.description}</DocPageMarkdown>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

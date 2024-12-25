import styled from "styled-components";

export function StoryDocPageExamples() {  
  return (
    <>
      <StyledTitle>Coming Soon</StyledTitle>
      <p>We are working hard to bring you more amazing and real use case examples for each component. Stay tuned!</p>
    </>
  );
}

const StyledTitle = styled.div`
    font: var(--cck-doc-display-sm-regular);
    color: var(--cck-doc-color-font-1);
    text-align: center;
    margin-top: 64px;
    margin-bottom: 24px;
`;
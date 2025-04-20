/* eslint-disable no-irregular-whitespace */
import React from "react";
import { styled } from "styled-components";
import { NeonBox } from "./neon-box";

export function WhoCanUse() {

  return (
    <StyledHost>
      <h2>Who can I use CocoKits?</h2>

      <StyledNeonBoxGrid>
        <StyledNeonBox color="purple">
          <StyledNeonBoxText>Designers</StyledNeonBoxText>
          <StyledNeonBoxIcon viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.0723 0.89226C20.2945 0.343042 21.7055 0.343042 22.9277 0.89226L40.8598 8.93153C41.557 9.24195 42 9.91853 42 10.6667C42 11.4149 41.557 12.0915 40.8598 12.4019L22.9277 20.4412C21.7055 20.9904 20.2945 20.9904 19.0723 20.4412L1.14023 12.4019C0.442969 12.0836 0 11.407 0 10.6667C0 9.92649 0.442969 9.24195 1.14023 8.93153L19.0723 0.89226ZM36.4957 17.1618L40.8598 19.1199C41.557 19.4303 42 20.1069 42 20.8551C42 21.6033 41.557 22.2799 40.8598 22.5903L22.9277 30.6296C21.7055 31.1788 20.2945 31.1788 19.0723 30.6296L1.14023 22.5903C0.442969 22.2719 0 21.5954 0 20.8551C0 20.1149 0.442969 19.4303 1.14023 19.1199L5.5043 17.1618L17.973 22.7495C19.8926 23.6092 22.1074 23.6092 24.027 22.7495L36.4957 17.1618ZM24.027 32.9379L36.4957 27.3502L40.8598 29.3083C41.557 29.6187 42 30.2953 42 31.0435C42 31.7917 41.557 32.4683 40.8598 32.7787L22.9277 40.818C21.7055 41.3672 20.2945 41.3672 19.0723 40.818L1.14023 32.7787C0.442969 32.4603 0 31.7837 0 31.0435C0 30.3032 0.442969 29.6187 1.14023 29.3083L5.5043 27.3502L17.973 32.9379C19.8926 33.7975 22.1074 33.7975 24.027 32.9379Z"/>
          </StyledNeonBoxIcon>

          <StyledNeonBoxList>
            <li>Convert Figma Components to Code: Transform your Figma components into popular framework components (Angular, React, Vue, or just HTML) without needing to learn any frameworks. You only need to know CSS.</li>
            <li>Design Package Creation: We provide you with fully functional components in each framework without any styles. You can then create your design package (only CSS/SCSS) to style the components and make them ready for developers.</li>
            <li>Support for Existing Design Systems: If you have an existing design system and want to convert it to include component code for developers, CocoKits is your best solution.</li>
            <li>Full Support: We offer comprehensive support during the process with various examples and online sessions to answer any of your questions.</li>
          </StyledNeonBoxList>
        </StyledNeonBox>

        <StyledNeonBox color="brand">
          <StyledNeonBoxText>Developers</StyledNeonBoxText>
          <StyledNeonBoxIcon viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 6.05615C0 3.10477 2.30625 0.7052 5.14286 0.7052H30.8571C33.6937 0.7052 36 3.10477 36 6.05615V32.8109C36 35.7623 33.6937 38.1618 30.8571 38.1618H5.14286C2.30625 38.1618 0 35.7623 0 32.8109V6.05615ZM21.0696 12.0676C20.3545 12.8953 20.4187 14.1578 21.2143 14.9019L26.0438 19.4335L21.2062 23.9651C20.4107 24.7092 20.3464 25.9717 21.0616 26.7994C21.7768 27.6272 22.9902 27.694 23.7857 26.9499L30.2143 20.9301C30.6241 20.5455 30.8491 20.0104 30.8491 19.4419C30.8491 18.8733 30.6161 18.3299 30.2143 17.9537L23.7857 11.9338C22.9902 11.1897 21.7768 11.2566 21.0616 12.0843L21.0696 12.0676ZM14.7938 14.9019C15.5893 14.1578 15.6536 12.8953 14.9384 12.0676C14.2232 11.2399 13.0098 11.173 12.2143 11.9171L5.78571 17.9369C5.37589 18.3215 5.15089 18.8566 5.15089 19.4252C5.15089 19.9937 5.38393 20.5372 5.78571 20.9134L12.2143 26.9332C13.0098 27.6773 14.2232 27.6104 14.9384 26.7827C15.6536 25.955 15.5893 24.6925 14.7938 23.9484L9.95625 19.4335L14.7938 14.9019Z" fill="#999999"/>
          </StyledNeonBoxIcon>

          <StyledNeonBoxList>
            <li>Production-Ready Components: CocoKits is ready to be used in your production environment with the core components of your favorite design system.</li>
            <li>Fully Customizable: Depending on your project and requirements, you can easily change the style of any component and modify the theme of your design system quickly and effortlessly.</li>
            <li>Component Examples: All components come with various examples, so you can see how each component looks in different scenarios.</li>
            <li>Override Default Configurations: You can override the default configurations of the components based on your specific requirements.</li>
          </StyledNeonBoxList>
        </StyledNeonBox>

      </StyledNeonBoxGrid>

    </StyledHost>
  )
}

const StyledHost = styled.div`
  margin-bottom: 60px;
  container-type: inline-size;
`;  

const StyledNeonBoxGrid = styled.div`
  display: flex;
  gap: 24px;
  justify-content: space-around;
  margin: 48px 0;

  @container (max-width: 600px) {
    flex-direction: column;
  }
`;

const StyledNeonBox = styled(NeonBox)`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: 84px auto;
  flex: 1;
  padding: 48px;
  height: auto;
  width: auto;
`;

const StyledNeonBoxText = styled.p`
  font: var(--cck-doc-display-sm-medium);
  color: var(--cck-doc-color-font-1);
`;

const StyledNeonBoxIcon = styled.svg`
  width: 40px;
  fill: var(--cck-doc-color-font-3);
`;

const StyledNeonBoxList = styled.ul`
  grid-column: 1 / span 2;
  margin: 0;
  padding: 0;
`;

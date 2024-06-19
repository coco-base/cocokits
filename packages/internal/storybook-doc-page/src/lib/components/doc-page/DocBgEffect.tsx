import styled from 'styled-components';

export function DocBgEffect() {
  return (
    <Wrapper>
      <BrandGradiant/>

      <BoxWrapper>
        <Box/>
        <Box/>
        <Box/>
        <Box/>
      </BoxWrapper>

      <SharkEffect>
        {/* packages/internal/storybook-doc-page/src/assets/doc-page-header-effect-shark.png */}
        <SharkEffectImg src="/doc-page-header-effect-shark.png"/>
      </SharkEffect>

      <Overlay/>
    </Wrapper>
  );
}


// region ---------------- STYLES ----------------
const Wrapper = styled.div`
    height: var(--size-480);
    display: flex;
    justify-content: center;
    align-items: center;
    
    position: absolute;
    left: var(--size-0);
    right: var(--size-0);
    top: var(--size-0);

    overflow: hidden;
`;

const BrandGradiant = styled.div`
    background: var(--effect-gradient-doc-page-header-brand);
    height: 100%;
    position: absolute;
    width: 100%;
`;

const BoxWrapper = styled.div`
    position: absolute;
    display: flex;
    align-items: baseline;
    gap: var(--size-24);
    height: 100%;
    width: var(--size-1280);
`;

const Box = styled.div`
    width: 25%;
    aspect-ratio: 1 / 1;
    flex: 1;
    
    border-width: 0 var(--size-1) 0 var(--size-1);
    border-style: solid;
    border-color: var(--color-border-alpha-4);
    border-radius: var(--size-24);
    background: var(--effect-gradient-doc-page-header-box);
    transform: rotate(45deg);
`;

const SharkEffect = styled.div`
    position: absolute;
    inset: calc(-1 * var(--size-28)) calc(-1 * var(--size-24));;
    opacity: 0.2;
    z-index: 0;
`;

const SharkEffectImg = styled.img`
    width: 100%;
`;

const Overlay = styled.div`
    background: var(--effect-gradient-doc-page-header-overlay);
    inset: -5px -18px -20px;
    position: absolute;
`;
// endregion
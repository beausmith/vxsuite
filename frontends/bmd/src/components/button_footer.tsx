import styled, { css } from 'styled-components';

const buttonFooterButtonStyles = css`
  button {
    padding-right: 10px;
    padding-left: 10px;
  }
`;

export const ButtonFooter = styled.nav`
  display: flex;
  background: ${({ theme }) => theme.contrast.foreground};
  padding: 20px;
  color: ${({ theme }) => theme.contrast.foreground};
  gap: 20px;
  & > * {
    flex: 1;
    &:first-child {
      flex: 2 1;
      order: 1;
    }
  }
  /* stylelint-disable-next-line value-keyword-case, order/order */
  ${buttonFooterButtonStyles}
`;

// const Nav = styled.nav`
//   display: flex;
//   flex-wrap: wrap;
//   align-items: flex-start;
//   justify-content: space-between;
//   background: ${({ theme }) => theme.contrast.background};
//   color: ${({ theme }) => theme.contrast.foreground};
//   padding: ${inchesToPixels(0.07)}px;
//   border-bottom: 2px solid;
// `;

export const ButtonFooterLandscape = styled.div`
  display: flex;
  gap: 20px;
  & > * {
    flex: 1;
  }
  /* stylelint-disable-next-line value-keyword-case, order/order */
  ${buttonFooterButtonStyles}
`;

import styled from 'styled-components';

export const ButtonBar = styled('nav')`
  display: flex;
  flex-wrap: wrap-reverse;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 10px;
  gap: 10px;

  & > *:first-child {
    order: 2;
    min-width: 50%;
  }

  & > * {
    flex-grow: 1;
  }
  & > *:only-child {
    @media (min-width: 480px) {
      flex-grow: initial;
      margin: auto;
      min-width: 33.333%;
    }
  }
`;

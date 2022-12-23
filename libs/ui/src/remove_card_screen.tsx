import React from 'react';
import styled from 'styled-components';
import { Screen } from './screen';
import { Main } from './main';
import { Prose } from './prose';

const RemoveCardImage = styled.img`
  margin: 0 auto -1rem;
  height: 30vw;
`;

interface Props {
  productName: string;
}

export function RemoveCardScreen({ productName }: Props): JSX.Element {
  return (
    <Screen>
      <Main centerChild>
        <Prose textCenter scale={2}>
          <RemoveCardImage aria-hidden src="/assets/remove-card.svg" alt="" />
          <h1>{productName} Unlocked</h1>
          <p>Remove card to continue.</p>
        </Prose>
      </Main>
    </Screen>
  );
}

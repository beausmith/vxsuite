import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { Button, Main, MainChild } from '@votingworks/ui';
import { BallotContext } from '../contexts/ballot_context';

import { Prose } from '../components/prose';
import { Screen } from '../components/screen';

export function NotFoundPage({
  location: { pathname },
}: RouteComponentProps): JSX.Element {
  const { resetBallot } = useContext(BallotContext);
  function requestResetBallot() {
    resetBallot();
  }
  return (
    <Screen>
      <Main>
        <MainChild center>
          <Prose textCenter>
            <h1>Page Not Found.</h1>
            <p>
              No page exists at <code>{pathname}</code>.
            </p>
            <p>
              <Button onPress={requestResetBallot}>Start Over</Button>
            </p>
          </Prose>
        </MainChild>
      </Main>
    </Screen>
  );
}
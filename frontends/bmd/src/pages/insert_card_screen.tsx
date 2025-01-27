import React, { useEffect } from 'react';
import styled from 'styled-components';
import {
  ElectionDefinition,
  PollsState,
  PrecinctSelection,
} from '@votingworks/types';
import {
  Main,
  Screen,
  Prose,
  TestMode,
  Text,
  ElectionInfoBar,
} from '@votingworks/ui';

import { throwIllegalValue } from '@votingworks/utils';
import { triggerAudioFocus } from '../utils/trigger_audio_focus';

const InsertCardImage = styled.img`
  margin: 0 auto -1rem;
  height: 30vw;
`;

interface Props {
  appPrecinct: PrecinctSelection;
  electionDefinition: ElectionDefinition;
  showNoChargerAttachedWarning: boolean;
  isLiveMode: boolean;
  pollsState: PollsState;
  showNoAccessibleControllerWarning: boolean;
}

export function InsertCardScreen({
  appPrecinct,
  electionDefinition,
  showNoChargerAttachedWarning,
  isLiveMode,
  pollsState,
  showNoAccessibleControllerWarning,
}: Props): JSX.Element {
  useEffect(triggerAudioFocus, []);

  const mainText = (() => {
    switch (pollsState) {
      case 'polls_closed_initial':
        return (
          <React.Fragment>
            <h1>Polls Closed</h1>
            <p>Insert Poll Worker card to open.</p>
          </React.Fragment>
        );
      case 'polls_open':
        return <h1>Insert Card</h1>;
      case 'polls_paused':
        return (
          <React.Fragment>
            <h1>Voting Paused</h1>
            <p>Insert Poll Worker card to resume voting.</p>
          </React.Fragment>
        );
      case 'polls_closed_final':
        return (
          <React.Fragment>
            <h1>Polls Closed</h1>
            <p>Voting is complete.</p>
          </React.Fragment>
        );
      /* istanbul ignore next - compile time check for completeness */
      default:
        throwIllegalValue(pollsState);
    }
  })();

  return (
    <Screen white>
      {!isLiveMode && <TestMode />}
      <Main centerChild>
        <Prose textCenter id="audiofocus">
          {showNoChargerAttachedWarning && (
            <Text warning small>
              <strong>No Power Detected.</strong> Please ask a poll worker to
              plug in the power cord for this machine.
            </Text>
          )}
          <p>
            <InsertCardImage
              aria-hidden
              src="/images/insert-card.svg"
              alt="Insert Card Diagram"
            />
          </p>
          {mainText}
          {showNoAccessibleControllerWarning && (
            <Text muted small>
              Voting with an accessible controller is not currently available.
            </Text>
          )}
        </Prose>
      </Main>
      <ElectionInfoBar
        electionDefinition={electionDefinition}
        precinctSelection={appPrecinct}
      />
    </Screen>
  );
}

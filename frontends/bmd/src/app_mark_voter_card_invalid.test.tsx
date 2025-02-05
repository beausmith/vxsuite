import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import {
  electionSample,
  electionSampleDefinition,
} from '@votingworks/fixtures';
import { makePollWorkerCard, makeVoterCard } from '@votingworks/test-utils';
import { MemoryStorage, MemoryCard, MemoryHardware } from '@votingworks/utils';

import { App } from './app';

import {
  advanceTimers,
  advanceTimersAndPromises,
} from '../test/helpers/smartcards';

import {
  setElectionInStorage,
  setStateInStorage,
} from '../test/helpers/election';
import {
  IDLE_TIMEOUT_SECONDS,
  IDLE_RESET_TIMEOUT_SECONDS,
} from './config/globals';
import { fakeMachineConfigProvider } from '../test/helpers/fake_machine_config';
import { MarkAndPrint } from './config/types';

beforeEach(() => {
  jest.useFakeTimers();
  window.location.href = '/';
});

const idleScreenCopy =
  'This voting station has been inactive for more than 5 minutes.';

describe('Mark Card Void when voter is idle too long', () => {
  test('Display expired card if card marked as voided', async () => {
    const card = new MemoryCard();
    const hardware = MemoryHardware.buildStandard();
    const storage = new MemoryStorage();
    const machineConfig = fakeMachineConfigProvider();

    await setElectionInStorage(storage);
    await setStateInStorage(storage);

    render(
      <App
        card={card}
        hardware={hardware}
        storage={storage}
        machineConfig={machineConfig}
        reload={jest.fn()}
      />
    );
    // Initialize app
    await advanceTimersAndPromises();

    // Insert Voter card
    card.insertCard(makeVoterCard(electionSample));
    await advanceTimersAndPromises();
    screen.getByText(/Center Springfield/);
    screen.getByText('Start Voting');

    // Elapse idle timeout
    await advanceTimersAndPromises(IDLE_TIMEOUT_SECONDS);

    // Idle Screen is displayed
    screen.getByText(idleScreenCopy);

    // User action removes Idle Screen
    fireEvent.click(screen.getByText('Yes, I’m still voting.'));
    fireEvent.mouseDown(document);
    await advanceTimersAndPromises(0.2);
    expect(screen.queryByText(idleScreenCopy)).toBeFalsy();

    // Elapse idle timeout
    await advanceTimersAndPromises(IDLE_TIMEOUT_SECONDS);

    // Idle Screen is displayed
    screen.getByText(idleScreenCopy);

    // Countdown works
    const secondsRemaining = 20;
    advanceTimers(IDLE_RESET_TIMEOUT_SECONDS - secondsRemaining);
    screen.getByText(`${secondsRemaining} seconds`);

    advanceTimers(secondsRemaining);
    screen.getByText('Clearing ballot');

    // Idle reset timeout expires
    await advanceTimersAndPromises();
    await advanceTimersAndPromises();
    screen.getByText('Expired Card');

    // Remove card
    card.removeCard();
    await advanceTimersAndPromises();
    screen.getByText('Insert Card');
  });

  test('Reset ballot when idle voter times out when cardless voting', async () => {
    const card = new MemoryCard();
    const hardware = MemoryHardware.buildStandard();
    const storage = new MemoryStorage();
    const machineConfig = fakeMachineConfigProvider({
      appMode: MarkAndPrint,
    });

    await setElectionInStorage(storage, electionSampleDefinition);
    await setStateInStorage(storage);
    const pollWorkerCard = makePollWorkerCard(
      electionSampleDefinition.electionHash
    );

    render(
      <App
        card={card}
        hardware={hardware}
        storage={storage}
        machineConfig={machineConfig}
        reload={jest.fn()}
      />
    );
    // Initialize app
    await advanceTimersAndPromises();

    // Activate Voter Session for Cardless Voter
    card.insertCard(pollWorkerCard);
    await advanceTimersAndPromises();
    screen.getByText('Select Voter’s Ballot Style');
    fireEvent.click(
      within(screen.getByTestId('ballot-styles')).getByText('12')
    );
    screen.getByText('Voting Session Active: 12 at Center Springfield');

    card.removeCard();
    await advanceTimersAndPromises(0.2);
    screen.getByText(/Center Springfield/);
    screen.getByText('Start Voting');

    // Elapse idle timeout
    await advanceTimersAndPromises(IDLE_TIMEOUT_SECONDS);

    // Idle Screen is displayed
    screen.getByText(idleScreenCopy);

    // User action removes Idle Screen
    fireEvent.click(screen.getByText('Yes, I’m still voting.'));
    fireEvent.mouseDown(document);
    await advanceTimersAndPromises(0.2);
    expect(screen.queryByText(idleScreenCopy)).toBeFalsy();

    // Elapse idle timeout
    await advanceTimersAndPromises(IDLE_TIMEOUT_SECONDS);

    // Idle Screen is displayed
    screen.getByText(idleScreenCopy);

    // Countdown works
    const secondsRemaining = 20;
    advanceTimers(IDLE_RESET_TIMEOUT_SECONDS - secondsRemaining);
    screen.getByText(`${secondsRemaining} seconds`);

    // Idle reset timeout expires
    advanceTimers(secondsRemaining);

    // Insert voter card screen is displayed.
    screen.getByText('Insert Card');

    // Card read again has no impact.
    await advanceTimersAndPromises();
    screen.getByText('Insert Card');
  });

  test('Reset ballot when card write does not match card read.', async () => {
    const card = new MemoryCard();
    const hardware = MemoryHardware.buildStandard();
    const storage = new MemoryStorage();
    const machineConfig = fakeMachineConfigProvider();

    await setElectionInStorage(storage);
    await setStateInStorage(storage);

    render(
      <App
        card={card}
        hardware={hardware}
        storage={storage}
        machineConfig={machineConfig}
        reload={jest.fn()}
      />
    );
    // Initialize app
    await advanceTimersAndPromises();

    // Insert Voter card
    card.insertCard(makeVoterCard(electionSample));
    await advanceTimersAndPromises();
    screen.getByText(/Center Springfield/);

    // Elapse idle timeout
    await advanceTimersAndPromises(IDLE_TIMEOUT_SECONDS);

    // Idle Screen is displayed
    screen.getByText(idleScreenCopy);

    // Countdown works
    advanceTimers(IDLE_RESET_TIMEOUT_SECONDS);
    screen.getByText('Clearing ballot');

    // Insert Card with corrupted data.
    card.insertCard('{"all": "your base are belong to us"}');

    // 30 seconds passes, Expect voided card
    await advanceTimersAndPromises();
    screen.getByText('Insert Card');
  });
});

import { electionSampleDefinition } from '@votingworks/fixtures';
import { ALL_PRECINCTS_SELECTION } from '@votingworks/utils';
import {
  CastVoteRecord,
  ok,
  PollsState,
  PrecinctSelection,
} from '@votingworks/types';
import { createMockClient } from '@votingworks/grout-test-utils';
// eslint-disable-next-line vx/gts-no-import-export-type
import type {
  Api,
  PrecinctScannerConfig,
  PrecinctScannerStatus,
} from '@votingworks/vx-scan-backend';

const defaultConfig: PrecinctScannerConfig = {
  isSoundMuted: false,
  isTestMode: true,
  pollsState: 'polls_closed_initial',
  ballotCountWhenBallotBagLastReplaced: 0,
  electionDefinition: electionSampleDefinition,
  precinctSelection: ALL_PRECINCTS_SELECTION,
};

export const statusNoPaper: PrecinctScannerStatus = {
  state: 'no_paper',
  canUnconfigure: false,
  ballotsCounted: 0,
};

/**
 * Creates a VxScan specific wrapper around commonly used methods from the Grout
 * mock API client to make it easier to use for our specific test needs
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createApiMock() {
  const mockApiClient = createMockClient<Api>();
  return {
    mockApiClient,

    expectGetConfig(config: Partial<PrecinctScannerConfig> = {}): void {
      mockApiClient.getConfig.expectCallWith().resolves({
        ...defaultConfig,
        ...config,
      });
    },

    expectSetPrecinct(precinctSelection: PrecinctSelection): void {
      mockApiClient.setPrecinctSelection
        .expectCallWith({ precinctSelection })
        .resolves();
    },

    expectSetTestMode(isTestMode: boolean): void {
      mockApiClient.setTestMode.expectCallWith({ isTestMode }).resolves();
    },

    expectGetScannerStatus(status: PrecinctScannerStatus, times = 1): void {
      for (let i = 0; i < times; i += 1) {
        mockApiClient.getScannerStatus.expectCallWith().resolves(status);
      }
    },

    expectSetPollsState(pollsState: PollsState): void {
      mockApiClient.setPollsState.expectCallWith({ pollsState }).resolves();
    },

    expectGetCastVoteRecordsForTally(castVoteRecords: CastVoteRecord[]): void {
      mockApiClient.getCastVoteRecordsForTally
        .expectCallWith()
        .resolves(castVoteRecords);
    },

    expectExportCastVoteRecordsToUsbDrive(machineId: string): void {
      mockApiClient.exportCastVoteRecordsToUsbDrive
        .expectCallWith({ machineId })
        .resolves(ok());
    },
  };
}

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import {
  CardDataTypes,
  ElectionDefinition,
  MarkThresholds,
  Optional,
  safeParseJson,
} from '@votingworks/types';
import styled from 'styled-components';

import {
  ScannerStatus,
  GetScanStatusResponse,
  GetScanStatusResponseSchema,
  ScanBatchResponseSchema,
  ScanContinueRequest,
  ScanContinueResponseSchema,
  ZeroResponseSchema,
} from '@votingworks/types/api/module-scan';
import {
  usbstick,
  KioskStorage,
  LocalStorage,
  Card,
  Hardware,
} from '@votingworks/utils';
import {
  useUsbDrive,
  UsbControllerButton,
  useSmartcard,
  SetupCardReaderPage,
  useUserSession,
  useHardware,
} from '@votingworks/ui';
import { Logger, LogSource } from '@votingworks/logging';
import { MachineConfig } from './config/types';
import { AppContext } from './contexts/app_context';

import { Button } from './components/button';
import { Main, MainChild } from './components/main';
import { Screen } from './components/screen';
import { Prose } from './components/prose';
import { Text } from './components/text';
import { ScanButton } from './components/scan_button';
import { useInterval } from './hooks/use_interval';

import { LoadElectionScreen } from './screens/load_election_screen';
import { DashboardScreen } from './screens/dashboard_screen';
import { BallotEjectScreen } from './screens/ballot_eject_screen';
import { AdvancedOptionsScreen } from './screens/advanced_options_screen';

import 'normalize.css';
import './App.css';
import { download } from './util/download';
import * as config from './api/config';
import { LinkButton } from './components/link_button';
import { MainNav } from './components/main_nav';
import { StatusFooter } from './components/status_footer';

import { ExportResultsModal } from './components/export_results_modal';
import { machineConfigProvider } from './util/machine_config';
import { MachineLockedScreen } from './screens/machine_locked_screen';
import { InvalidCardScreen } from './screens/invalid_card_screen';
import { UnlockMachineScreen } from './screens/unlock_machine_screen';

const Buttons = styled.div`
  padding: 10px 0;
  & * {
    margin-right: 10px;
  }
`;
const VALID_USERS: CardDataTypes[] = ['admin'];

export interface AppRootProps {
  card: Card;
  hardware: Hardware;
}

export function AppRoot({ card, hardware }: AppRootProps): JSX.Element {
  const logger = useMemo(
    () => new Logger(LogSource.VxBatchScanApp, window.kiosk),
    []
  );
  const history = useHistory();
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [
    electionDefinition,
    setElectionDefinition,
  ] = useState<ElectionDefinition>();
  const [electionJustLoaded, setElectionJustLoaded] = useState(false);
  const [isTestMode, setTestMode] = useState(false);
  const [isTogglingTestMode, setTogglingTestMode] = useState(false);
  const [status, setStatus] = useState<GetScanStatusResponse>({
    batches: [],
    adjudication: { remaining: 0, adjudicated: 0 },
    scanner: ScannerStatus.Unknown,
  });

  const [machineConfig, setMachineConfig] = useState<MachineConfig>({
    machineId: '0000',
    bypassAuthentication: false,
  });

  const usbDrive = useUsbDrive({ logger });

  const { hasCardReaderAttached, hasBatchScannerAttached } = useHardware({
    hardware,
    logger,
  });
  const smartcard = useSmartcard({ card, hasCardReaderAttached });
  const {
    currentUserSession,
    attemptToAuthenticateAdminUser,
    lockMachine,
  } = useUserSession({
    smartcard,
    electionDefinition,
    persistAuthentication: true,
    bypassAuthentication: machineConfig.bypassAuthentication,
    logger,
    validUserTypes: VALID_USERS,
  });
  const [isExportingCvrs, setIsExportingCvrs] = useState(false);

  const [markThresholds, setMarkThresholds] = useState<
    Optional<MarkThresholds>
  >();

  const { adjudication } = status;

  const [isScanning, setIsScanning] = useState(false);

  const refreshConfig = useCallback(async () => {
    setElectionDefinition(await config.getElectionDefinition());
    setTestMode(await config.getTestMode());
    setMarkThresholds(await config.getMarkThresholdOverrides());
  }, []);

  async function updateElectionDefinition(e?: ElectionDefinition) {
    setElectionDefinition(e);
    setElectionJustLoaded(true);
  }

  useEffect(() => {
    async function initialize() {
      try {
        await refreshConfig();
        setIsConfigLoaded(true);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('failed to initialize:', e);
        window.setTimeout(initialize, 1000);
      }
    }

    void initialize();
  }, [refreshConfig]);

  useEffect(() => {
    async function initialize() {
      try {
        const newMachineConfig = await machineConfigProvider.get();
        setMachineConfig(newMachineConfig);
      } catch (e) {
        // TODO: what should happen in machineConfig not returned?
      }
    }

    void initialize();
  }, [setMachineConfig]);

  const updateStatus = useCallback(async () => {
    try {
      const body = await (await fetch('/scan/status')).text();
      const newStatus = safeParseJson(
        body,
        GetScanStatusResponseSchema
      ).unsafeUnwrap();
      setStatus((prevStatus) => {
        if (JSON.stringify(prevStatus) === JSON.stringify(newStatus)) {
          return prevStatus;
        }
        setIsScanning(
          newStatus.adjudication.remaining === 0 &&
            newStatus.batches.some(({ endedAt }) => !endedAt)
        );
        return newStatus;
      });
    } catch (error) {
      setIsScanning(false);
      console.log('failed updateStatus()', error); // eslint-disable-line no-console
    }
  }, [setStatus]);

  const unconfigureServer = useCallback(async () => {
    try {
      await config.setElection(undefined);
      await refreshConfig();
      history.replace('/');
    } catch (error) {
      console.log('failed unconfigureServer()', error); // eslint-disable-line no-console
    }
  }, [history, refreshConfig]);

  const scanBatch = useCallback(async () => {
    setIsScanning(true);
    try {
      const result = safeParseJson(
        await (
          await fetch('/scan/scanBatch', {
            method: 'post',
          })
        ).text(),
        ScanBatchResponseSchema
      ).unsafeUnwrap();
      if (result.status !== 'ok') {
        // eslint-disable-next-line no-alert
        window.alert(`could not scan: ${JSON.stringify(result.errors)}`);
        setIsScanning(false);
      }
    } catch (error) {
      console.log('failed handleFileInput()', error); // eslint-disable-line no-console
    }
  }, []);

  const continueScanning = useCallback(async (request: ScanContinueRequest) => {
    setIsScanning(true);
    try {
      safeParseJson(
        await (
          await fetch('/scan/scanContinue', {
            method: 'post',
            body: JSON.stringify(request),
            headers: {
              'Content-Type': 'application/json',
            },
          })
        ).text(),
        ScanContinueResponseSchema
      ).unsafeUnwrap();
    } catch (error) {
      console.log('failed handleFileInput()', error); // eslint-disable-line no-console
    }
  }, []);

  const zeroData = useCallback(async () => {
    try {
      safeParseJson(
        await (
          await fetch('/scan/zero', {
            method: 'post',
          })
        ).text(),
        ZeroResponseSchema
      ).unsafeUnwrap();
      await refreshConfig();
      history.replace('/');
    } catch (error) {
      console.log('failed zeroData()', error); // eslint-disable-line no-console
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const backup = useCallback(async () => {
    await download('/scan/backup');
  }, []);

  const toggleTestMode = useCallback(async () => {
    try {
      setTogglingTestMode(true);
      await config.setTestMode(!isTestMode);
      await refreshConfig();
      history.replace('/');
    } finally {
      setTogglingTestMode(false);
    }
  }, [history, isTestMode, refreshConfig]);

  const setMarkThresholdOverrides = useCallback(
    async (markThresholdOverrides?: MarkThresholds) => {
      await config.setMarkThresholdOverrides(markThresholdOverrides);
      await refreshConfig();
      history.replace('/');
    },
    [history, refreshConfig]
  );

  const deleteBatch = useCallback(async (id: string) => {
    await fetch(`/scan/batch/${id}`, {
      method: 'DELETE',
    });
  }, []);

  useInterval(
    useCallback(async () => {
      if (electionDefinition) {
        await updateStatus();
      }
    }, [electionDefinition, updateStatus]),
    1000
  );

  const displayUsbStatus = usbDrive.status ?? usbstick.UsbDriveStatus.absent;

  useEffect(() => {
    void updateStatus();
  }, [updateStatus]);

  useEffect(() => {
    if (
      electionJustLoaded &&
      displayUsbStatus === usbstick.UsbDriveStatus.recentlyEjected
    ) {
      setElectionJustLoaded(false);
    }
  }, [electionJustLoaded, displayUsbStatus]);

  const storage = window.kiosk
    ? new KioskStorage(window.kiosk)
    : new LocalStorage();

  if (!hasCardReaderAttached) {
    return <SetupCardReaderPage />;
  }

  if (!currentUserSession) {
    return (
      <AppContext.Provider
        value={{
          usbDriveStatus: displayUsbStatus,
          usbDriveEject: usbDrive.eject,
          electionDefinition,
          machineConfig,
          storage,
          lockMachine,
          currentUserSession,
        }}
      >
        <MachineLockedScreen />
      </AppContext.Provider>
    );
  }

  if (currentUserSession.type !== 'admin') {
    return (
      <AppContext.Provider
        value={{
          usbDriveStatus: displayUsbStatus,
          usbDriveEject: usbDrive.eject,
          electionDefinition,
          machineConfig,
          storage,
          lockMachine,
          currentUserSession,
        }}
      >
        <InvalidCardScreen />
      </AppContext.Provider>
    );
  }

  if (!currentUserSession.authenticated) {
    return (
      <AppContext.Provider
        value={{
          usbDriveStatus: displayUsbStatus,
          usbDriveEject: usbDrive.eject,
          electionDefinition,
          machineConfig,
          storage,
          lockMachine,
          currentUserSession,
        }}
      >
        <UnlockMachineScreen
          attemptToAuthenticateAdminUser={attemptToAuthenticateAdminUser}
        />
      </AppContext.Provider>
    );
  }

  if (electionDefinition) {
    if (electionJustLoaded) {
      return (
        <AppContext.Provider
          value={{
            usbDriveStatus: displayUsbStatus,
            usbDriveEject: usbDrive.eject,
            machineConfig,
            electionDefinition,
            storage,
            lockMachine,
            currentUserSession,
          }}
        >
          <Screen>
            <Main>
              <MainChild center padded>
                <Prose>
                  <h1>Ballot Scanner Configured</h1>
                  <Text>
                    Ballot Scanner successfully configured. You may now eject
                    the USB drive.
                  </Text>
                </Prose>
                <Buttons>
                  <Button onPress={() => setElectionJustLoaded(false)}>
                    Close
                  </Button>
                  <UsbControllerButton
                    small={false}
                    primary
                    usbDriveStatus={displayUsbStatus}
                    usbDriveEject={() =>
                      usbDrive.eject(currentUserSession.type)
                    }
                  />
                </Buttons>
              </MainChild>
            </Main>
            <MainNav isTestMode={false}>
              <Button small onPress={lockMachine}>
                Lock Machine
              </Button>
            </MainNav>
          </Screen>
        </AppContext.Provider>
      );
    }
    if (adjudication.remaining > 0 && !isScanning) {
      return (
        <AppContext.Provider
          value={{
            usbDriveStatus: displayUsbStatus,
            usbDriveEject: usbDrive.eject,
            electionDefinition,
            machineConfig,
            storage,
            lockMachine,
            currentUserSession,
          }}
        >
          <BallotEjectScreen
            continueScanning={continueScanning}
            isTestMode={isTestMode}
          />
        </AppContext.Provider>
      );
    }

    let exportButtonTitle;
    if (adjudication.remaining > 0) {
      exportButtonTitle =
        'You cannot export results until all ballots have been adjudicated.';
    } else if (status.batches.length === 0) {
      exportButtonTitle =
        'You cannot export results until you have scanned at least 1 ballot.';
    }

    return (
      <AppContext.Provider
        value={{
          usbDriveStatus: displayUsbStatus,
          usbDriveEject: usbDrive.eject,
          electionDefinition,
          machineConfig,
          storage,
          lockMachine,
          currentUserSession,
        }}
      >
        <Switch>
          <Route path="/advanced">
            <AdvancedOptionsScreen
              unconfigureServer={unconfigureServer}
              zeroData={zeroData}
              backup={backup}
              hasBatches={status.batches.length > 0}
              isTestMode={isTestMode}
              toggleTestMode={toggleTestMode}
              setMarkThresholdOverrides={setMarkThresholdOverrides}
              markThresholds={markThresholds}
              isTogglingTestMode={isTogglingTestMode}
              electionDefinition={electionDefinition}
            />
          </Route>
          <Route path="/">
            <Screen>
              <Main>
                <MainChild maxWidth={false}>
                  <DashboardScreen
                    isScanning={isScanning}
                    status={status}
                    deleteBatch={deleteBatch}
                  />
                </MainChild>
              </Main>
              <MainNav isTestMode={isTestMode}>
                <UsbControllerButton
                  usbDriveStatus={displayUsbStatus}
                  usbDriveEject={() => usbDrive.eject(currentUserSession.type)}
                />
                <Button small onPress={lockMachine}>
                  Lock Machine
                </Button>
                <LinkButton small to="/advanced">
                  Advanced
                </LinkButton>
                <Button
                  small
                  onPress={() => setIsExportingCvrs(true)}
                  disabled={
                    adjudication.remaining > 0 || status.batches.length === 0
                  }
                  title={exportButtonTitle}
                >
                  Export
                </Button>
                <ScanButton
                  onPress={scanBatch}
                  disabled={isScanning}
                  isScannerAttached={hasBatchScannerAttached}
                />
              </MainNav>
              <StatusFooter />
            </Screen>
            {isExportingCvrs && (
              <ExportResultsModal
                onClose={() => setIsExportingCvrs(false)}
                electionDefinition={electionDefinition}
                isTestMode={isTestMode}
                numberOfBallots={status.batches.reduce(
                  (prev, next) => prev + next.count,
                  0
                )}
              />
            )}
          </Route>
        </Switch>
      </AppContext.Provider>
    );
  }

  if (isConfigLoaded) {
    return (
      <AppContext.Provider
        value={{
          usbDriveStatus: displayUsbStatus,
          usbDriveEject: usbDrive.eject,
          machineConfig,
          electionDefinition,
          storage,
          lockMachine,
          currentUserSession,
        }}
      >
        <LoadElectionScreen setElectionDefinition={updateElectionDefinition} />
      </AppContext.Provider>
    );
  }

  return (
    <Screen>
      <Main>
        <MainChild maxWidth={false}>
          <h1>Loading Configuration...</h1>
        </MainChild>
      </Main>
    </Screen>
  );
}
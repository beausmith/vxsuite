import { Election, Precinct } from '@votingworks/types'
import {
  find,
  formatFullDateTimeZone,
  formatLongDate,
  CardTallyMetadataEntry,
} from '@votingworks/utils'
import { DateTime } from 'luxon'
import React from 'react'
import styled from 'styled-components'
import { PrintableContainer } from './TallyReport'

import { Prose } from './Prose'
import { Table } from './Table'

const SealImage = styled.img`
  max-width: 1in;
`

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 0.2rem solid #000000;
  & > .seal {
    margin: 0.25rem 0;
    width: 1in;
  }
  & h2 {
    margin-bottom: 0;
  }
  & h3 {
    margin-top: 0;
  }
  & > .ballot-header-content {
    flex: 4;
    margin: 0 1rem;
    max-width: 100%;
  }
`
const Content = styled.div`
  padding-top: 2rem;
  & dd {
    margin: 0 0 2rem;
    & > span {
      font-size: 2rem;
      font-weight: 600;
    }
  }
`

const Certification = styled.div`
  margin-top: 0.5rem;
  width: 50%;
  font-weight: 600;
`
const SignatureLine = styled.div`
  display: flex;
  align-items: flex-end;
  border-bottom: 1px solid #000000;
  width: 50%;
  min-height: 4em;
  &::before {
    font-size: 1.5rem;
    content: '⨉';
  }
`

export enum PrecinctSelectionKind {
  SinglePrecinct = 'SinglePrecinct',
  AllPrecincts = 'AllPrecincts',
}

export type PrecinctSelection =
  | { kind: PrecinctSelectionKind.AllPrecincts }
  | { kind: PrecinctSelectionKind.SinglePrecinct; precinctId: Precinct['id'] }

interface Props {
  ballotCount: number
  currentDateTime: string
  election: Election
  isLiveMode: boolean
  isPollsOpen: boolean
  machineId: string
  machineMetadata?: readonly CardTallyMetadataEntry[]
  precinctSelection: PrecinctSelection
  reportPurpose: string
}

export const PrecinctScannerPollsReport = ({
  ballotCount,
  currentDateTime,
  election,
  isLiveMode,
  isPollsOpen,
  machineId,
  machineMetadata,
  precinctSelection,
  reportPurpose,
}: Props): JSX.Element => {
  const { title, date, county, precincts, state, seal, sealURL } = election
  const precinctName =
    precinctSelection.kind === PrecinctSelectionKind.AllPrecincts
      ? 'All Precincts'
      : find(precincts, (p) => p.id === precinctSelection.precinctId).name
  let machineSection = (
    <React.Fragment>
      <dt>Machine ID</dt>
      <dd>
        <span>Precinct Scanner #{machineId}</span>
      </dd>
    </React.Fragment>
  )
  if (machineMetadata !== undefined) {
    machineSection = (
      <React.Fragment>
        <dt>Machines</dt>
        <Table>
          <tbody>
            <tr>
              <th>Machine ID</th>
              <th>Number of Ballots Scanned</th>
              <th>Time Tally Saved</th>
            </tr>
            {machineMetadata.map((metadata) => (
              <tr key={metadata.machineId}>
                <td>Precinct Scanner #{metadata.machineId}</td>
                <td>{metadata.ballotCount}</td>
                <td>
                  {formatFullDateTimeZone(
                    DateTime.fromMillis(metadata.timeSaved)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </React.Fragment>
    )
  }

  return (
    <PrintableContainer>
      <Header>
        {
          /* istanbul ignore next */
          seal && !sealURL ? (
            <div
              className="seal"
              // TODO: Sanitize the SVG content: https://github.com/votingworks/bmd/issues/99
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: seal }}
            />
          ) : (
            <React.Fragment />
          )
        }
        {
          /* istanbul ignore next */
          sealURL && !seal ? (
            <div className="seal">
              <SealImage src={sealURL} alt="" />
            </div>
          ) : (
            <React.Fragment />
          )
        }
        <Prose className="ballot-header-content">
          <h2>
            {precinctName}{' '}
            {
              /* istanbul ignore next */
              !isLiveMode ? 'Unofficial TEST' : 'Official'
            }{' '}
            {isPollsOpen ? 'Polls Opened Report' : 'Polls Closed Report'}
          </h2>
          <h3>{title}</h3>
          <p>
            {formatLongDate(DateTime.fromISO(date))}
            <br />
            {county.name}, {state}
          </p>
        </Prose>
      </Header>
      <Content>
        <Prose maxWidth={false}>
          <p>
            This report should be <strong>{reportPurpose}</strong>.
          </p>
          <dl>
            {machineSection}
            <dt>Status</dt>
            <dd>
              <span>{isPollsOpen ? 'Opened' : 'Closed'}</span>
            </dd>
            <dt>Report Time</dt>
            <dd>
              <span>{currentDateTime}</span>
            </dd>
            <dt>Ballots Scanned Count</dt>
            <dd>
              <span>{ballotCount}</span>
            </dd>
            <dt>Certification Signatures</dt>
            <dd>
              <Certification>
                <Prose>
                  <p>
                    <em>
                      We, the undersigned, do hereby certify the election was
                      conducted in accordance with the laws of the state.
                    </em>
                  </p>
                </Prose>
              </Certification>
              <SignatureLine />
              <SignatureLine />
              <SignatureLine />
            </dd>
          </dl>
        </Prose>
      </Content>
    </PrintableContainer>
  )
}

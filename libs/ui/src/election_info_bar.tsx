import React from 'react';

import { ElectionDefinition, PrecinctSelection } from '@votingworks/types';
import { formatShortDate, getPrecinctSelectionName } from '@votingworks/utils';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { Prose } from './prose';
import { Text, NoWrap } from './text';
import { Seal } from './seal';
import { defaultTheme, Theme } from './themes/default';

interface BarProps {
  theme: Theme;
  isVoterMode: boolean;
}

const Bar = styled.div<BarProps>`
  display: flex;
  flex-direction: row;
  align-items: end;
  flex-wrap: ${({ isVoterMode }) => (isVoterMode ? undefined : 'wrap')};
  background: ${({ theme }) => theme.contrast.foreground};
  padding: 10px 15px;
  color: ${({ theme }) => theme.contrast.background};
  gap: 20px;
`;

const BarHeader = styled.div<{
  isVoterMode: boolean;
}>`
  display: flex;
  flex: 1;
  flex-basis: ${({ isVoterMode }) => (isVoterMode ? undefined : '100%')};
  gap: 10px;
`;

const BarData = styled.div<{
  isVoterMode: boolean;
}>`
  flex-grow: ${({ isVoterMode }) => (isVoterMode ? undefined : 1)};
`;

const BarSeal = styled.div`
  width: 65px;
`;

export type InfoBarMode = 'voter' | 'pollworker' | 'admin';

interface Props {
  mode?: InfoBarMode;
  electionDefinition: ElectionDefinition;
  codeVersion?: string;
  machineId?: string;
  precinctSelection?: PrecinctSelection;
}
export function ElectionInfoBar({
  mode = 'voter',
  electionDefinition,
  codeVersion,
  machineId,
  precinctSelection,
}: Props): JSX.Element {
  const {
    election: { precincts, date, title, county, state, seal, sealUrl },
  } = electionDefinition;
  const electionDate = formatShortDate(DateTime.fromISO(date));
  const isVoterMode = mode === 'voter';

  return (
    <Bar data-testid="electionInfoBar" isVoterMode={isVoterMode}>
      <BarHeader isVoterMode={isVoterMode}>
        <BarSeal>
          {(seal || sealUrl) && <Seal seal={seal} sealUrl={sealUrl} />}
        </BarSeal>
        <Prose maxWidth={false} compact>
          <strong>{title}</strong> — <NoWrap>{electionDate}</NoWrap>
          <Text as="div" small>
            {precinctSelection && (
              <React.Fragment>
                <NoWrap>
                  {getPrecinctSelectionName(precincts, precinctSelection)},
                </NoWrap>{' '}
              </React.Fragment>
            )}
            <NoWrap>{county.name},</NoWrap> <NoWrap>{state}</NoWrap>
          </Text>
        </Prose>
      </BarHeader>
      {!isVoterMode && codeVersion && (
        <BarData isVoterMode={isVoterMode}>
          <Prose maxWidth={false} compact>
            <Text as="div" small noWrap>
              Software Version
            </Text>
            <strong>{codeVersion}</strong>
          </Prose>
        </BarData>
      )}
      {!isVoterMode && machineId && (
        <BarData isVoterMode={isVoterMode}>
          <Prose maxWidth={false} compact>
            <Text as="div" small noWrap>
              Machine ID
            </Text>
            <strong>{machineId}</strong>
          </Prose>
        </BarData>
      )}
      <BarData isVoterMode={isVoterMode}>
        <Prose maxWidth={false} compact textRight={isVoterMode}>
          <Text as="div" small>
            Election ID
          </Text>
          <strong>{electionDefinition.electionHash.slice(0, 10)}</strong>
        </Prose>
      </BarData>
    </Bar>
  );
}

Bar.defaultProps = {
  theme: defaultTheme,
};

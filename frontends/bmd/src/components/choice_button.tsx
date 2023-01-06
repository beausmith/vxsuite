import React from 'react';
import styled from 'styled-components';

import { Button, ButtonProps } from '@votingworks/ui';

import * as GLOBALS from '../config/globals';

interface Props
  extends ButtonProps,
    React.PropsWithoutRef<JSX.IntrinsicElements['button']> {
  choice: string;
  isSelected: boolean;
}

const StyledChoiceButton = styled('button').attrs(({ type = 'button' }) => ({
  role: 'option',
  type,
}))<Props>`
  display: flex;
  align-items: center;
  border: 4px solid ${({ theme }) => theme.contrast.foreground};
  border-radius: 100vw;
  background: ${({ isSelected, theme }) =>
    isSelected ? theme.contrast.foreground : theme.contrast.background};
  cursor: pointer;
  padding: 30px 20px;
  text-align: left;
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.contrast.background : theme.contrast.foreground};
  transition: background 0.25s, color 0.25s;
  &::before {
    width: 60px;
    height: 60px;
    margin: 0 30px 0 20px;
    border: 6px solid
      ${({ isSelected, theme }) =>
        isSelected ? theme.contrast.background : theme.contrast.foreground};
    border-radius: 4px;
    background: ${({ isSelected, theme }) =>
      isSelected ? theme.contrast.foreground : theme.contrast.background};
    text-align: center;
    color: ${({ theme }) => theme.contrast.background};
    font-size: 40px;
    font-weight: 700;
    content: '${({ isSelected }) => (isSelected ? GLOBALS.CHECK_ICON : '')}';
    transition: background 0.25s, color 0.25s, border-color 0.25s;
  }
  &:focus {
    outline: ${({ theme, noFocus = false }) =>
      noFocus ? 'none' : `12px dashed ${theme.contrast.foreground}`};
    outline-offset: 4px;
    z-index: 100;
  }
`;

export function ChoiceButton({ choice, ...rest }: Props): JSX.Element {
  return (
    <Button
      {...rest}
      component={StyledChoiceButton}
      data-choice={choice}
      data-selected={rest.isSelected}
    />
  );
}

import React, { useState } from 'react';
import styled, { css, StyledComponent } from 'styled-components';
import { EventTargetFunction } from '@votingworks/types';
import { cssFontSizeMinPixels, screenPixelsPerInch } from './themes/size';
import { defaultTheme } from './themes/default';

export interface ButtonInterface {
  readonly danger?: boolean;
  readonly fullWidth?: boolean;
  readonly large?: boolean;
  readonly noFocus?: boolean;
  readonly noWrap?: boolean;
  readonly invertedContrast?: boolean;
  readonly primary?: boolean;
  readonly primaryGreen?: boolean;
  readonly primaryBlue?: boolean;
  readonly small?: boolean;
  readonly textAlign?: 'left' | 'center' | 'right';
  readonly warning?: boolean;
}

export interface StyledButtonProps
  extends ButtonInterface,
    React.PropsWithoutRef<JSX.IntrinsicElements['button']> {}

const buttonStyles = css<StyledButtonProps>`
  appearance: none;
  display: inline-block;
  border: 4px solid
    ${({ theme, invertedContrast }) =>
      invertedContrast ? theme.contrast.background : theme.contrast.foreground};
  border-radius: ${screenPixelsPerInch()}px;
  box-shadow: 0 0 0 0 rgba(71, 167, 75, 1);
  box-sizing: border-box;
  background: ${({
    disabled,
    danger,
    warning,
    invertedContrast,
    primary,
    primaryBlue,
    primaryGreen,
    theme,
  }) =>
    (disabled && 'rgb(211, 211, 211)') ||
    (danger && 'red') ||
    (warning && 'darkorange') ||
    (primary && invertedContrast && theme.contrast.background) ||
    (primary && theme.contrast.foreground) ||
    (primaryGreen && 'rgb(71, 167, 75)') ||
    (primaryBlue && 'rgb(34, 152, 222)') ||
    (invertedContrast && theme.contrast.foreground) ||
    theme.contrast.background};
  cursor: ${({ disabled = false }) => (disabled ? undefined : 'pointer')};
  width: ${({ fullWidth = false }) => (fullWidth ? '100%' : undefined)};
  min-height: ${({ large = false, small = false }) =>
    small
      ? Math.round(screenPixelsPerInch() * 0.5) // VVSG Requirement 7.2-I - Touch area size
      : large
      ? Math.round(screenPixelsPerInch() * 0.9)
      : Math.round(screenPixelsPerInch() * 0.7)}px;
  min-width: ${({ large = false, small = false }) =>
    small
      ? Math.round(screenPixelsPerInch() * 0.5) // VVSG Requirement 7.2-I - Touch area size
      : large
      ? Math.round(screenPixelsPerInch() * 0.9)
      : Math.round(screenPixelsPerInch() * 0.7)}px;
  padding: ${({ large = false, small = false }) =>
    `${small ? '2px 24px' : large ? '10px 36px' : '5px 30px'}`};
  text-align: ${({ textAlign }) => textAlign || 'center'};
  line-height: 1;
  color: ${({
    theme,
    disabled,
    danger,
    warning,
    invertedContrast,
    primary,
    primaryBlue,
    primaryGreen,
  }) =>
    (disabled && 'rgb(160, 160, 160)') ||
    (danger && '#FFFFFF') ||
    (warning && '#FFFFFF') ||
    (primary && invertedContrast && theme.contrast.foreground) ||
    (primary && theme.contrast.background) ||
    (primaryGreen && '#FFFFFF') ||
    (primaryBlue && '#FFFFFF') ||
    (invertedContrast && theme.contrast.background) ||
    theme.contrast.foreground};
  font-size: ${({ large = false, small = false }) =>
    small
      ? `clamp(${cssFontSizeMinPixels}, 0.9em, 0.9em);`
      : large
      ? `1.2em`
      : 'inherit'};

  touch-action: manipulation;
  &:hover,
  &:active {
    outline: none;
  }
  &:focus {
    outline: ${({ theme, noFocus = false }) =>
      noFocus ? 'none' : `12px dashed ${theme.contrast.foreground}`};
    outline-offset: 4px;
    z-index: 100;
  }
`;

export const DecoyButton = styled.button`
  ${buttonStyles}/* stylelint-disable-line value-keyword-case */
`;

const StyledButton = styled('button').attrs(({ type = 'button' }) => ({
  type,
}))`
  ${buttonStyles}/* stylelint-disable-line value-keyword-case */
`;

StyledButton.defaultProps = {
  theme: defaultTheme,
};

export interface ButtonProps extends StyledButtonProps {
  component?: StyledComponent<'button', never, StyledButtonProps, never>;
  onPress: EventTargetFunction;
  ref?: React.Ref<HTMLButtonElement>;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { component: Component = StyledButton, onPress, disabled, ...rest },
    ref
  ) => {
    const [startCoordinates, setStartCoordinates] = useState([0, 0]);

    function onTouchStart(event: React.TouchEvent) {
      const { clientX, clientY } = event.touches[0];
      setStartCoordinates([clientX, clientY]);
    }

    function onTouchEnd(event: React.TouchEvent) {
      const maxMove = 30;
      const { clientX, clientY } = event.changedTouches[0];
      if (
        !disabled &&
        Math.abs(startCoordinates[0] - clientX) < maxMove &&
        Math.abs(startCoordinates[1] - clientY) < maxMove
      ) {
        onPress(event);
        event.preventDefault();
      }
    }

    return (
      <Component
        {...rest}
        disabled={disabled}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={onPress}
        ref={ref}
      />
    );
  }
);

Button.displayName = 'Button';

interface SegmentedButtonProps {
  readonly inverted?: boolean;
}

export const SegmentedButton = styled.span<SegmentedButtonProps>`
  display: flex;
  white-space: nowrap;
  & > button:first-child {
    box-shadow: none;
  }
  & > button:not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  & > button:not(:first-child) {
    margin-left: -4px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  & > button:disabled {
    background: #028099;
    color: #ffffff;
  }
`;

export const LabelButton = styled.label`
  ${buttonStyles}/* stylelint-disable-line value-keyword-case */
`;

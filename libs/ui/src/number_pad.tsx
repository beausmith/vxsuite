import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Button } from './button';

const buttonSize = 150;
const gapSize = 5;

export const NumberPadContainer = styled.span`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: auto;
  width: ${buttonSize * 3 + gapSize * 2}px;
  gap: 5px;
  & > span {
    display: flex;
    width: ${buttonSize}px;
    height: ${buttonSize}px;
    > button {
      flex: 1;
      padding-left: 0;
      padding-right: 0;
    }
  }
`;

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
export interface NumberPadProps {
  onButtonPress: (buttonValue: number) => void;
  onBackspace: () => void;
  onClear: () => void;
  onEnter?: () => void;
}

export function NumberPad({
  onButtonPress,
  onBackspace,
  onClear,
  onEnter,
}: NumberPadProps): JSX.Element {
  const container = useRef<HTMLDivElement>(null);
  const onKeyPress: React.KeyboardEventHandler = useCallback(
    (event) => {
      if (DIGITS.includes(event.key)) {
        // eslint-disable-next-line vx/gts-safe-number-parse
        onButtonPress(Number(event.key));
      } else if (event.key === 'x') {
        onClear();
      } else if (onEnter !== undefined && event.key === 'Enter') {
        onEnter();
      }
    },
    [onButtonPress, onClear, onEnter]
  );
  const onKeyDown: React.KeyboardEventHandler = useCallback(
    (event) => {
      if (event.key === 'Backspace') {
        onBackspace();
      }
    },
    [onBackspace]
  );

  useEffect(() => {
    /* istanbul ignore next */
    container.current?.focus();
  }, []);

  return (
    <NumberPadContainer
      tabIndex={0}
      ref={container}
      onKeyPress={onKeyPress}
      onKeyDown={onKeyDown}
    >
      <span>
        <Button onPress={useCallback(() => onButtonPress(1), [onButtonPress])}>
          1
        </Button>
      </span>
      <span>
        <Button onPress={useCallback(() => onButtonPress(2), [onButtonPress])}>
          2
        </Button>
      </span>
      <span>
        <Button onPress={useCallback(() => onButtonPress(3), [onButtonPress])}>
          3
        </Button>
      </span>
      <span>
        <Button onPress={useCallback(() => onButtonPress(4), [onButtonPress])}>
          4
        </Button>
      </span>
      <span>
        <Button onPress={useCallback(() => onButtonPress(5), [onButtonPress])}>
          5
        </Button>
      </span>
      <span>
        <Button onPress={useCallback(() => onButtonPress(6), [onButtonPress])}>
          6
        </Button>
      </span>
      <span>
        <Button onPress={useCallback(() => onButtonPress(7), [onButtonPress])}>
          7
        </Button>
      </span>
      <span>
        <Button onPress={useCallback(() => onButtonPress(8), [onButtonPress])}>
          8
        </Button>
      </span>
      <span>
        <Button onPress={useCallback(() => onButtonPress(9), [onButtonPress])}>
          9
        </Button>
      </span>
      <span>
        <Button onPress={onClear}>
          <span role="img" aria-label="clear">
            ✖
          </span>
        </Button>
      </span>
      <span>
        <Button onPress={useCallback(() => onButtonPress(0), [onButtonPress])}>
          0
        </Button>
      </span>
      <span>
        <Button onPress={onBackspace}>
          <span role="img" aria-label="backspace">
            ⌫
          </span>
        </Button>
      </span>
    </NumberPadContainer>
  );
}

import { act, renderHook } from '@testing-library/react-hooks';
import {
  electionSample,
  electionSampleDefinition,
} from '@votingworks/fixtures';
import {
  advanceTimersAndPromises,
  makeAdminCard,
  makePollWorkerCard,
  makeVoterCard,
} from '@votingworks/test-utils';
import { MemoryCard } from '@votingworks/utils';
import { CARD_POLLING_INTERVAL, useSmartcard } from './use_smartcard';

beforeEach(() => {
  jest.useFakeTimers('legacy');
});

test('no card reader attached', async () => {
  const card = new MemoryCard();

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: false })
  );
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);
  const smartcard = result.current;
  expect({ smartcard }).toEqual({
    smartcard: undefined,
  });
});

test('with card reader but no card', async () => {
  const card = new MemoryCard();

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);
  const smartcard = result.current;
  expect({ smartcard }).toEqual({
    smartcard: undefined,
  });
});

test('with card reader and a voter card', async () => {
  const card = new MemoryCard();

  card.insertCard(makeVoterCard(electionSample));

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);
  const smartcard = result.current;
  expect({ smartcard }).toEqual({
    smartcard: expect.objectContaining({
      longValueExists: false,
      data: expect.objectContaining({
        t: 'voter',
      }),
    }),
  });
});

test('with card reader and a pollworker card', async () => {
  const card = new MemoryCard();

  card.insertCard(makePollWorkerCard(electionSampleDefinition.electionHash));

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);
  const smartcard = result.current;
  expect({ smartcard }).toEqual({
    smartcard: expect.objectContaining({
      longValueExists: false,
      data: expect.objectContaining({
        t: 'pollworker',
        h: electionSampleDefinition.electionHash,
      }),
    }),
  });
});

test('with card reader and an admin card', async () => {
  const card = new MemoryCard();

  card.insertCard(makeAdminCard(electionSampleDefinition.electionHash));

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);
  const smartcard = result.current;
  expect({ smartcard }).toEqual({
    smartcard: expect.objectContaining({
      longValueExists: false,
      data: expect.objectContaining({
        t: 'admin',
        h: electionSampleDefinition.electionHash,
      }),
    }),
  });
});

test('with card reader and a gibberish card', async () => {
  const card = new MemoryCard();

  card.insertCard('not JSON');

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);
  const smartcard = result.current;
  expect({ smartcard }).toEqual({
    smartcard: expect.objectContaining({
      data: undefined,
    }),
  });
});

test('writing short value succeeds', async () => {
  const card = new MemoryCard();

  card.insertCard();

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);

  const voterCard = makeVoterCard(electionSample);
  {
    const smartcard = result.current;
    await act(async () => {
      (
        await smartcard!.writeShortValue(JSON.stringify(voterCard))
      ).unsafeUnwrap();
    });
  }

  expect(await card.readStatus()).toEqual({
    present: true,
    shortValue: JSON.stringify(voterCard),
    longValueExists: false,
  });

  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);

  {
    const smartcard = result.current;
    expect({ smartcard }).toEqual({
      smartcard: expect.objectContaining({
        longValueExists: false,
        data: expect.objectContaining({
          t: 'voter',
        }),
      }),
    });
  }
});

test('writing short value fails', async () => {
  const card = new MemoryCard();

  card.insertCard();

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);

  jest.spyOn(card, 'writeShortValue').mockRejectedValue(new Error('oh no'));

  const smartcard = result.current;
  await act(async () => {
    expect(
      (
        await smartcard?.writeShortValue(
          JSON.stringify(makeVoterCard(electionSample))
        )
      )?.err()?.message
    ).toEqual('oh no');
  });
});

test('writing concurrently fails', async () => {
  const card = new MemoryCard();

  card.insertCard();

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);

  jest.spyOn(card, 'writeShortValue').mockResolvedValue();
  jest.spyOn(card, 'writeLongUint8Array').mockResolvedValue();

  const smartcard = result.current;
  await act(async () => {
    const [write1Result, write2Result] = await Promise.all([
      smartcard!.writeShortValue('123'),
      smartcard!.writeShortValue('456'),
    ]);

    write1Result.unsafeUnwrap();
    write2Result.unsafeUnwrapErr();

    expect(card.writeShortValue).toHaveBeenCalledWith('123');
  });

  await act(async () => {
    const [write1Result, write2Result] = await Promise.all([
      smartcard!.writeLongValue(Uint8Array.of(1, 2, 3)),
      smartcard!.writeLongValue(Uint8Array.of(4, 5, 6)),
    ]);

    write1Result.unsafeUnwrap();
    write2Result.unsafeUnwrapErr();

    expect(card.writeLongUint8Array).toHaveBeenCalledWith(
      Uint8Array.of(1, 2, 3)
    );
  });
});

test('reading long string value succeeds', async () => {
  const card = new MemoryCard();

  card.insertCard();
  await card.writeLongObject({ some: 'object' });

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );

  // read short
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);

  // read long
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);

  const smartcard = result.current;
  await act(async () => {
    expect((await smartcard?.readLongString())?.ok()).toEqual(
      JSON.stringify({ some: 'object' })
    );
  });
});

test('reading long string value fails', async () => {
  const card = new MemoryCard();

  card.insertCard();

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);

  jest.spyOn(card, 'readLongString').mockRejectedValue(new Error('oh no'));

  const smartcard = result.current;
  await act(async () => {
    expect((await smartcard?.readLongString())?.err()?.message).toEqual(
      'oh no'
    );
  });
});

test('reading long binary value succeeds', async () => {
  const card = new MemoryCard();

  card.insertCard();
  await card.writeLongUint8Array(Uint8Array.of(1, 2, 3));

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );

  // read short
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);

  // read long
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);

  const smartcard = result.current;
  await act(async () => {
    expect((await smartcard?.readLongUint8Array())?.ok()).toEqual(
      Uint8Array.of(1, 2, 3)
    );
  });
});

test('reading long binary value fails', async () => {
  const card = new MemoryCard();

  card.insertCard();

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);

  jest.spyOn(card, 'readLongUint8Array').mockRejectedValue(new Error('oh no'));

  const smartcard = result.current;
  await act(async () => {
    expect((await smartcard?.readLongUint8Array())?.err()?.message).toEqual(
      'oh no'
    );
  });
});

test('writing long object value succeeds', async () => {
  const card = new MemoryCard();

  card.insertCard();

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );

  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);

  const smartcard = result.current;
  await act(async () => {
    (await smartcard?.writeLongValue(Uint8Array.of(1, 2, 3)))?.unsafeUnwrap();
  });

  expect(await card.readLongUint8Array()).toEqual(Uint8Array.of(1, 2, 3));
});

test('writing long object value fails', async () => {
  const card = new MemoryCard();

  card.insertCard();

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);

  jest.spyOn(card, 'writeLongObject').mockRejectedValue(new Error('oh no'));

  const smartcard = result.current;
  await act(async () => {
    expect((await smartcard?.writeLongValue(''))?.err()?.message).toEqual(
      'oh no'
    );
  });
});

test('writing long binary value fails', async () => {
  const card = new MemoryCard();

  card.insertCard();

  const { result } = renderHook(() =>
    useSmartcard({ card, hasCardReaderAttached: true })
  );
  await advanceTimersAndPromises(CARD_POLLING_INTERVAL / 1000);

  jest.spyOn(card, 'writeLongUint8Array').mockRejectedValue(new Error('oh no'));

  const smartcard = result.current;
  await act(async () => {
    expect(
      (await smartcard?.writeLongValue(Uint8Array.of(1, 2, 3)))?.err()?.message
    ).toEqual('oh no');
  });
});
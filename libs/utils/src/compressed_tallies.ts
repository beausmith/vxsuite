import {
  AnyContest,
  CandidateContestCompressedTally,
  CandidateContestCompressedTallySchema,
  CompressedTally,
  CompressedTallyEntry,
  ContestOptionTally,
  ContestTally,
  Dictionary,
  Election,
  expandEitherNeitherContests,
  MsEitherNeitherContestCompressedTally,
  MsEitherNeitherContestCompressedTallySchema,
  PartyId,
  PrecinctId,
  Tally,
  unsafeParse,
  VotingMethod,
  writeInCandidate,
  YesNoContestCompressedTally,
  YesNoContestCompressedTallySchema,
} from '@votingworks/types';
import { BallotCountDetails, typedAs } from './types';
import { assert, throwIllegalValue } from './assert';
import { filterContestTalliesByPartyId } from './votes';

const ALL_PRECINCTS = '__ALL_PRECINCTS';

export function getTallyIdentifier(
  partyId?: PartyId,
  precinctId: PrecinctId = ALL_PRECINCTS
): string {
  return `${partyId},${precinctId}`;
}

/**
 * A compressed tally
 */
export function compressTally(
  election: Election,
  tally: Tally
): CompressedTally {
  // eslint-disable-next-line array-callback-return
  return election.contests.map((contest) => {
    switch (contest.type) {
      case 'yesno': {
        const contestTally = tally.contestTallies[contest.id];
        return typedAs<YesNoContestCompressedTally>([
          contestTally?.metadata.undervotes ?? 0, // undervotes
          contestTally?.metadata.overvotes ?? 0, // overvotes
          contestTally?.metadata.ballots ?? 0, // ballots cast
          contestTally?.tallies['yes']?.tally ?? 0, // yes
          contestTally?.tallies['no']?.tally ?? 0, // no
        ]);
      }

      case 'ms-either-neither': {
        const eitherNeitherContestTally =
          tally.contestTallies[contest.eitherNeitherContestId];
        const pickOneContestTally =
          tally.contestTallies[contest.pickOneContestId];
        return typedAs<MsEitherNeitherContestCompressedTally>([
          eitherNeitherContestTally?.tallies['yes']?.tally ?? 0, // eitherOption
          eitherNeitherContestTally?.tallies['no']?.tally ?? 0, // neitherOption
          eitherNeitherContestTally?.metadata.undervotes ?? 0, // eitherNeitherUndervotes
          eitherNeitherContestTally?.metadata.overvotes ?? 0, // eitherNeitherOvervotes
          pickOneContestTally?.tallies['yes']?.tally ?? 0, // firstOption
          pickOneContestTally?.tallies['no']?.tally ?? 0, // secondOption
          pickOneContestTally?.metadata.undervotes ?? 0, // pickOneUndervotes
          pickOneContestTally?.metadata.overvotes ?? 0, // pickOneOvervotes
          pickOneContestTally?.metadata.ballots ?? 0, // ballotsCast
        ]);
      }

      case 'candidate': {
        const contestTally = tally.contestTallies[contest.id];
        return typedAs<CandidateContestCompressedTally>([
          contestTally?.metadata.undervotes ?? 0, // undervotes
          contestTally?.metadata.overvotes ?? 0, // overvotes
          contestTally?.metadata.ballots ?? 0, // ballotsCast
          ...contest.candidates.map(
            (candidate) => contestTally?.tallies[candidate.id]?.tally ?? 0
          ),
          contestTally?.tallies[writeInCandidate.id]?.tally ?? 0, // writeIns
        ]);
      }

      /* istanbul ignore next - compile time check for completeness */
      default:
        throwIllegalValue(contest, 'type');
    }
  });
}

function getContestTalliesForCompressedContest(
  contest: AnyContest,
  compressedContest: CompressedTallyEntry
): ContestTally[] {
  switch (contest.type) {
    case 'yesno': {
      const [undervotes, overvotes, ballots, yes, no] = unsafeParse(
        YesNoContestCompressedTallySchema,
        compressedContest
      );
      return [
        {
          contest,
          tallies: {
            yes: { option: ['yes'], tally: yes },
            no: { option: ['no'], tally: no },
          },
          metadata: {
            undervotes,
            overvotes,
            ballots,
          },
        },
      ];
    }
    case 'candidate': {
      const [undervotes, overvotes, ballots, ...tallyByCandidate] = unsafeParse(
        CandidateContestCompressedTallySchema,
        compressedContest
      );
      const candidateTallies: Dictionary<ContestOptionTally> = {};
      for (const [candidateIdx, candidate] of contest.candidates.entries()) {
        const tally = tallyByCandidate[candidateIdx];
        assert(
          tally !== undefined,
          `tally for contest '${
            contest.id
          }' by candidate missing value at index ${candidateIdx}: ${JSON.stringify(
            tallyByCandidate
          )} (full tally: ${JSON.stringify(compressedContest)})`
        );
        candidateTallies[candidate.id] = {
          option: candidate,
          tally,
        };
      }
      if (contest.allowWriteIns) {
        // write ins will be the last thing in the array after the metadata (3 items) and all candidates
        const writeInTally = tallyByCandidate.pop();
        assert(writeInTally !== undefined);
        candidateTallies[writeInCandidate.id] = {
          option: writeInCandidate,
          tally: writeInTally,
        };
      }
      return [
        {
          contest,
          tallies: candidateTallies,
          metadata: {
            undervotes,
            overvotes,
            ballots,
          },
        },
      ];
    }
    case 'ms-either-neither': {
      const [
        eitherOption,
        neitherOption,
        eitherNeitherUndervotes,
        eitherNeitherOvervotes,
        firstOption,
        secondOption,
        pickOneUndervotes,
        pickOneOvervotes,
        ballots,
      ] = unsafeParse(
        MsEitherNeitherContestCompressedTallySchema,
        compressedContest
      );
      const newYesNoContests = expandEitherNeitherContests([contest]);
      return newYesNoContests.map((yesno) => {
        assert(yesno.type === 'yesno');
        return yesno.id === contest.eitherNeitherContestId
          ? {
              contest: yesno,
              tallies: {
                yes: {
                  option: ['yes'],
                  tally: eitherOption,
                },
                no: {
                  option: ['no'],
                  tally: neitherOption,
                },
              },
              metadata: {
                undervotes: eitherNeitherUndervotes,
                overvotes: eitherNeitherOvervotes,
                ballots,
              },
            }
          : {
              contest: yesno,
              tallies: {
                yes: {
                  option: ['yes'],
                  tally: firstOption,
                },
                no: {
                  option: ['no'],
                  tally: secondOption,
                },
              },
              metadata: {
                undervotes: pickOneUndervotes,
                overvotes: pickOneOvervotes,
                ballots,
              },
            };
      });
    }
    /* istanbul ignore next - compile time check for completeness */
    default:
      throwIllegalValue(contest, 'type');
  }
}

export function readCompressedTally(
  election: Election,
  serializedTally: CompressedTally,
  ballotCounts: BallotCountDetails,
  partyId?: PartyId
): Tally {
  let contestTallies: Dictionary<ContestTally> = {};
  for (const [contestIdx, contest] of election.contests.entries()) {
    const serializedContestTally = serializedTally[contestIdx];
    assert(serializedContestTally);
    const tallies = getContestTalliesForCompressedContest(
      contest,
      serializedContestTally
    );
    for (const tally of tallies) {
      contestTallies[tally.contest.id] = tally;
    }
  }

  if (partyId) {
    contestTallies = filterContestTalliesByPartyId(
      election,
      contestTallies,
      partyId
    );
  }
  return {
    numberOfBallotsCounted: ballotCounts.reduce(
      (prev, value) => prev + value,
      0
    ),
    castVoteRecords: new Set(),
    contestTallies,
    ballotCountsByVotingMethod: {
      [VotingMethod.Precinct]: ballotCounts[0],
      [VotingMethod.Absentee]: ballotCounts[1],
    },
  };
}

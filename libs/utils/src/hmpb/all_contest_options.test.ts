import {
  arbitraryCandidateContest,
  arbitraryCandidateId,
  arbitraryMsEitherNeitherContest,
  arbitraryYesNoContest,
} from '@votingworks/test-utils';
import { ContestOption } from '@votingworks/types';
import fc from 'fast-check';
import { assert } from '../assert';
import { typedAs } from '../types';
import { allContestOptions } from './all_contest_options';

test('candidate contest with no write-ins', () => {
  fc.assert(
    fc.property(
      arbitraryCandidateContest({ allowWriteIns: fc.constant(false) }),
      (contest) => {
        const options = Array.from(allContestOptions(contest));
        expect(options).toHaveLength(contest.candidates.length);
        for (const [i, option] of options.entries()) {
          assert(option.type === 'candidate');
          expect(option.id).toBe(contest.candidates[i]?.id);
          expect(option.contestId).toBe(contest.id);
          expect(option.name).toBe(contest.candidates[i]?.name);
          expect(option.isWriteIn).toBe(false);
          expect(option.optionIndex).toBe(i);
        }
      }
    )
  );
});

test('candidate contest with write-ins', () => {
  fc.assert(
    fc.property(
      arbitraryCandidateContest({ allowWriteIns: fc.constant(true) }),
      (contest) => {
        const options = Array.from(allContestOptions(contest));
        expect(options).toHaveLength(contest.candidates.length + contest.seats);
        for (const [i, option] of options.entries()) {
          assert(option.type === 'candidate');
          expect(option.id).toBe(
            contest.candidates[i]?.id ??
              `write-in-${i - contest.candidates.length}`
          );
          expect(option.contestId).toBe(contest.id);
          expect(option.name).toBe(contest.candidates[i]?.name ?? 'Write-In');
          expect(option.isWriteIn).toBe(i >= contest.candidates.length);
          expect(option.optionIndex).toBe(i);
        }
      }
    )
  );
});

test('candidate contest with provided write-in IDs', () => {
  fc.assert(
    fc.property(
      // Make a contest…
      arbitraryCandidateContest({
        allowWriteIns: fc.constant(true),
      }).chain((contest) =>
        // …and come up with IDs for the write-ins.
        fc.tuple(
          fc.array(arbitraryCandidateId(), {
            minLength: contest.seats,
            maxLength: contest.seats,
          }),
          fc.constant(contest)
        )
      ),
      ([writeInOptionIds, contest]) => {
        const options = Array.from(
          allContestOptions(contest, writeInOptionIds)
        );
        expect(options).toHaveLength(
          contest.candidates.length + writeInOptionIds.length
        );
        for (const [i, option] of options.entries()) {
          assert(option.type === 'candidate');
          expect(option.id).toBe(
            contest.candidates[i]?.id ??
              writeInOptionIds[i - contest.candidates.length]
          );
          expect(option.contestId).toBe(contest.id);
          expect(option.name).toBe(contest.candidates[i]?.name ?? 'Write-In');
          expect(option.isWriteIn).toBe(i >= contest.candidates.length);
          expect(option.optionIndex).toBe(i);
        }
      }
    )
  );
});

test('yesno contest', () => {
  fc.assert(
    fc.property(arbitraryYesNoContest(), (contest) => {
      expect(Array.from(allContestOptions(contest))).toEqual(
        typedAs<ContestOption[]>([
          {
            type: 'yesno',
            id: 'yes',
            contestId: contest.id,
            name: 'Yes',
            optionIndex: 0,
          },
          {
            type: 'yesno',
            id: 'no',
            contestId: contest.id,
            name: 'No',
            optionIndex: 1,
          },
        ])
      );
    })
  );
});

test('ms-either-neither contest', () => {
  fc.assert(
    fc.property(arbitraryMsEitherNeitherContest(), (contest) => {
      expect(Array.from(allContestOptions(contest))).toEqual(
        typedAs<ContestOption[]>([
          {
            type: 'ms-either-neither',
            id: expect.any(String),
            contestId: contest.eitherNeitherContestId,
            name: expect.any(String),
            optionIndex: 0,
          },
          {
            type: 'ms-either-neither',
            id: expect.any(String),
            contestId: contest.eitherNeitherContestId,
            name: expect.any(String),
            optionIndex: 1,
          },
          {
            type: 'ms-either-neither',
            id: expect.any(String),
            contestId: contest.pickOneContestId,
            name: expect.any(String),
            optionIndex: 2,
          },
          {
            type: 'ms-either-neither',
            id: expect.any(String),
            contestId: contest.pickOneContestId,
            name: expect.any(String),
            optionIndex: 3,
          },
        ])
      );
    })
  );
});

import { BallotMark, VotesDict } from '@votingworks/types';
import makeDebug from 'debug';
import { addVote } from './hmpb/votes';

const debug = makeDebug('ballot-interpreter-vx:getVotesFromMarks');

/**
 * Gets the votes where the given marks have a high enough score to count, where
 * a score of 0 means nothing is filled in and a score of 1 means everything is
 * filled in.
 */
export function getVotesFromMarks(
  marks: readonly BallotMark[],
  { markScoreVoteThreshold }: { markScoreVoteThreshold: number }
): VotesDict {
  const votes: VotesDict = {};

  for (const mark of marks) {
    switch (mark.type) {
      case 'candidate':
        if (mark.score >= markScoreVoteThreshold) {
          debug(
            `'%s' contest '%s' mark score (%d) for '%s' meets vote threshold (%d)`,
            mark.type,
            mark.contest.id,
            mark.score,
            mark.option.name,
            markScoreVoteThreshold
          );
          addVote(votes, mark.contest, mark.option);
        }
        break;

      case 'yesno':
        if (mark.score >= markScoreVoteThreshold) {
          debug(
            `'%s' contest '%s' mark score (%d) for '%s' meets vote threshold (%d)`,
            mark.type,
            mark.contest.id,
            mark.score,
            mark.option,
            markScoreVoteThreshold
          );
          addVote(votes, mark.contest, mark.option);
        }
        break;

      case 'ms-either-neither':
        if (mark.score >= markScoreVoteThreshold) {
          debug(
            `'%s' contest '%s' mark score (%d) for '%s' meets vote threshold (%d)`,
            mark.type,
            mark.contest.id,
            mark.score,
            mark.option.label,
            markScoreVoteThreshold
          );
          addVote(votes, mark.contest, mark.option);
        }
        break;

      default:
        throw new Error(`mark type '${mark.type}' is not yet supported`);
    }
  }

  return votes;
}

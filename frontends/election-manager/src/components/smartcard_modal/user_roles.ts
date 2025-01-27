import { throwIllegalValue } from '@votingworks/utils';
import { UserRole } from '@votingworks/types';

export function userRoleToReadableString(userRole: UserRole): string {
  switch (userRole) {
    case 'system_administrator':
      return 'System Administrator';
    case 'election_manager':
      return 'Election Manager';
    case 'poll_worker':
      return 'Poll Worker';
    case 'voter':
      return 'Voter';
    case 'cardless_voter':
      return 'Cardless Voter';
    /* istanbul ignore next: Compile-time check for completeness */
    default:
      throwIllegalValue(userRole);
  }
}

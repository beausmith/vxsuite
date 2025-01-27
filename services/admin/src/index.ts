// Import the rest of our application.
import { Logger, LogSource, LogEventId } from '@votingworks/logging';
import * as server from './server';

const logger = new Logger(LogSource.VxAdminService);

async function main(): Promise<number> {
  await server.start({});
  return 0;
}

if (require.main === module) {
  void main()
    .catch((error) => {
      void logger.log(LogEventId.ApplicationStartup, 'system', {
        message: `Error in starting Admin Service: ${error.stack}`,
        disposition: 'failure',
      });
      return 1;
    })
    .then((code) => {
      process.exitCode = code;
    });
}

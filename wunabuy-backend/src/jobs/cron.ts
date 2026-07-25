import cron from 'node-cron';
import { logger } from '../config/logger';
import { env } from '../config/env';

// TODO: Import job runners once implemented
// import { runEscrowAutoRelease } from './escrow-auto-release.job';
// import { runRankingRefresh } from './ranking-refresh.job';
// import { runOrderTimeout } from './order-timeout.job';

export function startCronJobs() {
  if (env.NODE_ENV === 'test') return;

  // Escrow auto-release: every hour
  // cron.schedule('0 * * * *', () => runEscrowAutoRelease());

  // Order timeout: every 15 minutes
  // cron.schedule('*/15 * * * *', () => runOrderTimeout());

  // Ranking refresh: every 6 hours
  // cron.schedule('0 */6 * * *', () => runRankingRefresh());

  // Notification cleanup: daily at 3AM
  // cron.schedule('0 3 * * *', () => runNotificationCleanup());

  // Chat archive: daily at 3AM
  // cron.schedule('0 3 * * *', () => runChatArchive());

  // Reconciliation: daily at 6AM
  // cron.schedule('0 6 * * *', () => runReconciliation());

  logger.info('Cron jobs scheduled');
}

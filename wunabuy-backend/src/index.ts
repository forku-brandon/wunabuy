import { createApp } from './app';
import { logger } from './config/logger';

const app = createApp();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  logger.info(`Wunabuy API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

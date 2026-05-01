import dotenv from 'dotenv';

dotenv.config();

const [{ createApp }, { connectDb }, { env }] = await Promise.all([
  import('./app.js'),
  import('./config/db.js'),
  import('./config/env.js')
]);

try {
  await connectDb();
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`API running on port ${env.PORT}`);
  });

  function shutdown(signal) {
    console.log(`${signal} received, shutting down`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
} catch (error) {
  console.error(error);
  process.exit(1);
}

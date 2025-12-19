const app = require('./dist/app');

const PORT = process.env.PORT || 8001;

const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down test server...');
  server.close(() => {
    console.log('Test server stopped');
    process.exit(0);
  });
});

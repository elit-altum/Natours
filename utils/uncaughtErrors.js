// For error handling in synchronous code

// Unhandled exception (synchronous code) error handling
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION: ');
  console.log(`${err.name}: ${err.message}`);
  process.exit(1);
});

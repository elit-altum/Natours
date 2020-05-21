// For error handling in synchronous code

// Unhandled exception (synchronous code) error handling
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION: ');
  console.log(`${err.name}: ${err.message}`);
  console.log(err);
  process.exit(1);
});

const app = require('./app');

// Starts the express app on a port
const port = 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

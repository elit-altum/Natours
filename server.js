const dotenv = require('dotenv');
// Use dotenv to parse config variables
dotenv.config({
  path: './config.env',
});

const app = require('./app');

// Starts the express app on a port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

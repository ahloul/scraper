const express = require('express');
const stockRoutes = require('./modules/stock/stock.routes');

const app = express();
const port = 3000;

app.use(express.json()); // Body parser middleware
app.use(function (req, res, next) {
  res.setTimeout(9000000, function () {
      console.log('Request has timed out.');
      return res.json({ succes: false, message: "request timeout" });
  });
  console.log("calling next");
  next();
});
app.use('/api/stock', stockRoutes); // Use stock module routes

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

server.timeout = 9000000; // Set timeout to 5 seconds
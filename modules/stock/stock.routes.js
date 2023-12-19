const express = require('express');
const stockController = require('./controllers/stock.controller');
const router = express.Router();

// Define the route for getting stock data
router.get('/data', stockController.getStockData);

module.exports = router;
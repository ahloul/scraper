const stockService = require('../services/stock.service');

// Controller for fetching stock data
async function getStockData(req, res) {
  try {
    const url = req.query.url;
    // if (!url) {
    //   return res.status(400).json({ error: 'URL parameter is required' });
    // }
    const stockData = await stockService.getStockData('https://global.direct.asda.com/george/men/D2M1G10,default,sc.html');
    res.json(stockData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stock data' });
  }
}

module.exports = {
  getStockData,
};
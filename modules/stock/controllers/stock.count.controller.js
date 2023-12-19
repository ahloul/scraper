const stockService = require('../services/stock.service');

// Controller for fetching stock data
async function getStockCountData(req, res) {
  try {
    const url = req.query.url;
    // if (!url) {
    //   return res.status(400).json({ error: 'URL parameter is required' });
    // }

    https://global.direct.asda.com/george/women/all-clothing/D1M1G23C1,default,sc.html
    https://global.direct.asda.com/george/lingerie/D27,default,sc.html
    https://global.direct.asda.com/george/men/all-clothing/D2M1G13C1,default,sc.html
    https://global.direct.asda.com/george/kids/all-clothing/D25M1G3C1,default,sc.html
    https://global.direct.asda.com/george/kids/all-clothing/D25M2G3C1,default,sc.html
    https://global.direct.asda.com/george/baby/all-boys-clothing/D5M9G2C1,default,sc.html
    const stockData = await stockService.getStockData('https://global.direct.asda.com/george/men/D2M1G10,default,sc.html');
    res.json(stockData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stock data' });
  }
}

module.exports = {
  getStockData,
};
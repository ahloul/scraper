const puppeteer = require('puppeteer');

async function withRetry(action, maxAttempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed. Retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before retrying
    }
  }
  throw lastError;
}

async function getStockData(url) {
  const browser = await puppeteer.launch({ headless: false, timeout: 0 });
  let page;

  try {
    page = await browser.newPage();
    await withRetry(() => page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 }));

    let collectedLinks = new Set();
    let previousLength = 0;
    const selector = '.product-list a';
    const maxLinksToCollect = 100;

    while (collectedLinks.size < maxLinksToCollect) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForNetworkIdle();

      const linksOnPage = await page.$$eval(selector, anchors => anchors.map(anchor => anchor.href));
      linksOnPage.forEach(link => collectedLinks.add(link));

      if (collectedLinks.size === previousLength) {
        break;
      }
      previousLength = collectedLinks.size;
      await page.waitForTimeout(2000);
    }

    let links = Array.from(collectedLinks).slice(0, maxLinksToCollect);
    let scrapedData = [];

    for (let link of links) {
      if (!page.isClosed()) {
        await withRetry(() => page.goto(link, { waitUntil: 'networkidle0', timeout: 0 }));
        await page.waitForSelector('.product__title', { timeout: 0 });
        await page.waitForSelector('.product__price-value', { timeout: 0 });

        let title = await page.$eval('.product__title', el => el.innerText);
        let price = await page.$eval('.product__price-value', el => el.innerText);

        let sku = null;
        await withRetry(() => page.waitForFunction(() => {
          const elements = document.querySelectorAll('script[type="application/ld+json"]');
          return elements.length >= 3;
        }, { timeout: 0 }));
  
        const elements = await page.$$('script[type="application/ld+json"]');
        if (elements.length > 0) {
          const secondElement = elements[1];
          const text = await page.evaluate(el => el.innerText, secondElement);
          const JSONparsedText = JSON.parse(text);
          console.log(JSONparsedText);
          if (JSONparsedText && JSONparsedText.sku) {
            sku = JSONparsedText.sku;
          }
        } else {
          console.error('Not enough JSON-LD script tags found');
        }
        let stockData = await page.evaluate(() => {
          return window.priceAvailabilityJSON;
        });

        let stockLevels = [];
        if (stockData && stockData.productAvailability) {
          for (const [sku, productInfo] of Object.entries(stockData.productAvailability)) {
            if (productInfo && productInfo.availability) {
              stockLevels.push({
                sku: sku,
                price: productInfo.price ? productInfo.price.list.value : null,
                inStockQty: productInfo.availability.inStockQty,
                status: productInfo.availability.level
              });
            }
          }
        }

        scrapedData.push({
          link,
          title,
          price,
          stockLevels
        });
      }
    }

    console.log(scrapedData);
    return {
      scrapedData
    };
  } catch (error) {
    console.error('Error during getStockData:', error);
    throw error;
  } finally {
    // Clean up resources
    if (page && !page.isClosed()) {
      await page.close();
    }
    await browser.close();
  }
}

module.exports = {
  getStockData
};
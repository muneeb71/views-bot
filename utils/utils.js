const fs = require('fs');
const path = require('path');

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const readProxiesFromFile = async (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n').filter((line) => line.trim() !== '');

    const proxies = lines.map((line) => {
      const [address, port] = line.split(':');
      return { address, port: parseInt(port, 10) };
    });

    return proxies;
  } catch (err) {
    console.error(`Error reading proxies from file: ${err}`);
    return [];
  }
};

const getRandomProxy = async (filePath) => {
  const proxies = await readProxiesFromFile(filePath);
  if (proxies.length === 0) {
    throw new Error('No proxies available');
  }

  const randomIndex = getRandomInt(0, proxies.length - 1);
  return proxies[randomIndex];
};

const getProxy = async () => {
  const filePath = path.join(__dirname, '../proxiesList.txt');
  try {
    const randomProxy = await getRandomProxy(filePath);
    return randomProxy;
  } catch (err) {
    console.error(err);
  }
};

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Safari/605.1.15',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Mobile/15E148 Safari/604.1',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const clearCookiesAndCache = async (page) => {
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCookies');
  await client.send('Network.clearBrowserCache');
};

const smoothScroll = async (page) => {
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  let scrolled = 0;
  let direction = 1;

  const totalScrollTime = getRandomInt(10000, 20000);
  const startTime = Date.now();

  while (Date.now() - startTime < totalScrollTime) {
    const scrollStep = getRandomInt(50, 100) * direction;
    await page.evaluate((step) => window.scrollBy(0, step), scrollStep);
    scrolled += scrollStep;

    if (Math.random() > 0.9) {
      direction *= -1;
    }

    await sleep(getRandomInt(100, 300));
  }
};

const simulateMouseMovement = async (page) => {
  const startX = getRandomInt(0, 1200);
  const startY = getRandomInt(0, 600);
  await page.mouse.move(startX, startY);

  const movements = getRandomInt(5, 15);
  for (let i = 0; i < movements; i++) {
    const endX = getRandomInt(0, 1200);
    const endY = getRandomInt(0, 600);
    const steps = getRandomInt(10, 100);
    await page.mouse.move(endX, endY, { steps });
    await sleep(getRandomInt(100, 700));
  }
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

module.exports = {
  getRandomInt,
  readProxiesFromFile,
  getRandomProxy,
  getProxy,
  userAgents,
  sleep,
  clearCookiesAndCache,
  smoothScroll,
  simulateMouseMovement,
  shuffleArray
};

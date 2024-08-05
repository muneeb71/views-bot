const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
const {
  clearCookiesAndCache,
  sleep,
  smoothScroll,
  shuffleArray,
  userAgents,
  getProxy,
  getRandomInt,
  getBrowserConfig,
} = require("../../utils/helper");

const ttpMediaKeyword = "https://rehowto.com/";

let count = 0;

const runBotForWebsite = async (browser) => {
  try {
    const ttpMediaPage = await browser.newPage();
    await clearCookiesAndCache(ttpMediaPage);

    const directBrowseProbability = Math.random();
    const browseThroughGoogle = directBrowseProbability < 0.5;

    if (browseThroughGoogle) {
      await ttpMediaPage.goto("https://www.google.com", { timeout: 60000 });
      await sleep(getRandomInt(1000, 3000));
      await ttpMediaPage.type("textarea[name=q]", ttpMediaKeyword, {
        delay: getRandomInt(150, 300),
      });
      await sleep(getRandomInt(500, 1500));
      await ttpMediaPage.keyboard.press("Enter");
      await ttpMediaPage.waitForNavigation();

      await ttpMediaPage.solveRecaptchas();
      await ttpMediaPage.goto("https://rehowto.com/", { timeout: 60000 });
      await sleep(getRandomInt(2000, 5000));
      await smoothScroll(ttpMediaPage);
      await sleep(getRandomInt(15000, 30000));
      const validLinks = [
        "https://rehowto.com/contact-us/",
        "https://rehowto.com/about-us/",
        "https://rehowto.com/our-blog/",
        "https://rehowto.com/how-to-start-real-estate-company-in-usa/",
        "https://rehowto.com/diy-curb-appeal-magic-creative-projects-to-beautify-your-homes-exterior/",
        "https://rehowto.com/miami-market-update-april-2024-sunshine-and-stability-keep-their-grip-on-power/",
      ];
      if (validLinks.length > 0) {
        shuffleArray(validLinks);
        for (const validLink of validLinks) {
          await ttpMediaPage.goto(validLink, { timeout: 60000 });
          await sleep(getRandomInt(2000, 5000));
          await smoothScroll(ttpMediaPage);
          await sleep(getRandomInt(15000, 30000));
        }
      }
    } else {
      await ttpMediaPage.goto(ttpMediaKeyword, { timeout: 60000 });
      await sleep(getRandomInt(2000, 5000));
      await smoothScroll(ttpMediaPage);

      const validLinks = [
        "https://rehowto.com/contact-us/",
        "https://rehowto.com/about-us/",
        "https://rehowto.com/our-blog/",
        "https://rehowto.com/how-to-start-real-estate-company-in-usa/",
        "https://rehowto.com/diy-curb-appeal-magic-creative-projects-to-beautify-your-homes-exterior/",
        "https://rehowto.com/miami-market-update-april-2024-sunshine-and-stability-keep-their-grip-on-power/",
      ];
      if (validLinks.length > 0) {
        shuffleArray(validLinks);
        for (const validLink of validLinks) {
          await ttpMediaPage.goto(validLink, { timeout: 60000 });
          await sleep(getRandomInt(2000, 5000));
          await smoothScroll(ttpMediaPage);
          await sleep(getRandomInt(15000, 30000));
        }
      }
      await sleep(getRandomInt(8000, 12000));
    }
    count++;
    await ttpMediaPage.close();
  } catch (err) {
    console.log("Error in runBotForWebsite:", err);
    throw new Error("Crashed");
  }
};

const runBot = async (proxy, num = null) => {
  puppeteer.use(StealthPlugin());
  puppeteer.use(
    RecaptchaPlugin({
      provider: {
        id: "2captcha",
        token: "79b91a77d03c6fac9ba4b99bcd132d0d",
      },
      visualFeedback: true,
    })
  );
  const userAgent = userAgents[getRandomInt(0, userAgents.length - 1)];
  const config = getBrowserConfig(proxy, userAgent);
  const browser = await puppeteer.launch(config);

  try {
    while (true) {
      if (num) {
        await runBotForWebsite(browser);
      }
    }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  } finally {
    await browser.close();
  }
};

const runBotWithRetries = async (botIndex, totalAttempts) => {
  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    const _proxy = await getProxy();
    console.log(_proxy);
    return;
    console.log(
      `Bot ${botIndex}: Current Proxy Is: ${_proxy.proxy_address}:${_proxy.port}`
    );
    try {
      await runBot(_proxy, attempt);
      break;
    } catch (err) {
      console.log(`Bot ${botIndex}: ${err}`);
      console.log(
        `Bot ${botIndex}: Attempt ${attempt} failed for proxy ${_proxy.proxy_address}:${_proxy.port}`
      );
      attempt--;
    }
  }
};

const runBotsInParallelService = async (botCount, views) => {
  const bots = [];
  for (let count = 1; count <= botCount; count++) {
    bots.push(runBotWithRetries(count, views / botCount));
  }

  await Promise.all(bots);
};
module.exports = {
  runBotsInParallelService,
};

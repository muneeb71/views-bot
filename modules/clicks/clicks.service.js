const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
const {
  getRandomInt,
  getProxy,
  userAgents,
  sleep,
  clearCookiesAndCache,
  smoothScroll,
  simulateMouseMovement,
} = require("../../utils/helper");

const targetList = [
  "Insurance",
  "Loans",
  "Mortgage",
  "Attorney",
  "Credit",
  "Lawyer",
  "Donate",
  "Degree",
  "Hosting",
  "Claim",
  "Conference Call",
  "Trading",
  "Software",
  "Recovery",
  "Transfer",
  "Gas/Electicity",
  "Classes",
  "Rehab",
  "Treatment",
];
const clickAds = async (page) => {
  const adSelectors = ["iframe"];

  for (const selector of adSelectors) {
    const ads = await page.$$(selector);
    if (ads.length > 0) {
      console.log(`Found ${ads.length} ads with selector: ${selector}`);
    } else {
      console.log(`No ads found with selector: ${selector}`);
    }

    for (const ad of ads) {
      try {
        const adHref = await page.evaluate(
          async (node) => node.href || node.src || "",
          ad
        );

        if (
          adHref &&
          (adHref.startsWith("http") ||
            adHref.startsWith("https") ||
            adHref.includes("ad"))
        ) {
          await ad.click();
          console.log(`Ad clicked: ${adHref}`);
          await sleep(getRandomInt(10000, 12000));
          await smoothScroll(page);
          await simulateMouseMovement(page);
        } else {
          const childAd = await page.evaluateHandle((node) => {
            const clickableElements = node.querySelectorAll(
              'a[href], [onclick], [role="button"]'
            );
            for (const element of clickableElements) {
              if (
                element.href ||
                element.src ||
                element.onclick ||
                element.getAttribute("role") === "button"
              ) {
                return element;
              }
            }
            return null;
          }, ad);

          if (childAd) {
            const childAdHref = await page.evaluate(
              (node) => node.href || node.src || "",
              childAd
            );
            if (
              childAdHref &&
              (childAdHref.startsWith("http") ||
                childAdHref.startsWith("https") ||
                childAdHref.includes("ad"))
            ) {
              await childAd.click();
              console.log(`Child ad clicked: ${childAdHref}`);
              await sleep(getRandomInt(20000, 30000));
              await smoothScroll(page);
              await simulateMouseMovement(page);
            } else {
              console.log(`Invalid child ad link: ${childAdHref}`);
            }
          } else {
            console.log(`No clickable element found in ad: ${adHref}`);
          }
        }
      } catch (err) {
        console.log(`Error clicking the ad: ${err}`);
        throw new Error("Error Clicking Ads");
      }
    }
  }
};

const runBotForWebsite = async (browser, websiteUrl) => {
  try {
    const page = await browser.newPage();
    await clearCookiesAndCache(page);
    for (let i = 0; i < 2; i++) {
      await page.goto("https://www.google.com", { timeout: 60000 });
      await sleep(getRandomInt(1000, 3000));
      await page.type(
        "textarea[name=q]",
        targetList[getRandomInt(0, targetList.length - 1)],
        {
          delay: getRandomInt(150, 300),
        }
      );
      await sleep(getRandomInt(500, 1500));
      await page.keyboard.press("Enter");
      await page.waitForNavigation();

      await sleep(getRandomInt(2000, 5000));
      await smoothScroll(page);
    }
    await sleep(getRandomInt(10000, 15000));

    await page.goto(websiteUrl, { timeout: 120000 });
    await sleep(getRandomInt(10000, 20000));
    await clickAds(page);

    await page.close();
  } catch (err) {
    console.log("Error in runBotForWebsite:", err);
    throw new Error("Crashed");
  }
};

const runBot = async (proxy, websiteUrl) => {
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
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--proxy-server=http://${proxy.address}:${proxy.port}`,
      `--user-agent=${userAgent}`,
    ],
  });

  try {
    await runBotForWebsite(browser, websiteUrl);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  } finally {
    await browser.close();
  }
};

const runBotWithRetries = async (botIndex, totalAttempts) => {
  const websiteUrl = "https://rehowto.com/";
  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
    const _proxy = await getProxy();
    console.log(
      `Bot ${botIndex}: Current Proxy Is: ${_proxy.address}:${_proxy.port}`
    );
    try {
      await runBot(_proxy, websiteUrl);
      break;
    } catch (err) {
      console.log(`Bot ${botIndex}: ${err}`);
      console.log(
        `Bot ${botIndex}: Attempt ${attempt} failed for proxy ${_proxy.address}:${_proxy.port}`
      );
      attempt--;
    }
  }
};

const runBotsInParallel = async (botCount, clicks) => {
  const bots = [];
  for (let count = 1; count <= botCount; count++) {
    bots.push(runBotWithRetries(count, clicks / botCount));
  }
  await Promise.all(bots);
};

module.exports = {
  runBotsInParallel,
};

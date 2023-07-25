import puppeteer from "puppeteer";

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("https://play2048.co/");

  await page.waitForSelector(".tile-container");

  const children = await page.evaluate(() => {
    const parentElement = document.querySelector(`.tile-container`);
    if (!parentElement) return [];

    console.log(parentElement);

    return Array.from(parentElement.children);
  });

  console.log(children);

  setTimeout(async () => {
    console.log("Finished");
    await browser.close();
  }, 3000);
})();

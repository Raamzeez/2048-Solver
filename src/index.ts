import puppeteer, { KeyInput, Page } from "puppeteer";

const hasChanged = async (page: Page): Promise<number[][]> => {
  const newBoard = [];

  await page.waitForSelector(".tile-container");

  const tileContainer = await page.$(".tile-container");

  if (tileContainer) {
    const children = await tileContainer.$$("*");

    for (const child of children) {
      const className = (await child.getProperty("className")).toString();
      if (!className.includes("tile-inner")) {
        console.log(className + "\n");
        const positionClass = className.split(" ")[2];
        console.log(positionClass + "\n");
        const splitPosition = positionClass.split("-");
        console.log(splitPosition + "\n");
        newBoard.push([parseInt(splitPosition[2]), parseInt(splitPosition[3])]);
      }
    }
  }

  return newBoard;
};

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("https://play2048.co/");

  const moveSequence: KeyInput[] = ["ArrowDown", "ArrowLeft", "ArrowRight"];

  let moveIndex = 0;

  let board: number[][] = [[], [], []];

  let newBoard: number[][] = [[], [], []];

  for (let i = 0; i < 10; i++) {
    newBoard = await hasChanged(page);
    if (board !== newBoard) {
      continue;
    } else {
      moveIndex += 1;
    }
    board = newBoard;
    console.log("Board: ", board);
    console.log("Pressing: " + moveSequence[0]);
    await page.keyboard.press(moveSequence[0]);
  }

  setTimeout(async () => {
    console.log("Finished");
    await browser.close();
  }, 10000);
})();

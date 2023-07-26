import puppeteer, { KeyInput, Page } from "puppeteer";

const visualizeBoard = (board: number[][]): void => {
  const grid = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  board.forEach((piece) => {
    grid[piece[0]][piece[1]] = 1;
  });

  console.log(grid);
};

const getBoard = async (
  page: Page,
  highestTile: number
): Promise<[number[][], number]> => {
  const newBoard = [];

  await page.waitForSelector(".tile-container");

  const tileContainer = await page.$(".tile-container");

  if (tileContainer) {
    const children = await tileContainer.$$("*");

    for (const child of children) {
      const className = (await child.getProperty("className")).toString();
      if (!className.includes("tile-inner")) {
        console.log(className + "\n");
        const splitClasses = className.split(" ");
        const positionClass = splitClasses[2];
        console.log(positionClass + "\n");
        const splitPosition = positionClass.split("-");
        console.log(splitPosition + "\n");
        newBoard.push([parseInt(splitPosition[2]), parseInt(splitPosition[3])]);
        const tileValue = parseInt(splitClasses[1].split("-")[1]);
        if (tileValue > highestTile) {
          highestTile = tileValue;
        }
      }
    }
  }

  return [newBoard, highestTile];
};

const isGameOver = async (page: Page): Promise<boolean> => {
  const gameOver = await page.evaluate(() => {
    return !!document.querySelector(".game-over"); // !! converts anything to boolean
  });
  return gameOver;
};

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("https://play2048.co/");

  // const moveSequence: KeyInput[] = ["ArrowDown", "ArrowLeft", "ArrowRight"];
  const moveSequence: KeyInput[] = ["ArrowLeft", "ArrowDown", "ArrowRight"];

  let moveIndex = 0;

  let board: number[][] = [[], [], [], []];

  let newBoard: number[][] = [[], [], [], []];

  let repeats = 0;

  let loops = 0;

  let moves = 0;

  let highestTile = 0;

  for (let i = 0; i < 500; i++) {
    const gameOver = await isGameOver(page);
    if (gameOver) {
      console.log("GAME OVER!");
      break;
    }
    const data = await getBoard(page, highestTile);
    newBoard = data[0];
    highestTile = data[1];
    console.log("Prev Board: ", board);
    console.log("New Board: ", newBoard);
    // if (JSON.stringify(board) == JSON.stringify(newBoard)) {
    //   console.log("Board has not changed");
    //   repeats += 1;
    //   if (repeats < 2) {
    //     if (moveIndex == 0) {
    //       moveIndex = 1;
    //     } else if (moveIndex == 1) {
    //       moveIndex = 0;
    //     } else {
    //       moveIndex = 0;
    //     }
    //   } else {
    //     if (moveIndex == 2) {
    //       moveIndex = 0;
    //     } else {
    //       moveIndex++;
    //     }
    //   }
    // } else {
    //   moves++;
    //   repeats = 0;
    // }
    board = newBoard;
    console.log("\nMove Index", moveIndex);
    console.log("Pressing: " + moveSequence[moveIndex], "\n");
    // loops++;
    moves++;
    if (moveIndex < 2) {
      moveIndex++;
    } else {
      moveIndex = 0;
    }
    await page.keyboard.press(moveSequence[moveIndex]);
  }

  console.log("Moves: ", moves);
  console.log("Highest Tile: ", highestTile);

  setTimeout(async () => {
    console.log("Finished");
    await browser.close();
  }, 4000);
})();

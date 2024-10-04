import './style.css';



export class Game {
  #board: Board;
  #movementManager: MovementManager;
  #scoreDiv: HTMLElement;
  #statusDiv: HTMLElement;
  #score: number;
  #status: string;

  constructor() {
    const app = document.getElementById('app');
    if (!app) {
      document.body.innerHTML = '<div id="app"><div id="tileContainer"></div></div>';

    }
    this.#board = new Board(4, 4);
    this.#score = 0;
    this.#status = 'Playing';
    this.#movementManager = new MovementManager(this.#board);
    this.#movementManager.setMoveEndCallback(() => {
      this.updateScore();
      if (this.isGameOver()) {
        this.status = 'Game Over';
      }
    });


    const scoreDiv = document.getElementById('score');
    if (scoreDiv) {
      this.#scoreDiv = scoreDiv;
    } else {
      const score = document.createElement('div');
      score.id = 'score';

      this.#scoreDiv = score;
      const app = document.getElementById('app');
      if (app) {
        app.appendChild(score);
      }
    }

    this.#scoreDiv.textContent = this.#score.toString();

    const statusDiv = document.getElementById('status');
    if (statusDiv) {
      this.#statusDiv = statusDiv;
    } else {
      const status = document.createElement('div');
      status.id = 'status';

      this.#statusDiv = status;
      const app = document.getElementById('app');
      if (app) {
        app.appendChild(status);
      }
    }


  }

  get status() {
    return this.#status;
  }

  set status(status: string) {
    this.#status = status;
    this.#statusDiv.textContent = status

  }

  get board() {
    return this.#board;
  }

  get movementManager() {
    return this.#movementManager;
  }

  start() {
    const app = document.getElementById('app');
    if (app) {
      app.appendChild(this.#board.displayInitialCells());
    }
  }

  updateScore() {
    console.log("Calling upate score");
    const highestValue = this.#board.getHighestValue();

    this.#scoreDiv.textContent = String(highestValue);
  }

  isGameOver() {
    // iterate over every cell and check for possible moves for every cell
    // if no possible moves, return true
    let possibleMoveCount = 0;
    for (let i = 0; i < this.#board.rows; i++) {
      for (let j = 0; j < this.#board.cols; j++) {
        const coord = { i, j };
        // up
        if (this.movementManager.findNextPossibleCell(coord, { i: -1, j: 0 })) {
          possibleMoveCount++;
        }
        // down
        if (this.movementManager.findNextPossibleCell(coord, { i: 1, j: 0 })) {
          possibleMoveCount++;
        }
        // left
        if (this.movementManager.findNextPossibleCell(coord, { i: 0, j: -1 })) {
          possibleMoveCount++;
        }
        // right
        if (this.movementManager.findNextPossibleCell(coord, { i: 0, j: 1 })) {
          possibleMoveCount++;
        }
      }
    }
    console.log("Possible move count", possibleMoveCount === 0);
    return possibleMoveCount === 0;
  }

}

class ValueGenerator {
  static generate(): number {
    return Math.random() < 0.9 ? 2 : 4;
  }
}

class Cell {
  #id: string;
  #element: HTMLElement;
  #tile: Tile | undefined;
  #merged: boolean;

  constructor(value: string, id: string) {
    this.#id = id;

    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.id = this.id;

    this.#element = cell;
    this.#merged = false;
  }

  get element() {
    return this.#element;
  }

  get tile() {
    return this.#tile
  }

  get id() {
    return this.#id;
  }

  get merged() {
    return this.#merged;
  }

  set merged(value: boolean) {
    this.#merged = value;
  }

  addTile(tile: Tile) {
    tile.left = `${this.#element.getBoundingClientRect().left}px`;
    tile.top = `${this.#element.getBoundingClientRect().top}px`;
    tile.id = this.#id;
    this.#tile = tile;
  }

  removeTile() {
    if (this.#tile) {
      // this.#tile.destroy();
      this.#tile = undefined;
    }
  }

  destroyTile() {
    this.#tile?.destroy();
  }


  generate() {
    return this.#element;
  }
}

class Tile {
  element: HTMLElement;
  #value: number;
  #top: string;
  #left: string;
  #id: string;

  constructor(value: number, id: string, top = '0', left = '0') {
    const tileId = `tile-${id}`;
    this.#value = value;
    this.#id = tileId;
    this.element = document.createElement('div');
    this.element.classList.add('tile');
    this.element.id = tileId;
    this.element.textContent = this.#value.toString();
    this.#top = top;
    this.#left = left;
    this.generate();

  }

  set top(value: string) {
    this.#top = value;
    this.element.style.top = this.#top
  }

  set left(value: string) {
    this.#left = value;
    this.element.style.left = this.#left;
  }


  set value(value: number) {
    this.#value = value;
    this.element.textContent = value.toString();
  }

  set id(value: string) {
    this.#id = value;
    this.element.id = `tile-${this.#id}`;
  }

  destroy() {
    this.element.remove();
  }

  generate() {
    document.getElementById("tileContainer")?.appendChild(this.element);
    return this.element;
  }



}

class Board {
  #rows: number;
  #cols: number;
  #data: number[][];
  #cells: Cell[] = [];


  constructor(rows: number, cols: number) {
    this.#rows = rows;
    this.#cols = cols;
    this.#data = [];
  }

  get rows() {
    return this.#rows;
  }

  get cols() {
    return this.#cols;
  }

  get size() {
    return this.#rows * this.#cols;
  }

  get data() {
    return this.#data;
  }

  get cells() {
    return this.#cells;
  }

  getHighestValue() {
    let highestValue = 0;
    for (let i = 0; i < this.#rows; i++) {
      for (let j = 0; j < this.#cols; j++) {
        if (this.#data[i][j] > highestValue) {
          highestValue = this.#data[i][j];
        }
      }
    }

    return highestValue;
  }

  updateBoard(data: number[][]) {
    this.#data = data;
    // Place tiles according to the data
    for (let i = 0; i < this.#rows; i++) {
      for (let j = 0; j < this.#cols; j++) {
        const value = data[i][j];
        if (value !== 0) {
          const cell = this.#cells.find(cell => cell.id === `${i}-${j}`);
          if (cell) {
            cell.removeTile();
            const tile = new Tile(value, `${i}-${j}`);
            cell.addTile(tile);
          }

        }
      }
    }

  }

  getEmptyCells() {
    const emptyCells: number[][] = [];

    for (let i = 0; i < this.#rows; i++) {
      for (let j = 0; j < this.#cols; j++) {
        if (this.#data[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }

    return emptyCells;
  }

  addRandomValue() {
    const emptyCells = this.getEmptyCells();
    if (emptyCells.length === 0) {
      return;
    }
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const [row, col] = emptyCells[randomIndex];

    const value = ValueGenerator.generate();
    const tile = new Tile(value, `${row}-${col}`);
    this.#cells.find(cell => cell.id === `${row}-${col}`)?.addTile(tile);
    this.#data[row][col] = value;

  }

  displayInitialCells(): Node {
    const board = document.createElement('div');
    board.classList.add('board');

    for (let i = 0; i < this.#rows; i++) {
      const row = document.createElement('div');
      row.classList.add('row');

      for (let j = 0; j < this.#cols; j++) {
        const cell = new Cell('0', `${i}-${j}`);
        this.#cells.push(cell);

        row.appendChild(cell.generate());
        if (!this.#data[i]) {
          this.#data[i] = [];
        }
        this.#data[i][j] = 0;
      }


      board.appendChild(row);
    }

    return board;
  }
}

type Coordinate = {
  i: number;
  j: number;
};


class MovementManager {
  #board: Board;
  #moveEndCallback: undefined | (() => void);


  setMoveEndCallback(callback: () => void) {
    this.#moveEndCallback = callback;
  }

  DIRECTIONS: { [key: string]: Coordinate } = {
    UP: { i: -1, j: 0 },
    DOWN: { i: 1, j: 0 },
    LEFT: { i: 0, j: -1 },
    RIGHT: { i: 0, j: 1 },
  };

  constructor(board: Board) {
    this.#board = board;
    this.#moveEndCallback = undefined;

    // Add event listeners to arrow keys
    document.addEventListener('keydown', (event) => {
      this.process(event.key);

    });
  }


  process(direction: string) {
    switch (direction) {
      case 'ArrowUp':
        this.move(this.DIRECTIONS.UP);
        break;
      case 'ArrowDown':
        this.move(this.DIRECTIONS.DOWN);
        break;
      case 'ArrowLeft':
        this.move(this.DIRECTIONS.LEFT);
        break;
      case 'ArrowRight':
        this.move(this.DIRECTIONS.RIGHT);
        break;
    }

    if (this.#moveEndCallback) {
      this.#moveEndCallback();
    }
  }

  move(direction: Coordinate) {
    // Based on the current state of the board, move all the tiles (values) up
    // and merge the tiles with the same value.
    // Add a new tile with a value of 2 or 4 in a random empty cell.
    const { rows, cols } = this.#board;
    const data = this.#board.data;

    // Start from the correct side of the board depending on the direction
    const rowOrder = direction.i === 1 ? [...Array(rows).keys()].reverse() : [...Array(rows).keys()];
    const colOrder = direction.j === 1 ? [...Array(cols).keys()].reverse() : [...Array(cols).keys()];

    for (const i of rowOrder) {
      for (const j of colOrder) {
        const currentCell = data[i][j];
        const currentCellObj = this.#board.cells.find(cell => cell.id === `${i}-${j}`);
        // If the current cell is not empty
        if (currentCell !== 0 && currentCellObj) {

          // Find next possible cell to move to
          const nextCell = this.findNextPossibleCell({ i, j }, direction);
          const nextCellObj = this.#board.cells.find(cell => cell.id === `${nextCell?.i}-${nextCell?.j}`);

          // get coordinates of next cell
          if (nextCell && nextCellObj && currentCellObj) {

            // Merge if the next cell has the same value
            if (nextCell.merge && !nextCellObj.merged) {

              data[nextCell.i][nextCell.j] *= 2;
              data[i][j] = 0;
              nextCellObj.destroyTile(); // Remove tile from the DOM
              nextCellObj.removeTile();// Unlink tile from the cell
              if (currentCellObj?.tile) {
                currentCellObj.tile.value = data[nextCell.i][nextCell.j];
              }
              nextCellObj.addTile(currentCellObj.tile as Tile);
              currentCellObj.removeTile();
              nextCellObj.merged = true;
            } else {
              // Move to the next cell
              // Update data

              data[nextCell.i][nextCell.j] = currentCell;
              data[i][j] = 0;
              nextCellObj.addTile(currentCellObj.tile as Tile);
              currentCellObj.removeTile();
            }

            // draw data board for debug
            //this.drawDataBoard(data);
          }
        }

      }
    }

    if (this.#moveEndCallback) {
      this.#moveEndCallback();
    }
    setTimeout(() => {
      this.#board.addRandomValue();
      // Remove merged flag
      this.#board.cells.forEach(cell => {
        cell.merged = false;
      });




    }, 900);
  }

  drawDataBoard(data: number[][]) {
    const dataEl = document.getElementById('data');
    if (dataEl) {
      let tableHTML = '<table class="debug-table">';
      for (let row of data) {
        tableHTML += '<tr>';
        for (let cell of row) {
          tableHTML += `<td class="${cell > 0 ? "full" : ""}">${cell}</td>`;
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</table>';
      dataEl.innerHTML += tableHTML;
    }
  }


  findNextPossibleCell(currentCell: Coordinate, direction: Coordinate) {
    const { rows, cols, data } = this.#board;
    let nextRow = currentCell.i;
    let nextCol = currentCell.j;
    while (
      nextRow >= 0 &&
      nextCol >= 0 &&
      nextRow < rows &&
      nextCol < cols
    ) {


      const nextCell = this.#board.cells.find(cell => cell.id === `${nextRow + direction.i}-${nextCol + direction.j}`);
      const boundCondition = nextRow + direction.i < 0 ||
        nextRow + direction.i >= rows ||
        nextCol + direction.j < 0 ||
        nextCol + direction.j >= cols;

      if (
        boundCondition ||
        data[nextRow + direction.i][nextCol + direction.j] > 0 && data[nextRow + direction.i][nextCol + direction.j] !== data[currentCell.i][currentCell.j] ||
        (data[nextRow + direction.i][nextCol + direction.j] > 0 && nextCell && nextCell.merged === true)
      ) {
        break;
      }
      nextRow += direction.i;
      nextCol += direction.j;
    }


    if (data[nextRow] === undefined || data[nextRow][nextCol] === undefined || nextRow === currentCell.i && nextCol === currentCell.j) {
      return null;
    }

    const nextCell = this.#board.cells.find(cell => cell.id === `${nextRow}-${nextCol}`);

    if (
      data[nextRow][nextCol] === data[currentCell.i][currentCell.j] ||
      data[nextRow][nextCol] === 0
    ) {
      const returnObj = { i: nextRow, j: nextCol, merge: false };
      if (data[nextRow][nextCol] === data[currentCell.i][currentCell.j] && nextCell?.merged === false) {
        returnObj.merge = true;
      }

      return returnObj;
    }

    return null;
  }

}

const game = new Game();
game.start();

/* game.board.addRandomValue();
game.board.addRandomValue(); */

game.board.updateBoard([
  [2, 4, 2, 4],
  [4, 2, 4, 2],
  [2, 4, 2, 4],
  [4, 2, 4, 2]
]
);


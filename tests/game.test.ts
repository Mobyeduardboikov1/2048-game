// tests/game.test.ts
import { Game } from '../src/main';

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    // Set up the DOM environment
    document.body.innerHTML = '<div id="app"><div id="tileContainer"></div></div>';
    game = new Game();
  });

  test('should create a game', () => {
    expect(game.board).toBeDefined();
  });

  test('should display the board', () => {
    game.start();
    const app = document.getElementById('app');
    expect(app?.children.length).toBe(4);
  });

  test('should find the next possible cell', () => {
    game.start();
    game.board.updateBoard([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0]
    ]);

    const nextCell = game.movementManager.findNextPossibleCell({ i: 2, j: 0 }, game.movementManager.DIRECTIONS.UP);
    expect(nextCell).toBeDefined();
    if (nextCell) {
      expect(nextCell.i).toEqual(0);
      expect(nextCell.j).toEqual(0);
    } else {
      fail('nextCell is null');
    }
  });

  test('should move up', () => {
    game.start();
    game.board.updateBoard([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0]
    ]);

    game.movementManager.move({ i: -1, j: 0 });
    const data = game.board.data;
    expect(data[0][0]).toEqual(2);
  });

  test('should move tile up', () => {
    game.start();
    game.board.updateBoard([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0]
    ]);

    let tile = document.getElementById('tile-2-0');
    expect(tile).not.toBeNull();
    game.movementManager.move({ i: -1, j: 0 });
    tile = document.getElementById('tile-0-0');
    expect(tile).not.toBeNull();

  });

  test('should move 2 tiles up', () => {
    game.start();
    game.board.updateBoard([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 2, 0]
    ]);

    let tile1 = document.getElementById('tile-2-0');
    let tile2 = document.getElementById('tile-3-2');

    expect(tile1).not.toBeNull();
    expect(tile2).not.toBeNull();

    game.movementManager.move({ i: -1, j: 0 });

    tile1 = document.getElementById('tile-0-0');
    tile2 = document.getElementById('tile-0-2');

    expect(tile1).not.toBeNull();
    expect(tile2).not.toBeNull();

  });

  test('should move 2 tiles up, which are in the same column', () => {
    game.start();
    game.board.updateBoard([
      [0, 0, 0, 0],
      [2, 0, 0, 0],
      [4, 0, 0, 0],
      [0, 0, 0, 0]
    ]);

    let tile1 = document.getElementById('tile-1-0');
    let tile2 = document.getElementById('tile-2-0');

    expect(tile1).not.toBeNull();
    expect(tile2).not.toBeNull();

    game.movementManager.move({ i: -1, j: 0 });

    tile1 = document.getElementById('tile-0-0');
    tile2 = document.getElementById('tile-1-0');

    expect(tile1).not.toBeNull();
    expect(tile2).not.toBeNull();

  });

  test('Should merge 2 tiles with the same value', () => {
    game.start();
    game.board.updateBoard([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [2, 0, 0, 0],
      [2, 0, 0, 0]
    ]);

    let tile1 = document.getElementById('tile-2-0');
    let tile2 = document.getElementById('tile-3-0');

    expect(tile1).not.toBeNull();
    expect(tile2).not.toBeNull();

    game.movementManager.move({ i: -1, j: 0 });

    tile1 = document.getElementById('tile-0-0');
    tile2 = document.getElementById('tile-1-0');

    expect(tile1).not.toBeNull();
    expect(tile2).toBeNull();

    const data = game.board.data;
    expect(data[0][0]).toEqual(4);
  });

  test('should move down', () => {
    game.start();
    game.board.updateBoard([
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]);

    game.movementManager.move({ i: 1, j: 0 });
    const data = game.board.data;
    expect(data[3][0]).toEqual(2);
  });

  test('should move right', () => {
    game.start();
    game.board.updateBoard([
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]);

    game.movementManager.move({ i: 0, j: 1 });
    const data = game.board.data;
    expect(data[0][3]).toEqual(2);
  });

  test('should move left', () => {
    game.start();
    game.board.updateBoard([
      [0, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]);

    game.movementManager.move({ i: 0, j: 1 });
    const data = game.board.data;
    expect(data[0][3]).toEqual(2);
  });

  test('should only merge a cell once per move', async () => {
    game.start();
    game.board.updateBoard([
      [2, 2, 2, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]);

    game.movementManager.move({ i: 0, j: 1 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const data = game.board.data;
    const notEmptyCellCount = data.reduce((acc, row) => {
      return acc + row.filter(cell => cell > 0).length;
    }, 0);
    expect(notEmptyCellCount).toEqual(3); //2 merged + 1 added
  });

  test('should generate a new tile after moving', async () => {
    game.start();
    game.board.updateBoard([
      [0, 0, 0, 2],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ]);

    game.movementManager.move({ i: 0, j: 1 });
    setTimeout(() => {
      const data = game.board.data;
      const notEmptyCellCount = data.reduce((acc, row) => {
        return acc + row.filter(cell => cell > 0).length;
      }, 0);

      console.log("Data ", data);
      expect(notEmptyCellCount).toEqual(2);
    }, 1000);

  });


  test('checks if the game is over', () => {
    game.start();
    game.board.updateBoard([
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2]
    ]);

    expect(game.isGameOver()).toBe(true);
  })

  

});
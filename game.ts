let Battleship = function () {

  const COLS = 10;
  const ROWS = 10;
  const SHIPS = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

  const FIELD_EMPTY = 0;
  const FIELD_SHIP = 1;
  const FIELD_MISS = 2;
  const FIELD_HIT = 3;

  const STAGE_PREPARATION = 0;
  const STAGE_GAME = 1;

  const ID_PLAYER = 0;
  const ID_CPU = 1;

  /* Player Board */
  let playerBoard: Array<any> = [];

  /* CPU Board */
  let cpuBoard = [];

  /* Counts ships to shoot down */
  let left = {
    [ID_CPU]: 0,
    [ID_PLAYER]: 0
  };

  /* Current game stage */
  let stage: number = 0;

  /* In preparation stage: buffor for current ship points */
  let playerCurrentShipPoints: Array<any> = [];

  /* In preparation stage: current index of SHIPS array */
  let playerCurrentShip : number = 0;

  /* Run after init */
  let gameReadyCallback = function () {};

  /* Run when all ships are on Player board */
  let gameStartCallback = function () {};

  /* Run after game over */
  let gameFinishCallback = function (player) {};



  function init() : void {
    //init empty boards for both players
    initBoards();
    //place CPU Ships
    placeCPUShips();
    //run onReady callback
    gameReadyCallback();
  }

  /* Create empty boards */
  function initBoards() : void {
    for (let i = 0; i < COLS; i++) {
      playerBoard[i] = [];
      cpuBoard[i] = [];
      for (let j = 0; j < ROWS; j++) {
        playerBoard[i][j] = FIELD_EMPTY;
        cpuBoard[i][j] = FIELD_EMPTY;
      }
    }
  }

  /* Place CPU ships on board */
  function placeCPUShips() : void {
    SHIPS.forEach(function (size) {
      placeCPUShip(size, cpuBoard);
      left[ID_PLAYER] += size;
      left[ID_CPU] += size;
    });
  }

  /* Place CPU ship on board */
  function placeCPUShip(size: number, board : Array<any>) : number {
    let col = getRandomInt(0, COLS - 1 - size);
    let row = getRandomInt(0, ROWS - 1);
    let currentShip : Array<any> = [];
    let revert : boolean = false;

    for (let i = 0; i < size; i++) {
      if (checkAvailability(col + i, row, currentShip, board) && inRow(col + i, row, currentShip)) {
        currentShip.push([col + i, row]);
      } else {
        revert = true;
        return placeCPUShip(size, board);
      }
    }

    /* If can't draw next point, revert whole ship */
    if (!revert) {
      currentShip.forEach(function (point) {
        board[point[0]][point[1]] = FIELD_SHIP;
      })
    }
  }

  /* Place playber ship from UI */
  function placePlayerShip(col, row) : void {
    if (checkAvailability(col, row, playerCurrentShipPoints, playerBoard) && inRow(col, row, playerCurrentShipPoints)) {
      playerBoard[col][row] = FIELD_SHIP;
      playerCurrentShipPoints.push([col, row]);
    }
    if (playerCurrentShipPoints.length >= SHIPS[playerCurrentShip]) {
      playerCurrentShip++;
      playerCurrentShipPoints = [];
      if (!SHIPS[playerCurrentShip]) gameStart();
    }
  }

  /* Check if position is available
  If has no ship around point returns true
  */
  function checkAvailability(col: number, row: number, currentShip : Array<any>, board : Array<any>): boolean {
    let neighbors = [];
    neighbors.push([col - 1, row - 1]);
    neighbors.push([col - 1, row]);
    neighbors.push([col - 1, row + 1]);
    neighbors.push([col, row - 1]);
    neighbors.push([col, row]);
    neighbors.push([col, row + 1]);
    neighbors.push([col + 1, row - 1]);
    neighbors.push([col + 1, row]);
    neighbors.push([col + 1, row + 1]);

    for (let i = 0; i < neighbors.length; i++) {
      let col = neighbors[i][0];
      let row = neighbors[i][1];
      if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
        if (!currentShip.length || !pointInArray(col, row, currentShip)) {
          if (board[col][row] != 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  /* Check if placed point is near previous */
  function inRow(col: number, row: number, ship: Array<any>): boolean {
    //if is first in current ship
    if (!ship.length) return true;

    return row == ship[0][1] &&
    (col == ship[0][0] - 1 ||
      col == ship[0][0] + 1 ||
      col == ship[ship.length - 1][0] + 1 ||
      col == ship[ship.length - 1][0] - 1);
    }

    /* Start game when all ships are on board */
    function gameStart() {
      stage = STAGE_GAME;
      gameStartCallback();
    }

    /* Try to shoot ship */
    function shoot(col, row, board, player) : number {
      let field = board[col][row];
      switch (field) {
        case FIELD_EMPTY:
        board[col][row] = FIELD_MISS;
        return FIELD_MISS;

        case FIELD_SHIP:
        board[col][row] = FIELD_HIT;
        left[player]--;

        if (left[ID_PLAYER] == 0) {
          finish(ID_PLAYER);
          return null;
        }
        if (left[ID_CPU] == 0) {
          finish(ID_CPU);
          return null;
        }

        return FIELD_HIT;

        default:
        //uncorrect shoot
        return null;
      }
    }

    /* Game over */
    function finish(player : number) : void {
      gameFinishCallback(player);
    }

    /* Player shoot */
    function playerShoot(col : number, row : number) : void {
      if (stage == STAGE_GAME) {
        let result = shoot(col, row, cpuBoard, ID_PLAYER);
        if (result == FIELD_MISS) {
          cpuShoot();
        }
      }
    }

    /* CPU shoot */
    function cpuShoot(): number {
      let col = getRandomInt(0, COLS - 1);
      let row = getRandomInt(0, ROWS - 1);

      let result = shoot(col, row, playerBoard, ID_CPU);

      while (result == null || result == FIELD_HIT) {
        result = cpuShoot();
      }

      return result;
    }

    function restart() : void {
      playerBoard = [];
      cpuBoard = [];
      stage = STAGE_PREPARATION;
      left = {
        [ID_CPU]: 0,
        [ID_PLAYER]: 0
      };
      playerCurrentShipPoints = [];
      playerCurrentShip = 0;
      init();
    }

    /* Check if ship position is in array */
    function pointInArray(col: number, row: number, arr: Array<any>): boolean {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i][0] == col && arr[i][1] == row) {
          return true;
        }
      }
      return false;
    }

    /* Generates random number */
    function getRandomInt(min, max) : number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /* DEV: print board in console */
    function printBoard(board : Array<any>) {
      for (let row = 0; row < ROWS; row++) {
        let rowString: string = "";
        for (let col = 0; col < COLS; col++) {
          rowString += board[col][row] + '  ';
        }
      }
    }

    return {
      COLS: COLS,
      ROWS: ROWS,
      SHIPS: SHIPS,
      STAGE_PREPARATION: STAGE_PREPARATION,
      STAGE_GAME: STAGE_GAME,
      FIELD_EMPTY: FIELD_EMPTY,
      FIELD_SHIP: FIELD_SHIP,
      FIELD_MISS: FIELD_MISS,
      FIELD_HIT: FIELD_HIT,
      ID_PLAYER: ID_PLAYER,
      ID_CPU: ID_CPU,
      stage: function() : number {return stage},
      cpuBoard: function() : Array<any> {return cpuBoard},
      playerBoard: function() : Array<any> {return playerBoard},
      playerLeft: function() : number {return  left[ID_PLAYER]},
      cpuLeft: function() : number {return  left[ID_CPU]},
      init: function() : void {
        init();
      },
      shoot: function(col : number,row : number) : void {
        playerShoot(col, row)
      },
      placeShip: function (col : number, row : number) : void {
        placePlayerShip(col, row);
      },
      onFinish: function (callback) : void {
        gameFinishCallback = callback;
      },
      onStart: function (callback) : void{
        gameStartCallback = callback;
      },
      onReady: function (callback) : void{
        gameReadyCallback = callback;
      },
      restart: function () : void {
        restart()
      },
      printBoard: function (board : Array<any>) : void{
        printBoard(board);
      },
      playerCurrentShip: function () : number {
        return playerCurrentShip;
      }
    }

  };

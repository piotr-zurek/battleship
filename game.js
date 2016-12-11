var Battleship = function () {
    var COLS = 10;
    var ROWS = 10;
    var SHIPS = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    var FIELD_EMPTY = 0;
    var FIELD_SHIP = 1;
    var FIELD_MISS = 2;
    var FIELD_HIT = 3;
    var STAGE_PREPARATION = 0;
    var STAGE_GAME = 1;
    var ID_PLAYER = 0;
    var ID_CPU = 1;
    /* Player Board */
    var playerBoard = [];
    /* CPU Board */
    var cpuBoard = [];
    /* Counts ships to shoot down */
    var left = (_a = {},
        _a[ID_CPU] = 0,
        _a[ID_PLAYER] = 0,
        _a);
    /* Current game stage */
    var stage = 0;
    /* In preparation stage: buffor for current ship points */
    var playerCurrentShipPoints = [];
    /* In preparation stage: current index of SHIPS array */
    var playerCurrentShip = 0;
    /* Run after init */
    var gameReadyCallback = function () { };
    /* Run when all ships are on Player board */
    var gameStartCallback = function () { };
    /* Run after game over */
    var gameFinishCallback = function (player) { };
    function init() {
        //init empty boards for both players
        initBoards();
        //place CPU Ships
        placeCPUShips();
        //run onReady callback
        gameReadyCallback();
    }
    /* Create empty boards */
    function initBoards() {
        for (var i = 0; i < COLS; i++) {
            playerBoard[i] = [];
            cpuBoard[i] = [];
            for (var j = 0; j < ROWS; j++) {
                playerBoard[i][j] = FIELD_EMPTY;
                cpuBoard[i][j] = FIELD_EMPTY;
            }
        }
    }
    /* Place CPU ships on board */
    function placeCPUShips() {
        SHIPS.forEach(function (size) {
            placeCPUShip(size, cpuBoard);
            left[ID_PLAYER] += size;
            left[ID_CPU] += size;
        });
    }
    /* Place CPU ship on board */
    function placeCPUShip(size, board) {
        var col = getRandomInt(0, COLS - 1 - size);
        var row = getRandomInt(0, ROWS - 1);
        var currentShip = [];
        var revert = false;
        for (var i = 0; i < size; i++) {
            if (checkAvailability(col + i, row, currentShip, board) && inRow(col + i, row, currentShip)) {
                currentShip.push([col + i, row]);
            }
            else {
                revert = true;
                return placeCPUShip(size, board);
            }
        }
        /* If can't draw next point, revert whole ship */
        if (!revert) {
            currentShip.forEach(function (point) {
                board[point[0]][point[1]] = FIELD_SHIP;
            });
        }
    }
    /* Place playber ship from UI */
    function placePlayerShip(col, row) {
        if (checkAvailability(col, row, playerCurrentShipPoints, playerBoard) && inRow(col, row, playerCurrentShipPoints)) {
            playerBoard[col][row] = FIELD_SHIP;
            playerCurrentShipPoints.push([col, row]);
        }
        if (playerCurrentShipPoints.length >= SHIPS[playerCurrentShip]) {
            playerCurrentShip++;
            playerCurrentShipPoints = [];
            if (!SHIPS[playerCurrentShip])
                gameStart();
        }
    }
    /* Check if position is available
    If has no ship around point returns true
    */
    function checkAvailability(col, row, currentShip, board) {
        var neighbors = [];
        neighbors.push([col - 1, row - 1]);
        neighbors.push([col - 1, row]);
        neighbors.push([col - 1, row + 1]);
        neighbors.push([col, row - 1]);
        neighbors.push([col, row]);
        neighbors.push([col, row + 1]);
        neighbors.push([col + 1, row - 1]);
        neighbors.push([col + 1, row]);
        neighbors.push([col + 1, row + 1]);
        for (var i = 0; i < neighbors.length; i++) {
            var col_1 = neighbors[i][0];
            var row_1 = neighbors[i][1];
            if (col_1 >= 0 && col_1 < COLS && row_1 >= 0 && row_1 < ROWS) {
                if (!currentShip.length || !pointInArray(col_1, row_1, currentShip)) {
                    if (board[col_1][row_1] != 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    /* Check if placed point is near previous */
    function inRow(col, row, ship) {
        //if is first in current ship
        if (!ship.length)
            return true;
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
    function shoot(col, row, board, player) {
        var field = board[col][row];
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
    function finish(player) {
        gameFinishCallback(player);
    }
    /* Player shoot */
    function playerShoot(col, row) {
        if (stage == STAGE_GAME) {
            var result = shoot(col, row, cpuBoard, ID_PLAYER);
            if (result == FIELD_MISS) {
                cpuShoot();
            }
        }
    }
    /* CPU shoot */
    function cpuShoot() {
        var col = getRandomInt(0, COLS - 1);
        var row = getRandomInt(0, ROWS - 1);
        var result = shoot(col, row, playerBoard, ID_CPU);
        while (result == null || result == FIELD_HIT) {
            result = cpuShoot();
        }
        return result;
    }
    function restart() {
        playerBoard = [];
        cpuBoard = [];
        stage = STAGE_PREPARATION;
        left = (_a = {},
            _a[ID_CPU] = 0,
            _a[ID_PLAYER] = 0,
            _a);
        playerCurrentShipPoints = [];
        playerCurrentShip = 0;
        init();
        var _a;
    }
    /* Check if ship position is in array */
    function pointInArray(col, row, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][0] == col && arr[i][1] == row) {
                return true;
            }
        }
        return false;
    }
    /* Generates random number */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /* DEV: print board in console */
    function printBoard(board) {
        for (var row = 0; row < ROWS; row++) {
            var rowString = "";
            for (var col = 0; col < COLS; col++) {
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
        stage: function () { return stage; },
        cpuBoard: function () { return cpuBoard; },
        playerBoard: function () { return playerBoard; },
        playerLeft: function () { return left[ID_PLAYER]; },
        cpuLeft: function () { return left[ID_CPU]; },
        init: function () {
            init();
        },
        shoot: function (col, row) {
            playerShoot(col, row);
        },
        placeShip: function (col, row) {
            placePlayerShip(col, row);
        },
        onFinish: function (callback) {
            gameFinishCallback = callback;
        },
        onStart: function (callback) {
            gameStartCallback = callback;
        },
        onReady: function (callback) {
            gameReadyCallback = callback;
        },
        restart: function () {
            restart();
        },
        printBoard: function (board) {
            printBoard(board);
        },
        playerCurrentShip: function () {
            return playerCurrentShip;
        }
    };
    var _a;
};

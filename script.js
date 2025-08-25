// console.log('Hello World!')
/*
    Requirements: 
    
    1. Store the gameboard as an array inside of a Gameboard object
    2. Your players are also going to be stored in objects 
        - main goal is to have as little global code as possible.
        - if you only need a single instance of something(e.g. the gameboard, the displayController etc.) then, wrap the factory inside an IIFE 
    3. Include a logic that checks for when the game is over 
        - check for all winning 3-in-a-rows and ties
    4. Once you have a working console game, create an object that will handle the display/DOM logic. 
        - Write a function that will rended the contents of the gameboard array to the webpage
    5. Write the functions that allow players to add marks to specific spot on the board by interacting with the appropriate DOM elements 
        - Don't forget the logic that keeps players from playing in spots that are already taken 
    6. Allow players to put in their names
        - include a button to start/restart the game 
        - and add a display element that shows the results upon game end. 



*/



// Game board
const Gameboard = () => {
    const rows = 3; 
    const columns = 3; 
    const board = [];

    for(let i = 0; i < rows; i++) {
        board[i] = [];
        for(let j = 0; j < columns; j++) {
            board[i].push(Cell())
        }
    }

    const getBoard = () => board; 

    console.log(board);

    const markCell = (column, row, player) => {
        const availableCells = board.filter((row) => row[column].getValue() === 0).map(row => row[column]);

        if(!availableCells.length) return;

        // const lowestRow = availableCells.length - 1;
        board[row][column].addToken(player);
    }

    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()));
        console.log(boardWithCellValues);
    }

    return { getBoard, markCell, printBoard };
}

// Cell
const Cell = () => {
    let value = 0; 

    const addToken = player => {
        value = player;
    }

    const getValue = () => value; 

    return { addToken, getValue };
}

// Game Controller
const GameController = (playerOneName = 'Player One', playerTwoName = 'Player Two', onGameEnd) => {
    const board = Gameboard();
    let moveCount = 0;

    const winPatterns = [
    // Rows
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    // Columns 
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    // Diagonals
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]]
]


    const players = [
        {
            name: playerOneName,
            token: 'O', 
            pattern : []
        }, 
        {
            name: playerTwoName,
            token: 'X',
            pattern: []
        }
    ];

    let activePlayer = players[0];

    const swithPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer; 

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`)
    }

    const playRound = (column, row) => {
        
        console.log(`${getActivePlayer().name} placed ${getActivePlayer().token} in column ${column}, row ${row}`);
        board.markCell(column, row, getActivePlayer().token)

        if(activePlayer === players[0]) {
            activePlayer.pattern.push([row, column]);
        } else if(activePlayer === players[1]) {
            activePlayer.pattern.push([row, column]);
        }
        
        moveCount++;

        // Determine the winner 
        const coordsMatch = (a, b) => a[0] === b[0] && a[1] === b[1];
        let winnerFound = false; 

        if(activePlayer.pattern.length >= 3) {
        for(let i = 0; i < winPatterns.length; i++) {
            const pattern = winPatterns[i];

            const isWinningPattern = pattern.every(coord => activePlayer.pattern.some(playerCoord => coordsMatch(coord, playerCoord)));
            
            if(isWinningPattern) {
                console.log(`${activePlayer.name} wins!`);
                if(onGameEnd) onGameEnd(`${activePlayer.name} wins!`);
                winnerFound = true;
                break;
            }
        }
        }


        console.log(players[0].pattern, players[1].pattern);

        if(!winnerFound) {
            if(moveCount === 9) {
                console.log(`It's a tie!`);
                if(onGameEnd) onGameEnd(`It's a tie!`);
                return true;
            }


            swithPlayerTurn();
            printNewRound();
        }

        return 'continue';
    }

    printNewRound();

    return { playRound, getActivePlayer, getBoard: board.getBoard };

}


const ScreenController = () => {

    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    let gameEnded = false;

    const handleGameEnd = message => {
        playerTurnDiv.textContent = message;
        gameEnded = true;
    }

    const game = GameController('Player One', 'Player Two', handleGameEnd);

    const updateScreen = (isGameEnd = false) => {
        boardDiv.textContent = '';

        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        if(!isGameEnd) playerTurnDiv.textContent = `${activePlayer.name}'s turn...`

        board.forEach((row, rowIndex) => {

            row.forEach((cell, index) => {
                const cellButton = document.createElement('button');
                cellButton.classList.add('cell');

                cellButton.dataset.column = index;
                cellButton.dataset.row = rowIndex;
                cellButton.textContent = cell.getValue();
                boardDiv.appendChild(cellButton);
            })
        })
    }

    const clickHandlerBoard = e => {

        if(gameEnded) return;

        const selectedColumn = parseInt(e.target.dataset.column); 
        const selectedRow = parseInt(e.target.dataset.row);

        console.log(selectedColumn, selectedRow)

        if(isNaN(selectedColumn) || isNaN(selectedRow)) return;
        

        const gameStatus = game.playRound(selectedColumn, selectedRow);
        
        if(gameStatus === 'continue') {
            updateScreen(false);
        } else {
            updateScreen(true);
        }
        
    }


    boardDiv.addEventListener('click', clickHandlerBoard);

    updateScreen();


}

ScreenController()

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

    const markCell = (row, column, player) => {
        if (board[row][column].getValue() !== 0) return false;
        board[row][column].addToken(player);
        return true;
    };

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
const GameController = (playerOneName = 'Player One', playerTwoName = 'Player Two', onGameEnd, onRoundEnd) => {
    let board = Gameboard();
    let moveCount = 0;

    // Score tracking 
    const gameState = {
        scores: { [playerOneName]: 0, [playerTwoName]: 0 },
        roundsPlayed: 0, 
        gameOver: false
    }

    // Win Patterns
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
    const getScores = () => gameState.scores;
    const getRoundsPlayed = () => gameState.roundsPlayed;

    const resetRound = () => {
        board = Gameboard();

        players[0].pattern = [];
        players[1].pattern = [];

        activePlayer = players[0];
        moveCount = 0; 
    }

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getActivePlayer = () => activePlayer; 

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`)
    }

    const playRound = (row, column) => {

        if(gameState.gameOver) return 'game_over';
        
        console.log(`${getActivePlayer().name} placed ${getActivePlayer().token} in column ${column}, row ${row}`);
        const success = board.markCell(row, column, getActivePlayer().token);

        if(!success) return 'invalid'

        activePlayer.pattern.push([row, column]);
        moveCount++;

        // Determine the winner 
        const coordsMatch = (a, b) => a[0] === b[0] && a[1] === b[1];
        const p1Score = gameState.scores[players[0].name];
        const p2Score = gameState.scores[players[1].name];


        if(activePlayer.pattern.length >= 3) {
            for(let i = 0; i < winPatterns.length; i++) {
                const pattern = winPatterns[i];
                const isWinningPattern = pattern.every(coord => activePlayer.pattern.some(playerCoord => coordsMatch(coord, playerCoord)));

                if(isWinningPattern) {
                    gameState.scores[activePlayer.name]++;
                    gameState.roundsPlayed++;

  
                    
                    console.log(`${activePlayer.name} wins this round`);
                    // console.log(`Score: ${players[0].name} ${p1Score}`);

                    // Display winner
                    if(gameState.scores[activePlayer.name] === 3) {
                        gameState.gameOver = true;
                        if(onGameEnd) onGameEnd(`${activePlayer.name} wins the game! Final score: ${gameState.scores[players[0].name]} - ${gameState.scores[players[1].name]}`);
                        return 'game_won';
                    } 
                    
                    // Draw 
                    if(gameState.roundsPlayed === 5 && p1Score === 2 && p2Score === 2) {
                        gameState.gameOver = true;
                        if(onGameEnd) onGameEnd(`Game ends in a draw! Final score: ${p1Score} - ${p2Score}`);
                        return 'game_draw';
                    }
                    
                    if(onRoundEnd) onRoundEnd(`${activePlayer.name} wins round ${gameState.roundsPlayed}! Score: ${p1Score} - ${p2Score}`); 
                    return 'round_won'
                }


            }
        }
                

        if(moveCount === 9) {
            gameState.roundsPlayed++;
            console.log('Round tied!');

            if(gameState.roundsPlayed === 5 && p1Score === 2 && p2Score === 2) {
                gameState.gameOver = true;
                if(onGameEnd) onGameEnd(`Game ends in a draw! Final score: ${p1Score} - ${p2Score}`);
                return 'game_draw';
            }


            if(onRoundEnd) onRoundEnd(`Round ${gameState.roundsPlayed} tied! Score: ${p1Score} - ${p2Score}`);
            return 'round_tied';
        }

        
        switchPlayerTurn();
        printNewRound();
        return 'continue';
    }



    const startNewRound = () => {
        if(!gameState.gameOver && gameState.roundsPlayed < 5) {
            resetRound();
            printNewRound();
            return true;
        }
        return false;
    }



    return {
        playRound, 
        switchPlayerTurn,
        getActivePlayer,
        getBoard: () => board.getBoard(),
        getScores,
        getRoundsPlayed,
        startNewRound, 
        isGameOver: () => gameState.gameOver
    }

}


const ScreenController = () => {

    const boardContainer = document.querySelector('.container');
    const playersContainer = document.querySelector('.players');
    const playerOne = document.querySelector('#player1');
    const playerTwo = document.querySelector('#player2');
    const submitPlayersBtn = document.querySelector('.submit-players');
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    const scoreDiv = document.querySelector('.score');
    const restarBtn = document.querySelector('.restart-game');
    let roundEnded = false;
    let gameEnded = false;
    let game;

    const handleGameEnd = message => {
        playerTurnDiv.textContent = message;
        updateScoreDisplay();
        gameEnded = true;
    }

   const handleRoundEnd = message => {
        playerTurnDiv.textContent = message;
        updateScoreDisplay();

        setTimeout(() => {
            game.startNewRound()
            roundEnded = false;
            updateScreen(false);
        }, 2000);
    };

    const getPlayerNames = () => {
        const playerOneName = playerOne.value || 'Player One';
        const playerTwoName = playerTwo.value || 'Player Two';
        return { playerOneName, playerTwoName };
    }



    const updateScoreDisplay = () => {
        const scores = game.getScores();
        scoreDiv.textContent = `Score: ${Object.keys(scores)[0]} ${scores[Object.keys(scores)[0]]} - ${Object.keys(scores)[1]} ${scores[Object.keys(scores)[1]]}`;

    }

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
                cellButton.textContent = cell.getValue() === 0 ? '' : cell.getValue();
                boardDiv.appendChild(cellButton);
            })
        })
    }

    const clickHandlerBoard = e => {

        if(gameEnded || roundEnded || game.isGameOver()) return;

        const selectedColumn = parseInt(e.target.dataset.column); 
        const selectedRow = parseInt(e.target.dataset.row);


        if(isNaN(selectedColumn) || isNaN(selectedRow)) return;
        

        const gameStatus = game.playRound(selectedRow, selectedColumn);
        
        if(gameStatus === 'continue') {
            updateScreen(false);
        } else {
            roundEnded = true;
            updateScreen(true);

            if(gameStatus === 'game_won') {
                restarBtn.style.display = 'block'
            }
        } 
        
    }

    const handleRestartGame = () => {
        const { playerOneName, playerTwoName } = getPlayerNames();
        game = GameController(playerOneName, playerTwoName, handleGameEnd, handleRoundEnd);
        gameEnded = false; 
        restarBtn.style.display = 'none';
        updateScreen();
        updateScoreDisplay();
        playerTurnDiv.textContent = `${game.getActivePlayer().name}'s turn...`
    }


    boardDiv.addEventListener('click', clickHandlerBoard);
    submitPlayersBtn.addEventListener('click', () => {
        playersContainer.style.display = 'none';
        boardContainer.style.display = 'block';
        const { playerOneName, playerTwoName } = getPlayerNames();
        game = GameController(playerOneName, playerTwoName, handleGameEnd, handleRoundEnd);
        gameEnded = false;
        updateScreen();
        updateScoreDisplay();
    });
    restarBtn.addEventListener('click', handleRestartGame)

}

ScreenController();


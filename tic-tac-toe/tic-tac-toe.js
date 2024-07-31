const GameBoard = (() => {
  let board = Array(9).fill(null);

  const getBoard = () => board;

  const makeMove = (index, player) => {
      if (board[index] === null) {
          board[index] = player;
          return true;
      }
      return false;
  };

  const reset = () => {
      board = Array(9).fill(null);
  };

  return { getBoard, makeMove, reset };
})();

const Player = (name, marker) => {
  return { name, marker };
};

const GameController = (() => {
  let player1;
  let player2;
  let currentPlayer;

  const initializePlayers = (name1, name2) => {
      player1 = Player(name1, "X");
      player2 = Player(name2, "O");
      currentPlayer = player1;
  };

  const switchPlayer = () => {
      currentPlayer = currentPlayer === player1 ? player2 : player1;
  };

  const getCurrentPlayer = () => currentPlayer;

  const checkWin = (board) => {
      const winPatterns = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
          [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
          [0, 4, 8], [2, 4, 6]             // Diagonals
      ];

      for (let pattern of winPatterns) {
          const [a, b, c] = pattern;
          if (board[a] && board[a] === board[b] && board[a] === board[c]) {
              return board[a];
          }
      }
      return null;
  };

  const checkTie = (board) => {
      return board.every(cell => cell !== null);
  };

  const playTurn = (index) => {
      if (GameBoard.makeMove(index, currentPlayer.marker)) {
          const board = GameBoard.getBoard();
          const winner = checkWin(board);
          if (winner) {
              return { status: 'win', winner: currentPlayer };
          } else if (checkTie(board)) {
              return { status: 'tie' };
          } else {
              switchPlayer();
              return { status: 'ongoing' };
          }
      }
      return { status: 'invalid' };
  };

  const reset = () => {
      GameBoard.reset();
      currentPlayer = player1;
  };

  return { initializePlayers, getCurrentPlayer, playTurn, reset };
})();

const DisplayController = (() => {
  let isGameActive = false;
  const boardElement = document.getElementById('board');
  const resultElement = document.getElementById('result');
  const startButton = document.getElementById('start-game');
  const player1Input = document.getElementById('player1');
  const player2Input = document.getElementById('player2');

  const renderBoard = () => {
      const board = GameBoard.getBoard();
      const cells = boardElement.getElementsByClassName('cell');
      for (let i = 0; i < cells.length; i++) {
          cells[i].textContent = board[i] || '';
      }
  };

  const announceWinner = (player) => {
      resultElement.textContent = `${player.name} (${player.marker}) wins!`;
  };

  const announceTie = () => {
      resultElement.textContent = "It's a tie!";
  };

  const clearResult = () => {
      resultElement.textContent = '';
  };

  const updateStartButton = (status) => {
    switch(status) {
        case 'playing':
            startButton.textContent = 'Playing';
            break;
        case 'restart':
            startButton.textContent = 'Restart?';
            break;
        default:
            startButton.textContent = 'Start Game';
    }
  };

  const bindCellEvents = () => {
    const cells = boardElement.getElementsByClassName('cell');
    for (let i = 0; i < cells.length; i++) {
        cells[i].addEventListener('click', () => {
            if (isGameActive) {
                const gameStatus = GameController.playTurn(i);
                handleGameStatus(gameStatus);
            }
        });
    }
  };

  const handleGameStatus = (gameStatus) => {
    renderBoard();
    switch (gameStatus.status) {
        case 'win':
            announceWinner(gameStatus.winner);
            updateStartButton('restart');
            isGameActive = false;
            break;
        case 'tie':
            announceTie();
            updateStartButton('restart');
            isGameActive = false;
            break;
        case 'invalid':
            alert("Invalid move! Try again.");
            break;
        case 'ongoing':
            updateStartButton('playing');
            break;
    }
  };

  const bindStartButtonEvent = () => {
    startButton.addEventListener('click', () => {
        const player1Name = player1Input.value || 'Player 1';
        const player2Name = player2Input.value || 'Player 2';
        GameController.initializePlayers(player1Name, player2Name);
        GameController.reset();
        renderBoard();
        clearResult();
        updateStartButton('playing');
        isGameActive = true;
    });
  };

  const initialize = () => {
      bindCellEvents();
      bindStartButtonEvent();
      updateStartButton('default');
      isGameActive = false;
  };

  return { initialize };
})();

// Initialize the game
DisplayController.initialize();
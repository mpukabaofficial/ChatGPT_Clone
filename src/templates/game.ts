import type { ToolConfig } from '../types/toolConfig';

export const ticTacToe: ToolConfig = {
  id: 'tic-tac-toe',
  type: 'game',
  title: 'Tic Tac Toe',
  description: 'Classic two-player game',
  sections: [
    {
      id: 'game',
      inputs: [
        {
          id: 'playerNames',
          type: 'text',
          label: 'Player Names (X, O)',
          defaultValue: 'Player 1, Player 2',
          helpText: 'Comma-separated player names',
        },
        {
          id: 'movePosition',
          type: 'number',
          label: 'Position (0-8)',
          defaultValue: 0,
          min: 0,
          max: 8,
          helpText: 'Top-left is 0, bottom-right is 8',
        },
      ],
      actions: [
        {
          id: 'newGame',
          label: 'New Game',
          type: 'primary',
          logic: `
// Initialize game state
results.board = Array(9).fill('');
results.currentPlayer = 'X';
results.winner = null;
results.gameOver = false;
results.moves = 0;

const names = (inputs.playerNames || 'Player 1, Player 2').split(',').map(n => n.trim());
results.playerX = names[0] || 'Player 1';
results.playerO = names[1] || 'Player 2';
results.message = results.playerX + "'s turn (X)";
`,
        },
        {
          id: 'makeMove',
          label: 'Make Move',
          type: 'secondary',
          logic: `
// Get current state
const board = results.board || Array(9).fill('');
const currentPlayer = results.currentPlayer || 'X';
const position = Number(inputs.movePosition);

// Validate move
if (results.gameOver) {
  results.message = 'Game is over! Start a new game.';
  return;
}

if (position < 0 || position > 8 || board[position]) {
  results.message = 'Invalid move! Try again.';
  return;
}

// Make move
board[position] = currentPlayer;
results.moves = (results.moves || 0) + 1;

// Check for winner
const winPatterns = [
  [0,1,2], [3,4,5], [6,7,8], // rows
  [0,3,6], [1,4,7], [2,5,8], // cols
  [0,4,8], [2,4,6]           // diagonals
];

for (const pattern of winPatterns) {
  const [a, b, c] = pattern;
  if (board[a] && board[a] === board[b] && board[a] === board[c]) {
    results.winner = currentPlayer;
    results.gameOver = true;
    const winnerName = currentPlayer === 'X' ? results.playerX : results.playerO;
    results.message = winnerName + ' wins!';
    results.board = board;
    return;
  }
}

// Check for draw
if (results.moves >= 9) {
  results.gameOver = true;
  results.message = "It's a draw!";
  results.board = board;
  return;
}

// Switch player
results.currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
const nextPlayer = results.currentPlayer === 'X' ? results.playerX : results.playerO;
results.message = nextPlayer + "'s turn (" + results.currentPlayer + ")";
results.board = board;
`,
        },
      ],
      outputs: [
        {
          id: 'board',
          type: 'grid',
          label: 'Game Board',
          gridSize: { rows: 3, cols: 3 },
        },
        {
          id: 'message',
          type: 'card',
          label: 'Game Status',
        },
        {
          id: 'moves',
          type: 'text',
          label: 'Moves Made',
        },
      ],
    },
  ],
  styling: {
    primaryColor: 'purple',
    layout: 'single',
  },
  gameConfig: {
    canvasWidth: 300,
    canvasHeight: 300,
    cellSize: 100,
    enableMouse: true,
  },
};

export const memoryGame: ToolConfig = {
  id: 'memory-game',
  type: 'game',
  title: 'Memory Match',
  description: 'Find matching pairs',
  sections: [
    {
      id: 'game',
      inputs: [
        {
          id: 'gridSize',
          type: 'select',
          label: 'Grid Size',
          defaultValue: 4,
          options: [
            { label: '2x2 (Easy)', value: 2 },
            { label: '4x4 (Medium)', value: 4 },
            { label: '6x6 (Hard)', value: 6 },
          ],
        },
        {
          id: 'cardPosition',
          type: 'number',
          label: 'Card Position',
          defaultValue: 0,
          min: 0,
          helpText: 'Click a card number to flip it',
        },
      ],
      actions: [
        {
          id: 'newGame',
          label: 'New Game',
          type: 'primary',
          logic: `
const size = Number(inputs.gridSize || 4);
const totalCards = size * size;
const pairs = totalCards / 2;

// Create pairs of numbers
const cards = [];
for (let i = 0; i < pairs; i++) {
  cards.push(i, i);
}

// Shuffle
for (let i = cards.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [cards[i], cards[j]] = [cards[j], cards[i]];
}

results.cards = cards;
results.revealed = Array(totalCards).fill(false);
results.matched = Array(totalCards).fill(false);
results.firstCard = null;
results.secondCard = null;
results.moves = 0;
results.matchesFound = 0;
results.totalPairs = pairs;
results.gridSize = size;
results.message = 'Click cards to find matching pairs!';
results.gameOver = false;
`,
        },
        {
          id: 'flipCard',
          label: 'Flip Card',
          type: 'secondary',
          logic: `
const position = Number(inputs.cardPosition);
const cards = results.cards || [];
const revealed = results.revealed || [];
const matched = results.matched || [];

if (results.gameOver || !cards.length) {
  results.message = 'Start a new game first!';
  return;
}

if (revealed[position] || matched[position]) {
  results.message = 'Card already revealed!';
  return;
}

// Reveal card
revealed[position] = true;

if (results.firstCard === null) {
  results.firstCard = position;
  results.message = 'Pick another card!';
} else if (results.secondCard === null) {
  results.secondCard = position;
  results.moves = (results.moves || 0) + 1;

  // Check for match
  if (cards[results.firstCard] === cards[results.secondCard]) {
    matched[results.firstCard] = true;
    matched[results.secondCard] = true;
    results.matchesFound = (results.matchesFound || 0) + 1;
    results.message = 'Match found! Moves: ' + results.moves;

    // Check if game is won
    if (results.matchesFound >= results.totalPairs) {
      results.gameOver = true;
      results.message = 'You won in ' + results.moves + ' moves!';
    }
  } else {
    results.message = 'No match. Try again!';
    // Cards will be hidden on next move
    setTimeout(() => {
      revealed[results.firstCard] = false;
      revealed[results.secondCard] = false;
    }, 1000);
  }

  results.firstCard = null;
  results.secondCard = null;
}

results.revealed = revealed;
results.matched = matched;
`,
        },
      ],
      outputs: [
        {
          id: 'cards',
          type: 'grid',
          label: 'Game Board',
        },
        {
          id: 'message',
          type: 'card',
          label: 'Status',
        },
        {
          id: 'moves',
          type: 'text',
          label: 'Moves',
        },
        {
          id: 'matchesFound',
          type: 'text',
          label: 'Pairs Found',
        },
      ],
    },
  ],
  styling: {
    primaryColor: 'blue',
    layout: 'single',
  },
};

export const numberGuessing: ToolConfig = {
  id: 'number-guessing',
  type: 'game',
  title: 'Number Guessing Game',
  description: 'Guess the secret number!',
  sections: [
    {
      id: 'game',
      inputs: [
        {
          id: 'maxNumber',
          type: 'number',
          label: 'Max Number',
          defaultValue: 100,
          min: 10,
          max: 1000,
        },
        {
          id: 'guess',
          type: 'number',
          label: 'Your Guess',
          placeholder: 'Enter a number',
        },
      ],
      actions: [
        {
          id: 'newGame',
          label: 'New Game',
          type: 'primary',
          logic: `
const max = Number(inputs.maxNumber || 100);
results.secretNumber = Math.floor(Math.random() * max) + 1;
results.guesses = [];
results.attempts = 0;
results.gameOver = false;
results.maxNumber = max;
results.message = 'Guess a number between 1 and ' + max + '!';
`,
        },
        {
          id: 'makeGuess',
          label: 'Submit Guess',
          type: 'secondary',
          logic: `
const guess = Number(inputs.guess);
const secret = results.secretNumber;

if (results.gameOver) {
  results.message = 'Game over! Start a new game.';
  return;
}

if (!guess || guess < 1 || guess > results.maxNumber) {
  results.message = 'Invalid guess! Enter a number between 1 and ' + results.maxNumber;
  return;
}

results.attempts = (results.attempts || 0) + 1;
results.guesses = [...(results.guesses || []), guess];

if (guess === secret) {
  results.gameOver = true;
  results.message = '🎉 Correct! You won in ' + results.attempts + ' attempts!';
  results.hint = 'The number was ' + secret;
} else if (guess < secret) {
  results.message = '📈 Too low! Try again.';
  results.hint = 'Higher than ' + guess;
} else {
  results.message = '📉 Too high! Try again.';
  results.hint = 'Lower than ' + guess;
}

results.guessHistory = results.guesses.map((g, i) =>
  'Attempt ' + (i + 1) + ': ' + g + (g === secret ? ' ✓' : g < secret ? ' ↑' : ' ↓')
).join('\\n');
`,
        },
      ],
      outputs: [
        {
          id: 'message',
          type: 'card',
          label: 'Result',
        },
        {
          id: 'hint',
          type: 'text',
          label: 'Hint',
        },
        {
          id: 'attempts',
          type: 'text',
          label: 'Attempts',
        },
        {
          id: 'guessHistory',
          type: 'code',
          label: 'Guess History',
        },
      ],
    },
  ],
  styling: {
    primaryColor: 'green',
    layout: 'single',
  },
};

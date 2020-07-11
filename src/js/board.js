const SQUARE_NORMAL = 'normal';
const SQUARE_SNAKE = 'snake';
const SQUARE_STOPPED_SNAKE = 'stoppedSnake';
const SQUARE_SPEED_UP_SNAKE = 'speedUpSnake';
const SQUARE_SPEED_DOWN_SNAKE = 'speedDownSnake';
const SQUARE_DROP_TAIL_SNAKE = 'dropTailSnake';
const SQUARE_GROWING = 'growing';
const SQUARE_STATES = [
  SQUARE_NORMAL,
  SQUARE_SNAKE,
  SQUARE_STOPPED_SNAKE,
  SQUARE_SPEED_UP_SNAKE,
  SQUARE_SPEED_DOWN_SNAKE,
  SQUARE_DROP_TAIL_SNAKE,
  SQUARE_GROWING,
];
const SQUARE_COLORS = {
  [SQUARE_NORMAL]: BOARD_COLOR,
  [SQUARE_SNAKE]: SNAKE_COLOR,
  [SQUARE_STOPPED_SNAKE]: STOPPED_SNAKE_COLOR,
  [SQUARE_SPEED_UP_SNAKE]: SPEED_UP_SNAKE_COLOR,
  [SQUARE_SPEED_DOWN_SNAKE]: SPEED_DOWN_SNAKE_COLOR,
  [SQUARE_DROP_TAIL_SNAKE]: DROP_TAIL_SNAKE_COLOR,
  [SQUARE_GROWING]: GROWING_COLOR,
};


function getSquareSign(x, y) {
  return `${x}|${y}`;
}


class Square {

  constructor(x, y, l, board) {
    this.x = x;
    this.y = y;
    this.l = l;
    this.width = x * l;
    this.height = y * l;
    this.state = null;
    this.board = board;
    this.setState(SQUARE_NORMAL);
  }

  [Symbol.toPrimitive]() {
    return getSquareSign(this.x, this.y);
  }

  get up() {
    return this.getNeighbor(this.x, this.y - 1);
  }

  get right() {
    return this.getNeighbor(this.x + 1, this.y);
  }

  get down() {
    return this.getNeighbor(this.x, this.y + 1);
  }

  get left() {
    return this.getNeighbor(this.x - 1, this.y);
  }

  getNeighbor(x, y) {
    if (!this.board.squares.isLegal(x, y)) {
      return null;
    }
    return this.board.squares.getFromCoords(x, y);
  }

  fill(color) {
    this.board.ctx.fillStyle = color;
    this.board.ctx.fillRect(1 + this.width, 1 + this.height, this.l - 2, this.l - 2);
  }

  setState(state) {
    if (!SQUARE_STATES.includes(state)) {
      throw Error(`"${state} is not correct square state. Try one of [${SQUARE_STATES}]"`);
    }
    this.fill(SQUARE_COLORS[state]);
    this.state = state;
  }
}


class BoardSquares {

  constructor(maxX, maxY, squareL, board) {
    this.maxX = maxX;
    this.maxY = maxY;
    this.squareL = squareL;
    this.board = board;
  }

  init() {
    this.items = [];
    for (let x = 0; x < this.maxX; x++) {
      for (let y = 0; y < this.maxY; y++) {
        let square = new Square(x, y, this.squareL, this.board);
        this[square] = square;
        this.items.push(square);
      }
    }
  }

  isLegal(x, y) {
    return 0 <= x && x < this.maxX && 0 <= y && y < this.maxY;
  }

  getFromCoords(x, y) {
    return this[getSquareSign(x, y)];
  }

  getRandom(excludeSquares=null) {
    excludeSquares = excludeSquares || [];
    let items = this.items.filter(s => !excludeSquares.includes(s));
    return items[Math.floor(Math.random() * items.length)];
  }
}


class Cover {
  constructor(board) {
    this.cover = document.getElementById("cover");
    this.cover.style.top = `${board.canvas.offsetTop}px`;
    this.cover.style.left = `${board.canvas.offsetLeft}px`;
    this.cover.style.width = `${board.width}px`;
    this.cover.style.height = `${board.height}px`;

    let inner = document.createElement("div");
    inner.style.padding = `${board.height / 2 - 10}px 0px`;
    this.cover.appendChild(inner);

    this.span = document.createElement("span");
    this.span.setAttribute('id', 'cover-text');
    inner.appendChild(this.span);
  }

  activate(text) {
    this.cover.classList.add('cover-activated');
    this.span.innerHTML = text;
  }

  deactivate() {
    this.cover.classList.remove('cover-activated');
    this.span.innerHTML = '';
  }
}


class Board {
  constructor(maxX, maxY, squareL) {
    this.width = maxX * squareL;
    this.height = maxY * squareL;

    this.canvas = document.getElementById("canvas");
    this.canvas.setAttribute('width', `${this.width}px`);
    this.canvas.setAttribute('height', `${this.height}px`);

    this.ctx = this.canvas.getContext("2d");

    this.squares = new BoardSquares(maxX, maxY, squareL, this);
    this.cover = new Cover(this);
  }

  init() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.squares.init();
    this.speedUpSquare = null;
    this.speedDownSquare = null;
    this.dropTailSquare = null;
    this.toDropTail = DROP_TAIL_PERIODICITY;
  }

  addThings(occupiedSquares) {
    if (this.speedUpSquare && this.speedUpSquare.state == SQUARE_SPEED_UP_SNAKE) {
      this.speedUpSquare.setState(SQUARE_NORMAL);
    }
    if (this.speedDownSquare && this.speedDownSquare.state == SQUARE_SPEED_DOWN_SNAKE) {
      this.speedDownSquare.setState(SQUARE_NORMAL);
    }
    if (this.dropTailSquare && this.dropTailSquare.state == SQUARE_DROP_TAIL_SNAKE) {
      this.dropTailSquare.setState(SQUARE_NORMAL);
    }

    let square = this.squares.getRandom(occupiedSquares);
    square.setState(SQUARE_GROWING);
    occupiedSquares.push(square);

    this.speedUpSquare = this.squares.getRandom(occupiedSquares);
    this.speedUpSquare.setState(SQUARE_SPEED_UP_SNAKE);
    occupiedSquares.push(this.speedUpSquare);

    this.speedDownSquare = this.squares.getRandom(occupiedSquares);
    this.speedDownSquare.setState(SQUARE_SPEED_DOWN_SNAKE);

    if (this.toDropTail == 0) {
      occupiedSquares.push(this.speedUpSquare);
      this.dropTailSquare = this.squares.getRandom(occupiedSquares);
      this.dropTailSquare.setState(SQUARE_DROP_TAIL_SNAKE);
      this.toDropTail = DROP_TAIL_PERIODICITY;
    } else {
      this.toDropTail--;
    }
  }
}

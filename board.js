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
    this.board = board;
    this.fill(BOARD_COLOR);
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
}


class BoardSquares {

  constructor(maxX, maxY, squareL, board) {
    this.maxX = maxX;
    this.maxY = maxY;

    for (let x = 0; x < maxX; x++) {
      for (let y = 0; y < maxY; y++) {
        let square = new Square(x, y, squareL, board);
        this[square] = square;
      }
    }
  }

  isLegal(x, y) {
    return 0 <= x && x < this.maxX && 0 <= y && y < this.maxY;
  }

  getFromCoords(x, y) {
    return this[getSquareSign(x, y)];
  }
}


class Board {
  constructor(maxX, maxY, squareL) {
    this.width = maxX * squareL;
    this.height = maxY * squareL;

    let canvas = document.getElementById("canvas");
    canvas.setAttribute('width', `${this.width}px`);
    canvas.setAttribute('height', `${this.height}px`);

    this.ctx = canvas.getContext("2d");
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.squares = new BoardSquares(maxX, maxY, squareL, this);
  }
}

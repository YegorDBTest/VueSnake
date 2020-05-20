class SnakeDirection {

  constructor(direction) {
    this.current = direction;
  }

  get change() {
    return this[this.current];
  }

  get up() {
    return {x: 0, y: -1};
  }

  get right() {
    return {x: 1, y: 0};
  }

  get down() {
    return {x: 0, y: 1};
  }

  get left() {
    return {x: -1, y: 0};
  }
}


class SnakeSquares {

  constructor(squares) {
    this.items = squares;
    this[Symbol.iterator] = function* () {
      for (let item of this.items) {
        yield item;
      }
    };
  }

  includes(square) {
    return this.items.filter(s => s.x == square.x && s.y == square.y).length > 0;
  }

  get head() {
    return this.items[0];
  }

  get tail() {
    return this.items[this.items.length - 1];
  }

  addFirst(square) {
    this.items.unshift(square);
  }

  removeLast() {
    this.items.splice(-1);
  }
}


class Snake {

  constructor(squares, direction, board) {
    this.squares = new SnakeSquares(squares);
    this.direction = new SnakeDirection(direction);
    this.board = board;
    this.stopped = false;
    this.putOnBoard();
    this.start();
  }

  move() {
    let newHead = new Square(this.head.x + this.direction.change.x, this.head.y + this.direction.change.y);
    
    if (!this.board.checkSquareLegal(newHead)) {
      this.stop();
      return;
    }

    this.squares.unshift(newHead);
    this.board.fillSquare(this.head, SNAKE_COLOR);
    this.board.fillSquare(this.tail, BOARD_COLOR);
    this.squares.splice(-1);
  }

  draw(color) {
    for (let square of this.squares) {
      this.board.fillSquare(square, color);
    }
  }

  putOnBoard() {
    this.draw(SNAKE_COLOR);
  }

  stop() {
    this.stopped = true;
    this.draw(STOPPED_SNAKE_COLOR);
  }

  start() {
    let intervalId = setInterval(
      () => {
        if (this.stopped) {
          clearInterval(intervalId);
        } else {
          this.move();
        }
      },
      1000
    );
  }
}

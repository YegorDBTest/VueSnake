const directionsByNumber = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
};
const oppositeDirections = {
  'up': 'down',
  'right': 'left',
  'down': 'up',
  'left': 'right',
}


class SnakeDirection {

  constructor(direction) {
    this.current = direction;
    this.last = direction;
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

  setLastByCurent() {
    this.last = this.current;
  }

  setCurrent(directionNumber) {
    let newDirection = directionsByNumber[directionNumber];
    if (newDirection && oppositeDirections[this.last] != newDirection) {
      this.current = newDirection;
    }
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
    this.setDirectionChangeEvents();
    this.start();
  }

  move() {
    let newHeadX = this.squares.head.x + this.direction.change.x;
    let newHeadY = this.squares.head.y + this.direction.change.y;
    let newHead = new Square(newHeadX, newHeadY);
    
    if (!this.board.checkSquareLegal(newHead) || this.squares.includes(newHead)) {
      this.stop();
      return;
    }

    this.squares.addFirst(newHead);
    this.board.fillSquare(this.squares.head, SNAKE_COLOR);
    this.board.fillSquare(this.squares.tail, BOARD_COLOR);
    this.squares.removeLast();
    this.direction.setLastByCurent();
  }

  draw(color) {
    for (let square of this.squares) {
      this.board.fillSquare(square, color);
    }
  }

  putOnBoard() {
    this.draw(SNAKE_COLOR);
  }

  setDirectionChangeEvents() {
    document.addEventListener('keydown', (e) => {
      this.direction.setCurrent(e.keyCode);
    });
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

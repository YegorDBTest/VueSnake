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
  }

  *[Symbol.iterator]() {
    for (let item of this.items) {
      yield item;
    }
  }

  includes(square) {
    return this.items.slice(0, -1).filter(s => s.x == square.x && s.y == square.y).length > 0;
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

  constructor(squaresCoords, direction, board) {
    let squares = [];
    for (let squareCoords of squaresCoords) {
      squares.push(board.squares.getFromCoords(...squareCoords))
    }
    this.squares = new SnakeSquares(squares);
    this.direction = new SnakeDirection(direction);
    this.board = board;
    this.stopped = false;
    this.putOnBoard();
    this.setDirectionChangeEvents();
    this.start();
  }

  move() {
    let newHead = this.squares.head[this.direction.current];
    if (!newHead || this.squares.includes(newHead)) {
      this.stop();
      return;
    }

    let newHeadState = newHead.state;

    this.squares.addFirst(newHead);
    if (newHeadState != SQUARE_GROWING) {
      this.squares.tail.setState(SQUARE_NORMAL);
      this.squares.removeLast();
    }
    this.squares.head.setState(SQUARE_SNAKE);
    this.direction.setLastByCurent();

    if (newHeadState != SQUARE_NORMAL) {
      this.board.addThing(newHeadState, this.squares.items);
    }
  }

  draw(squareState) {
    for (let square of this.squares) {
      square.setState(squareState);
    }
  }

  putOnBoard() {
    this.draw(SQUARE_SNAKE);
    this.board.addThing(SQUARE_GROWING, this.squares.items);
  }

  setDirectionChangeEvents() {
    document.addEventListener('keydown', (e) => {
      this.direction.setCurrent(e.keyCode);
    });
  }

  stop() {
    this.stopped = true;
    this.draw(SQUARE_STOPPED_SNAKE);
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
      // 1000
      500
    );
  }
}

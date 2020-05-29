const SNAKE_NORMAL_SPEED_FACTOR = 1;
const SNAKE_SPEED_UP_FACTOR = 2;
const SNAKE_SPEED_DOWN_FACTOR = 0.5;

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
    this.state = SQUARE_SNAKE;
    this.squares = new SnakeSquares(squares);
    this.direction = new SnakeDirection(direction);
    this.board = board;
    this.points = 0;
    this.speed = 1;
    this.speedFactor = SNAKE_NORMAL_SPEED_FACTOR;
    this.intervalId = null;
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
    this.squares.head.setState(this.state);
    this.direction.setLastByCurent();

    if (newHeadState == SQUARE_GROWING) {
      this.board.addThings(this.squares.items.slice());
      this.points += 100;
      console.log(this.points);
      this.changeSpeedFactor(SNAKE_NORMAL_SPEED_FACTOR);
      this.changeState(SQUARE_SNAKE);
    } else if (newHeadState == SQUARE_SPEED_UP_SNAKE) {
      this.changeSpeedFactor(SNAKE_SPEED_UP_FACTOR);
      this.changeState(SQUARE_SPEED_UP_SNAKE);
    } else if (newHeadState == SQUARE_SPEED_DOWN_SNAKE) {
      this.changeSpeedFactor(SNAKE_SPEED_DOWN_FACTOR);
      this.changeState(SQUARE_SPEED_DOWN_SNAKE);
    }
  }

  draw() {
    for (let square of this.squares) {
      square.setState(this.state);
    }
  }

  putOnBoard() {
    this.draw();
    this.board.addThings(this.squares.items.slice());
  }

  setDirectionChangeEvents() {
    document.addEventListener('keydown', (e) => {
      this.direction.setCurrent(e.keyCode);
    });
  }

  changeState(state) {
    this.state = state;
    this.draw();
  }

  changeSpeedFactor(factor) {
    this.pause();
    this.speedFactor = factor;
    this.start();
  }

  pause() {
    clearInterval(this.intervalId);
  }

  stop() {
    clearInterval(this.intervalId);
    this.changeState(SQUARE_STOPPED_SNAKE);
  }

  start() {
    this.intervalId = setInterval(
      () => {this.move();},
      500 / (this.speed * this.speedFactor)
    );
  }
}

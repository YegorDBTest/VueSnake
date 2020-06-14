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

  dropTail() {
    let dropped = this.items.splice(3, this.items.length - 3);
    for (let square of dropped) {
      square.setState(SQUARE_NORMAL);
    }
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
    this._data = new Vue({
      el: '#data-panel',
      data: {
        points: 0,
        speed: 10,
      },
    });
    this._buttons = new Vue({
      el: '#buttons-panel',
      data: {
        snake: this,
        paused: false,
        pausePlayName: 'Pause',
      },
      methods: {
        pausePlayAction: function() {
          if (this.paused) {
            this.snake.start();
            this.paused = false;
            this.pausePlayName = 'Pause';
          } else {
            this.snake.pause();
            this.paused = true;
            this.pausePlayName = 'Play';
          }
        },
      }
    });
    this.intervalId = null;
    this.putOnBoard();
    this.setDirectionChangeEvents();
    this.start();
  }

  get speed() {
    return this._data.speed;
  }

  set speed(value) {
    this._data.speed = value;
  }

  get points() {
    return this._data.points;
  }

  set points(value) {
    this._data.points = value;
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
      this.points += 10 * this.speed;
    } else if (newHeadState == SQUARE_SPEED_UP_SNAKE) {
      this.changeSpeed(1);
    } else if (newHeadState == SQUARE_SPEED_DOWN_SNAKE) {
      this.changeSpeed(-1);
    } else if (newHeadState == SQUARE_DROP_TAIL_SNAKE) {
      this.squares.dropTail();
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
      if (e.keyCode >= 37 && e.keyCode <= 40) {
        this.direction.setCurrent(e.keyCode);
      } else if (e.keyCode == 80) {
        this._buttons.pausePlayAction();
      }
    });
  }

  changeState(state) {
    this.state = state;
    this.draw();
  }

  changeSpeed(delta) {
    this.pause();
    this.speed += delta;
    if (this.speed < 1) {
      this.stop();
      return;
    } else if (this.speed > 100) {
      this.speed = 100;
    }
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
      5000 / this.speed
    );
  }
}

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
    this.started = false;
    this.ended = false;
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
          if (!this.snake.started || this.snake.ended) return;
          if (this.paused) {
            this.snake.start();
            this.paused = false;
            this.pausePlayName = 'Pause';
            this.snake.board.cover.deactivate();
          } else {
            this.snake.pause();
            this.paused = true;
            this.pausePlayName = 'Play';
            this.snake.board.cover.activate('Pause');
          }
        },
      }
    });
    this._levels = new Vue({
      el: '#levels-panel',
      data: {
        get itemsKeys() {
          return Object.keys(this.items);
        },
        get speedFactor() {
          return this.items[this.current].speedFactor;
        },
        items: {
          easy: {
            speedFactor: 0.5,
          },
          normal: {
            speedFactor: 1,
          },
          hard: {
            speedFactor: 1.5,
          },
          impossible: {
            speedFactor:2,
          },
        },
        current: 'easy',
      },
    });
    this.intervalId = null;
    this.putOnBoard();
    this.setDirectionChangeEvents();
    this.board.cover.activate('Press Enter to start');
  }

  get speed() {
    return this._data.speed;
  }

  set speed(value) {
    this._data.speed = value;
  }

  get speedFactor() {
    return this._levels.speedFactor;
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
      this.points += 10 * this.speed * this.speedFactor;
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
      } else if (!this.started && e.keyCode == 13) {
        this.start();
        this.started = true;
        this.board.cover.deactivate();
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
    this.ended = true;
    this.changeState(SQUARE_STOPPED_SNAKE);
    this.board.cover.activate('Game over');
  }

  start() {
    this.intervalId = setInterval(
      () => {this.move();},
      5000 / (1 + (this.speed - 1) * this.speedFactor)
    );
  }
}

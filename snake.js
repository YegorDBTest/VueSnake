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
    this.initSquaresCoords = squaresCoords;
    this.initDirection = direction;
    this.board = board;
    this._points = new Vue({
      el: '#points-panel',
      data: {
        value: 0,
      },
    });
    this._data = new Vue({
      el: '#data-panel',
      data: {
        goods: 0,
        speed: 10,
        room: 1,
      },
    });
    this._buttons = new Vue({
      el: '#buttons-panel',
      data: {
        snake: this,
        paused: false,
        pausePlayName: 'Start',
      },
      methods: {
        pausePlayAction: function() {
          if (!this.snake.started) {
            this.snake.start();
          } else if (this.snake.ended) {
            this.snake.init();
          } else if (this.paused) {
            this.snake.start();
            this.paused = false;
          } else {
            this.snake.pause();
            this.paused = true;
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
        snake: this,
        items: {
          1: {
            speedFactor: 0.5,
          },
          2: {
            speedFactor: 1,
          },
          3: {
            speedFactor: 1.5,
          },
          4: {
            speedFactor:2,
          },
        },
        current: 1,
      },
      methods: {
        setCurrent(key) {
          if (this.snake.started || !this.itemsKeys.includes(key)) {
            return;
          }
          this.current = key;
        },
      },
    });
    this.setDirectionChangeEvents();
    this.init();
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

  get goods() {
    return this._data.goods;
  }

  set goods(value) {
    this._data.goods = value;
    this._points.value = (this.speedFactor * this.goods * this.speed / this.room).toFixed(0);
  }

  get room() {
    return this._data.room;
  }

  set room(value) {
    this._data.room = value;
  }

  init() {
    this.board.init();
    let squares = [];
    for (let squareCoords of this.initSquaresCoords) {
      squares.push(this.board.squares.getFromCoords(...squareCoords))
    }
    this.started = false;
    this.ended = false;
    this.state = SQUARE_SNAKE;
    this.squares = new SnakeSquares(squares);
    this.direction = new SnakeDirection(this.initDirection);
    this._data.goods = 0;
    this._data.speed = 10;
    this._data.room = 1;
    this._points.value = 0;
    this._buttons.paused = false;
    this._buttons.pausePlayName = 'Start';
    this.intervalId = null;
    this.putOnBoard();
    this.board.cover.activate('Press Space to start');
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
      this.goods += 10 * this.speed * this.speedFactor;
      this.room += 1;
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
      } else if (e.keyCode == 32) {
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
    this.board.cover.activate('Pause');
    this._buttons.pausePlayName = 'Play';
  }

  stop() {
    clearInterval(this.intervalId);
    this.ended = true;
    this.changeState(SQUARE_STOPPED_SNAKE);
    this.board.cover.activate('Game over.');
    this._buttons.pausePlayName = 'Reset';
  }

  start() {
    this.intervalId = setInterval(
      () => {this.move();},
      5000 / (1 + (this.speed - 1) * this.speedFactor)
    );
    this.started = true;
    this.ended = false;
    this.board.cover.deactivate();
    this._buttons.pausePlayName = 'Pause';
  }
}

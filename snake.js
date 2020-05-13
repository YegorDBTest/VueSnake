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


class Snake {

  constructor(squares, direction, board) {
    this.squares = squares;
    this.direction = new SnakeDirection(direction);
    this.board = board;
    this.stopped = false;
    this.putOnBoard();
    this.start();
  }

  get head() {
    return this.squares[0];
  }

  get tail() {
    return this.squares[this.squares.length - 1];
  }

  move() {
    let newHead = new Square(this.head.x + this.direction.change.x, this.head.y + this.direction.change.y);
    
    if (!this.board.checkSquareLegal(newHead)) {
      this.stopped = true;
      return;
    }

    this.squares.unshift(newHead);
    this.board.fillSquare(this.head, 'black');
    this.board.fillSquare(this.tail, '#ccc');
    this.squares.splice(-1);
  }

  putOnBoard() {
    for (let square of this.squares) {
      this.board.fillSquare(square, 'black');
    }
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

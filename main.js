var board = new Board(40, 20);

let snakeSquares = [
  new Square(5, 10),
  new Square(5, 11),
  new Square(5, 12)
];
var snake = new Snake(snakeSquares, 'right', board);

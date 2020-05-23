var board = new Board(40, 20);

let snakeSquares = [
  new Square(5, 10),
  new Square(5, 11),
  new Square(5, 12),
  new Square(5, 13),
  new Square(5, 14)
];
var snake = new Snake(snakeSquares, 'up', board);

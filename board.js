class Square {

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}


class Board {
  constructor(lx, ly) {
    this.squareL = 20;

    this.lx = lx;
    this.ly = ly;

    this.width = lx * this.squareL;
    this.height = ly * this.squareL;

    let canvas = document.getElementById("canvas");
    canvas.setAttribute('width', `${this.width}px`);
    canvas.setAttribute('height', `${this.height}px`);

    this.ctx = canvas.getContext("2d");
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (let x = 0; x < this.lx; x++) {
      for (let y = 0; y < this.ly; y++) {
        this.fillSquare(new Square(x, y), BOARD_COLOR);
      }
    }
  }

  checkSquareLegal(square) {
    return (
      0 <= square.x
    &&
      square.x < this.lx
    &&
      0 <= square.y
    &&
      square.y < this.ly
    );
  }

  fillSquare(square, color) {
    if (!this.checkSquareLegal(square)) {
      throw Error(`[${square.x}, ${square.y}] is illegal square.`);
    }

    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      1 + this.squareL * square.x,
      1 + this.squareL * square.y,
      this.squareL - 2,
      this.squareL - 2
    );
  }
}

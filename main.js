var board = new Board(10, 10, 30);
var snake = new Snake([[5, 7] ,[5, 8] ,[5, 9]], 'up', board);
var hints = new Hints([
  'Use arrows to change snake moving direction.',
  'Get green squares to gain points, increase snake tail and go to next room.',
  'Get red squares to increase speed and points gain.',
  'Get blue squares to decrease speed and points gain.',
  'Get violet squares to cut tail off.',
  'Use space to pause/start game.',
]);

const canvas = document.getElementById('chess-board');
const ctx = canvas.getContext('2d');

const platform = detectDevice();

canvas.width = platform === 'Mobile' ? window.innerWidth*0.95 : window.innerWidth*0.4;
canvas.height = canvas.width;
const SIZE = canvas.width/8;

const redoBtn = document.getElementById('redo');
const playBtn = document.getElementById('play');
const mateDiv = document.getElementById("checkmate-message");
const waitEl = document.getElementById('waiting-message');

//timer
const duration = 3*60; // 3 minutes
const playerTimer = new Timer(duration,document.getElementById('player-timer'));
const opponentTimer = new Timer(duration,document.getElementById('opponent-timer'));

let clicked = false;
let mate = false;
let board = new Board(canvas);
let PLAYER = null;
let socket = null;

window.onload = ()=>{

  socket = io(window.location.origin);
  
  socket.on('connect', function() {
    console.log('Connected to the server');
  });

  socket.on("wait", () => {
    waitEl.style.display = 'flex';
    console.log('waiting for the second player');
  });

  socket.on("start", ({color}) => {
    waitEl.style.display = 'none';
    PLAYER = color;
    if(color==='black'){
      board.grid = board.flip();
    }
    console.log('start the game',color);
  });

  socket.on("opponent quit", () => {
    console.log('opponent quit');
    document.getElementById('result').innerText =  `Opponent left the game\n${PLAYER} Won!!`
    mateDiv.style.display = 'flex';
    PLAYER = null;
  });

  socket.on("move", (data) => {
    playerTimer.start();
    opponentTimer.pause();
    board.oponentMove(data);
  });

  socket.on("opponent_castle", (data) => {
    board.oponentCastle(data);
  });

  socket.on("cancelWait", (data) => {
    console.log(data);
  });

  animate()
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  board.draw(ctx);

  if(mate){
    const winner = board.player==='white' ? 'Black' : 'White'
    showResult(winner,'Won by Checkmate');
    return;
  }

  if(playerTimer.time<=0){
    const winner = PLAYER==='white' ? 'Black' : 'White'
    showResult(winner,'Won by Time');
    return;
  }
  if(opponentTimer.time<=0){
    const winner = PLAYER;
    showResult(winner,'Won by Time');
    return;
  }
  
  requestAnimationFrame(animate);
}

function play(){
  if(PLAYER) return;
  mateDiv.style.display = 'none';
  board = new Board(canvas);
  playBtn.style.display = 'none';
  socket.emit("play");
}

function cancelWait(){
  waitEl.style.display = 'none';
  playBtn.style.display = 'block';
  socket.emit("cancelWait");
}

function restart(){
  mate = false;
  board.restart();
  mateDiv.style.display = 'none';
  animate()
}

function showResult(winner,text){
  document.getElementById('result').innerText =  `${winner} ${text}!!!`
  mateDiv.style.display = 'flex';
  PLAYER = null;
}

function undo(){
  const {history,grid} = board;
  if(history.moves.length===0 || history.offset===history.moves.length) return;
  
  const currElement = history.moves.length-1-history.offset;
  const currMove = history.moves[currElement];
  const {to,from,capturedPiece,checkedKing} = currMove;

  const movedPiece = grid[to.row][to.col];
  grid[to.row][to.col] = '';
  movedPiece.pos = {...from};
  movedPiece.oldPos = {...from};
  grid[from.row][from.col] = movedPiece;

  redoBtn.disabled = false;

  if(capturedPiece){
    capturedPiece.pos = {...to};
    capturedPiece.old = {...to};
    grid[to.row][to.col] = capturedPiece;
  }

  if(checkedKing){
    checkedKing.checked = true;
  }else if(history.moves[currElement+1]?.checkedKing){
    history.moves[currElement+1].checkedKing.checked  = false;
  }

  history.offset++;
}

function redo(){
  const {history,grid} = board;
  if(history.offset===0) return;

  const currElement = history.moves.length-history.offset;
  const currMove = history.moves[currElement];
  const {to,from,checkedKing} = currMove;

  const movedPiece = grid[from.row][from.col];
  grid[from.row][from.col] = '';
  movedPiece.pos = {...to};
  movedPiece.oldPos = {...to};
  grid[to.row][to.col] = movedPiece;

  if(checkedKing){
      checkedKing.checked = false;
  }else if(history.moves[currElement+1]?.checkedKing){
      history.moves[currElement+1].checkedKing.checked  = true;
  }

  history.offset--;
  if(history.offset===0) redoBtn.disabled = true;
}

function detectDevice() {
  const userAgent = navigator.userAgent;
  if (/Android|webOS|iPhone|iPad|iPod/i.test(userAgent)) {
    return 'Mobile';
  } else {
    return 'Desktop';
  }
}

function getTouchPos(canvas,e){
  const rect = canvas.getBoundingClientRect();
  const touch = e.changedTouches[0];
  const x = touch.clientX-rect.left;
  const y = touch.clientY-rect.top;

  return {x,y}
}

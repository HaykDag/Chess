

const platform = detectDevice();

const redoBtn = document.getElementById('redo');
const playBtn = document.getElementById('play');
const mateDiv = document.getElementById("checkmate-message");
const waitEl = document.getElementById('waiting-message');
const playerInfo = document.getElementById('playerInfo');
const opponentInfo = document.getElementById('opponentInfo');
const opponentCapturedPieces = document.getElementById('opponent-pieces');
const playerCapturedPieces = document.getElementById('player-pieces');


//sounds  
const moveAudio = new Audio();
moveAudio.src = './audio/move.mp3';
const captureAudio = new Audio();
captureAudio.src = './audio/capture.mp3'
const checkAudio = new Audio();
checkAudio.src = './audio/check.mp3';
const checkmateAudio = new Audio();
checkmateAudio.src = './audio/checkmate.mp3';
const gameStartAudio = new Audio();
gameStartAudio.src = './audio/game_start.mp3';
const gameOverAudio = new Audio();
gameOverAudio.src = './audio/game_over.mp3';

//timer
const duration = 5*60; // 3 minutes
const playerTimer = new Timer(duration,document.getElementById('player-timer'));
const opponentTimer = new Timer(duration,document.getElementById('opponent-timer'));

let canvas = null;
let ctx = null;
let SIZE = null;
let clicked = false;
let mate = false;
let staleMate = false;
let board = null;
let PLAYER = null;
let socket = null;


window.onload = ()=>{

  canvas = document.getElementById('chess-board');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  board = new Board(canvas);

  socket = io(window.location.origin);
  
  socket.on('connect', function() {
    console.log('Connected to the server');
  });

  socket.on("wait", () => {
    waitEl.style.display = 'flex';
    console.log('waiting for the second player');
  });

  socket.on("start", ({color}) => {
    gameStartAudio.play();
    waitEl.style.display = 'none';
    PLAYER = color;
    if(color==='black'){
      board.grid = board.flip();
    }
    console.log('start the game',color);
  });

  socket.on("opponent quit", () => {
    gameOverAudio.play();
    console.log('opponent quit');
    document.getElementById('result').innerText =  `Opponent left the game\n${PLAYER} Won!!`
    mateDiv.style.display = 'flex';
    PLAYER = null;
  });

  socket.on("move", (data) => {
    moveAudio.play();
    playerTimer.start();
    opponentTimer.pause();
    board.oponentMove(data);
  });

  socket.on("opponent_castle", (data) => {
    board.oponentCastle(data);
  });

  socket.on('staleMate',()=>{
    staleMate = true;
  });

  socket.on("cancelWait", (data) => {
    console.log(data);
  });

  window.addEventListener('resize', resizeCanvas);
  animate();
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  board.draw(ctx);

  if(mate){
    checkmateAudio.play();
    const winner = board.player==='white' ? 'Black' : 'White'
    showResult(winner,'Won by Checkmate');
    return;
  }

  if(staleMate){
    socket.emit('staleMate');
    gameOverAudio.play();
    showResult('Draw','by stalemate');
    return;
  }

  if(playerTimer.time<=0){
    gameOverAudio.play();
    const winner = PLAYER==='white' ? 'Black' : 'White'
    showResult(winner,'Won by Time');
    return;
  }
  if(opponentTimer.time<=0){
    gameOverAudio.play();
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

function resizeCanvas() {
  const minSize = Math.min(window.innerHeight,window.innerWidth);
  canvas.width = platform === 'Mobile' ? minSize*0.95 : minSize*0.85;
  canvas.height = canvas.width;
  SIZE = canvas.width/8;
  const rect = canvas.getBoundingClientRect();
  const {top,bottom} = rect;
  
  if(window.innerWidth<=600){
    playerInfo.style.top = `${bottom-5}px`;
    playerInfo.style.left = `15px`;
    
    opponentInfo.style.top = `${top-5-opponentInfo.clientHeight}px`;
    opponentInfo.style.right = `15px`;
  }

}

function getTouchPos(canvas,e){
  const rect = canvas.getBoundingClientRect();
  const touch = e.changedTouches[0];
  const x = touch.clientX-rect.left;
  const y = touch.clientY-rect.top;

  return {x,y}
}

class Board{
  constructor(canvas){
    this.canvas = canvas;
    this.cellSize = 70;
    this.lightColor = `#eeeed2`;
    this.darkColor = `#769656`;
    this.lastMoveColor = `#FFFF99`
    this.grid = this.initGrid()
    this.#addTouchEventListners(this.canvas);
    this.#addEventListners(this.canvas);
    this.legalMoves = [];
    this.selected = null;
    this.hoveredCell = {};
    this.dragging = false;
    this.mouseDown = false;
    this.player = 'white';
    this.checkedKing = null;
    this.history = {moves:[],offset:0};
    this.flipped = false;

    //castle
    this.leftRookMoved = false;
    this.rightRookMoved = false;
    this.kingMoved = false;
  }

  draw(ctx){
    this.drawGrid(ctx);
    if(!PLAYER) return;
    this.drawLastMove(ctx);
    this.drawLegalMoves(ctx);
    this.drawPieces(ctx);
  }

  drawGrid(ctx){
    for(let row = 0;row<this.grid.length;row++){
      for(let col = 0;col<this.grid[row].length;col++){
        const x = col*SIZE;
        const y = row*SIZE;
        const color = this.getCellColor(row,col);
        ctx.beginPath();
        ctx.rect(x,y,SIZE,SIZE);
        ctx.fillStyle = color;
        ctx.fill();

        //cells numbers
        if(col===0){
          let number;
          if(PLAYER==='white'){
            number = 8-row;
          }else{
            number = 1+row;
          }
          ctx.beginPath();
          ctx.font = "15px serif";
          ctx.fillStyle = color==='#31303b' ? '#e0e0d3' : '#31303b';
          ctx.fillText(number,x+5,y+15);
        }
        //cells letters
        if(row===7){
          const letters = ['a','b','c','d','e','f','g','h'];
          let letter;
          if(PLAYER==='black'){
            letter = letters[7-col];  
          }else{
            letter = letters[col]
          }
          ctx.beginPath();
          ctx.fillStyle = color==='#31303b' ? '#e0e0d3' : '#31303b';
          ctx.fillText(letter,x+SIZE-10,y+SIZE-5);
        }
      }
    }
  }

  drawLastMove(ctx){
    const length = this.history.moves.length; 
    if(length===0) return;
    const {from,to} = this.history.moves[length-1];

    ctx.beginPath();
    ctx.rect(from.col*SIZE,from.row*SIZE,SIZE,SIZE);
    ctx.fillStyle = this.lastMoveColor;
    ctx.fill();

    ctx.beginPath();
    ctx.rect(to.col*SIZE,to.row*SIZE,SIZE,SIZE);
    ctx.fill();
  }

  drawPieces(ctx){
    for(let row = 0;row<this.grid.length;row++){
      for(let col = 0;col<this.grid[row].length;col++){
        const piece = this.grid[row][col];
        if(piece) piece.draw(ctx,piece.clicked);
      }
    }
  }

  drawLegalMoves(ctx){
    if(!this.selected?.pos) return;
    const {row,col} = this.selected.oldPos;
    for(let i = 0;i<this.legalMoves.length;i++){
      const [rowDiff,colDiff] = this.legalMoves[i];
      const moveRow = row + rowDiff;
      const moveCol = col + colDiff;

      ctx.beginPath();
      ctx.rect(moveCol*SIZE,moveRow*SIZE,SIZE,SIZE);
      ctx.fillStyle = 'rgba(207, 14, 78,0.5)';
      ctx.fill();
    }
  }

  
  flip(){
    const {grid} = this;
    const n = grid.length;
    const rotatedGrid = [];

    for (let i = n - 1; i >= 0; i--) {
        const newRow = [];
        for (let j = n - 1; j >= 0; j--) {
          const piece = grid[i][j];
          if(piece){
            piece.pos.row = 7-piece.pos.row;
            piece.pos.col = 7-piece.pos.col;
            piece.oldPos.col = 7-piece.oldPos.col;
            piece.oldPos.col = 7-piece.oldPos.col;
          } 
          newRow.push(grid[i][j]);
        }
        rotatedGrid.push(newRow);
    }
    this.flipped = true;
    return rotatedGrid;
  
  }

  makeMove(row,col){
    for(const [r,c] of this.legalMoves){
      const {oldPos} = this.selected;
      const newRow = oldPos.row+r;
      const newCol = oldPos.col+c;
      
      if(newRow===row && newCol===col){

        //is castling ?
        this.#castleCheck(this.selected,c);
       
        //castle check
        this.#hasLostCastleRight(this.selected.type,oldPos.row,oldPos.col);
        
        //get the captured piece before replacing it
        const capturedPiece = this.grid[newRow][newCol];

        //move the piece
        this.#movePiece(this.selected,{row,col});

        //check if pawn promoted to a queen
        this.#promotePawn(this.selected);

        //check wheater opponent has a legal move
        const hasMove = this.hasMove();

        //whether there is a check or mate
        if(this.checkedKing) this.checkedKing.checked = false;
        this.checkedKing = this.isCheck(this.player);
        if(this.checkedKing){
          this.checkedKing.checked = true;
          mate = !hasMove;
        }else{
          staleMate = !hasMove;
        }
        
        const move = {
          from:{...oldPos},
          to:{row:newRow,col:newCol},
          capturedPiece,
          checkedKing: this.checkedKing,
          mate
        };
        socket.emit('madeMove',move);
        //audio
        this.#playAudio(move)

        playerTimer.pause();
        opponentTimer.start();
        this.history.moves.push(move);
        this.player = this.player==='white' ? 'black' : 'white';
        return true;
      }
    }
    return false; 
  };

  #playAudio({capturedPiece,mate,checkedKing}){
    if(capturedPiece){
      captureAudio.play();
      if(mate){
        checkmateAudio.play();
      }else if(checkedKing){
        checkAudio.play();
      }
    }else{
      moveAudio.play();
      if(mate){
        checkmateAudio.play();
      }else if(checkedKing){
        checkAudio.play();
      }
    }
  }

  oponentMove({from,to,checkedKing,mate:isMate,capturedPiece}){
    const {grid} = this;
    if(!grid[from.row] || !grid[from.row][from.col]) return;
   
    const piece = grid[from.row][from.col];
    this.#movePiece(piece,to);
    this.#promotePawn(piece);

    if(checkedKing){
      this.checkedKing = grid[checkedKing.pos.row][checkedKing.pos.col];
      this.checkedKing.checked = true;
    }else if(this.checkedKing){
      this.checkedKing.checked = false;
      this.checkedKing = null;
    }
    mate = isMate;
    capturedPiece = this.#initPieceByType(capturedPiece);
    const move = {
      from,
      to,
      capturedPiece,
      checkedKing,
      mate
    };
    this.history.moves.push(move);
    this.player = PLAYER;
  }

  oponentCastle({dir}){
    //the row should be 0 because opponent is always up
    if(PLAYER==='white'){
      if(dir==='right'){
        const rook = this.grid[0][7];
        this.#movePiece(rook,{row:0,col:rook.pos.col-2});
      }else{
        const rook = this.grid[0][0];
        this.#movePiece(rook,{row:0,col:rook.pos.col+3});
      }
    }else{
      if(dir==='left'){
        const rook = this.grid[0][0];
        this.#movePiece(rook,{row:0,col:rook.pos.col+2});
      }else{
        const rook = this.grid[0][7];
        this.#movePiece(rook,{row:0,col:rook.pos.col-3});
      }
    }
  }

  #castleCheck(piece,colMove){
    if(piece.type==='king'){
      const newCol = piece.oldPos.col+colMove;
      //left castle
      if(colMove===-2){
        //move the rook
        const rook = this.grid[piece.oldPos.row][0];
        this.#movePiece(rook,{row:piece.oldPos.row,col:newCol+1});

        //emit castle event here
        socket.emit('castle',{dir:'left'});
      }
      //right castle
      if(colMove===2){
        //move the rook
        const rook = this.grid[piece.oldPos.row][7];
        this.#movePiece(rook,{row:piece.oldPos.row,col:newCol-1});
        //emit castle event here
        socket.emit('castle',{dir:'right'});
      }
    }
  }

  #promotePawn(piece){
    const {row,col} = piece.pos;
    if(piece.type==='pawn' && (row===0 || row===7)){
      const newQueen = new Queen(piece.color,piece.pos);
      this.grid[row][col] = newQueen;
      //TODO - give a choise to promote whatever player wants
    }
  }

  #movePiece(piece,to){
    this.grid[piece.oldPos.row][piece.oldPos.col] = '';
    this.grid[to.row][to.col] = piece;
    piece.pos = {...to};
    piece.oldPos = {...to};
  }

  #hasLostCastleRight(type,row,col){
    if(this.kingMoved) return;
    //kingMoved
    if(type==='king'){
      this.kingMoved = true;
    }
    
    if(type==='rook'){
      //leftRook
      if(!this.leftRookMoved && col===0 && row===7){
        this.leftRookMoved = true;
      }
      //rightRook
      if(!this.rightRookMoved && col===7 && row===7){
          this.rightRookMoved = true;
      }
    }
    
  }

  getCellColor(row,col){
    if(this.selected && this.selected.pos.row === row && this.selected.pos.col === col) return 'gold';
    if(this.hoveredCell.row === row && this.hoveredCell.col === col) return 'rgba(20, 255, 15, 0.15)';
    if(row%2===0) return col%2===0 ? this.lightColor : this.darkColor;
    return col%2===0 ? this.darkColor : this.lightColor;
  };

  blockCheck(piece,legalMoves,player){
    const prevPlayer = player === 'white' ? 'black' : 'white';
    const moves = [];
    let kingCastleMoves = [];
    for(let i=0;i<legalMoves.length;i++){
      const [r,c] = legalMoves[i];
      const {oldPos} = piece;
      const newRow = oldPos.row+r;
      const newCol = oldPos.col+c;
      const temp = this.grid[newRow][newCol];
      this.grid[oldPos.row][oldPos.col] = '';
      this.grid[newRow][newCol] = piece;

      
      if(!this.isCheck(prevPlayer)){
        moves.push([r,c]);

        //if king has castling rights
        if(Math.abs(c)===2){
          kingCastleMoves.push([r,c,moves.length-1]);
        }
      }

      this.grid[newRow][newCol] = temp;
      this.grid[oldPos.row][oldPos.col] = piece;
    }
    //can't castle through check, even though the final dest is not under check
    if(piece.type==='king' && kingCastleMoves.length>0){
      for(let i = 0;i<kingCastleMoves.length;i++){
        let [row,col,index] = kingCastleMoves[i];
        let exist = false;
        for(const [r,c] of moves){
          if(row===r && (col+c===-3 || col+c===3)){
            exist = true;
          }
        }
        if(!exist){
          moves.splice(index,1);
          if(kingCastleMoves[i+1]){
            kingCastleMoves[i+1][2]--;
          } 
        }
      }
    }
    return moves;
  }

  isCheck(player){
    const {grid} = this;
    for(let row=0;row<grid.length;row++){
      for(let col = 0;col<grid[0].length;col++){
        const piece = grid[row][col];
        if(piece && piece.color === player){
          const moves = piece.legalMoves(grid);
          for(let i=0;i<moves.length;i++){
            const [moveRow,moveCol] = moves[i];
            const targetRow = row+moveRow;
            const targetCol = col+moveCol;
            const target = grid[targetRow][targetCol];
            if(target && target.type === 'king'){
              return target;
            }
          }
        }
      }
    }
    
    return null;
  }

  hasMove(){
    const player = this.player==='white' ? 'black' : 'white'
    const {grid} = this;
    for(let row=0;row<grid.length;row++){
      for(let col = 0;col<grid[0].length;col++){
        const piece = grid[row][col];
        if(piece && piece.color===player){
          const legalMoves = piece.legalMoves(grid);
          const moves = this.blockCheck(piece,legalMoves,player);
          if(moves.length>0) return true;
        }
      }
    }
    return false;
  }

  restart(){
    this.grid = this.initGrid();
    this.player = 'white';
    this.selected = null;
    this.checkedKing = null;
    this.history = {moves:[],offset:0};
  }

  #addTouchEventListners(canvas){
    let dragging = false;
    let firstTouch = null;
    
    canvas.addEventListener('touchstart',(e)=>{
      e.preventDefault();
      if(this.history.offset>0) return;
      
      const {x,y} = getTouchPos(canvas,e);
      const row = Math.floor(y/SIZE);
      const col = Math.floor(x/SIZE);
  
      firstTouch = {row,col};
      const piece = this.grid[row][col];
      
      if(piece && piece.color===this.player && PLAYER===this.player){
        this.selected = piece;
        this.legalMoves = piece.legalMoves(this.grid);
        this.legalMoves = this.blockCheck(this.selected,this.legalMoves,this.player);
      }else{
        if(!this.selected) return;
        
        this.makeMove(row,col);
        this.selected.clicked = false;
        this.selected = null;
        this.legalMoves.length = 0; 
      }
    });

    this.canvas.addEventListener('touchend',(e)=>{
      if(!this.selected) return;
      this.dragging = false;
      const {x,y} = getTouchPos(canvas,e);
      const row = Math.floor(y/SIZE);
      const col = Math.floor(x/SIZE);

      if(firstTouch.row===row && firstTouch.col===col){
        firstTouch = null;
        this.selected.clicked = false;
        this.selected.pos = this.selected.oldPos;
        return;
      }

      let legal = this.makeMove(row,col);

      if(legal){
        this.selected.clicked = false;
        this.legalMoves.length = 0;
        this.selected = null;
      }else{
        this.selected.clicked = false;
        this.selected.pos = this.selected.oldPos;
      }
       
    });


    this.canvas.addEventListener('touchmove',(e)=>{
      if(!this.selected) return;
      const {x,y} = getTouchPos(canvas,e);
      const row = y/SIZE;
      const col = x/SIZE;
        
      this.selected.pos = {row,col};
      this.selected.clicked = true;
      this.dragging = true;
    });
  }

  #addEventListners(canvas){
    canvas.addEventListener('mousedown',(e)=>{
      if(this.history.offset>0) return;
      const {offsetX,offsetY} = e;
      const row = Math.floor(offsetY/SIZE);
      const col = Math.floor(offsetX/SIZE);
      const piece = this.grid[row][col];
      
      if(piece && piece.color===this.player && PLAYER===this.player){
        this.mouseDown = true;
        this.selected = piece;
        this.legalMoves = piece.legalMoves(this.grid);
        this.legalMoves = this.blockCheck(this.selected,this.legalMoves,this.player);

      }else{
        if(!this.selected) return;
        
        this.makeMove(row,col);
        this.selected = null;
        this.legalMoves.length = 0;
      }
    });

    canvas.addEventListener('mouseup',(e)=>{
      const {offsetX,offsetY} = e;
      const row = Math.floor(offsetY/SIZE);
      const col = Math.floor(offsetX/SIZE);
      this.mouseDown = false;

      if(!this.dragging) return;

      let legal = this.makeMove(row,col);
      this.dragging = false;
      this.selected.clicked = false;
      if(legal){
        this.legalMoves.length = 0;
        this.selected = null;
      }else{
        this.selected.pos = this.selected.oldPos;
      } 
    });
    canvas.addEventListener('mousemove',(e)=>{
      const {offsetX,offsetY} = e;
      const row = Math.floor(offsetY/SIZE);
      const col = Math.floor(offsetX/SIZE);

      if(this.mouseDown){
        this.dragging = true;
        this.selected.pos = {row:offsetY/SIZE,col:offsetX/SIZE};
        this.selected.clicked = true;
      }else{
        this.hoveredCell = {row,col};
      }
    });

    document.addEventListener('mousemove',(e)=>{
      if(e.target.id !== 'myCanvas') {
        this.hoveredCell = {}
      }
    })
    
  }
  #initPieceByType(piece){
    const {type,pos,color} = piece;
    switch(type){
      case 'rook':
        return new Rook(color,pos);
      case 'knight':
        return new Knight(color,pos);
      case 'bishop':
        return new Bishop(color,pos);
      case 'Queen':
        return new Queen(color,pos);
      case 'king':
        return new King(color,pos);
      case 'pawn':
        return new Pawn(color,pos);
    }
  }
  initGrid(){
    const grid = [
      ['','','','','','','','',],
      ['','','','','','','','',],
      ['','','','','','','','',],
      ['','','','','','','','',],
      ['','','','','','','','',],
      ['','','','','','','','',],
      ['','','','','','','','',],
      ['','','','','','','','',]
    ];
    for(let row = 0;row<grid.length;row++){
      for(let col = 0;col<grid[row].length;col++){
        //black pieces
        if(row===0){
          //rook
          if(col===0 || col===grid.length-1){
            grid[row][col]= new Rook("black",{row,col})
          }
          //Knightt
          if(col===1 || col===grid.length-2){
            grid[row][col]= new Knight("black",{row,col})
          }
          //bishop
          if(col===2 || col===grid.length-3){
            grid[row][col]= new Bishop("black",{row,col})
          }
          //Queen
          if(col===3){
            grid[row][col]= new Queen("black",{row,col})
          }
          if(col===4){
            grid[row][col]= new King("black",{row,col})
          }
        }else if(row===1){
          grid[row][col]= new Pawn("black",{row,col})
        }else if(row===grid.length-2){
          grid[row][col]= new Pawn("white",{row,col})
        }else if(row===grid.length-1){
          //rook
          if(col===0 || col===grid.length-1){
            grid[row][col]= new Rook("white",{row,col})
          }
          //Knightt
          if(col===1 || col===grid.length-2){
            grid[row][col]= new Knight("white",{row,col})
          }
          //bishop
          if(col===2 || col===grid.length-3){
            grid[row][col]= new Bishop("white",{row,col})
          }
          //Queen
          if(col===3){
            grid[row][col]= new Queen("white",{row,col})
          }
          if(col===4){
            grid[row][col]= new King("white",{row,col})
          }
        }else{
          grid[row][col] = ''
        }
      }
    }
    return grid;
  }
}
class King extends Piece{
  constructor(color,pos){
    super(color,pos,'king');
    this.checkedIcon = new Image();
    this.checkedIcon.src = `./pieces/img/king-red.png`;
    this.checked = false;
  }

  legalMoves(grid){
    const moves = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
    const {row,col} = this.pos;
    const legalMoves = [];
    for(let i = 0;i<moves.length;i++){
      const [moveRow,moveCol] = moves[i];
      const targetRow = moveRow+row;
      const targetCol = moveCol+col;
      if(targetRow>=0 && targetRow<grid.length && targetCol>=0 && targetCol<grid.length ){
        if(grid[targetRow][targetCol]){
          if(grid[targetRow][targetCol].color !== this.color){
            legalMoves.push(moves[i])
          }
        }else{
          legalMoves.push(moves[i])
        }
      }
    }

    // //castle
    if(!board.kingMoved && !this.checked){
      //left castle
      if(!board.leftRookMoved){
        let c = col;
        while(c>0){
          c--;
          const cell = grid[row][c];
          if(cell) break; 
        }
        if(c===0) legalMoves.push([0,-2]);
      }

      //right castle
      if(!board.rightRookMoved){
        let c = col;
        while(c<7){
          c++;
          const cell = grid[row][c];
          if(cell) break; 
        }
        if(c===7) legalMoves.push([0,2]);
      }
    } 

    return legalMoves;
  }
}
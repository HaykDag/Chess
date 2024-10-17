class Bishop extends Piece{
  constructor(color,pos){
    super(color,pos,"bishop");
  }

  legalMoves(board){
    const {row,col} = this.pos;
    const legalMoves = [];

    //right down
    let frontRow = row+1;
    let fronCol = col+1;
    while(frontRow<board.length && fronCol<board.length){
      if(board[frontRow][fronCol]){
        if(board[frontRow][fronCol].color !== this.color){
          legalMoves.push([frontRow-row,fronCol-col]);
        }
        break; 
      }else{
        legalMoves.push([frontRow-row,fronCol-col]);
      }
      frontRow++;
      fronCol++;
    }
    //left down
    frontRow = row+1;
    fronCol = col-1;
    while(frontRow<board.length && fronCol>=0){
      if(board[frontRow][fronCol]){
        if(board[frontRow][fronCol].color !== this.color){
          legalMoves.push([frontRow-row,fronCol-col]);
        }
        break; 
      }else{
        legalMoves.push([frontRow-row,fronCol-col]);
      }
      frontRow++;
      fronCol--;
    }

    //right up
    frontRow = row-1;
    fronCol = col+1;
    while(frontRow>=0 && fronCol<board.length){
      if(board[frontRow][fronCol]){
        if(board[frontRow][fronCol].color !== this.color){
          legalMoves.push([frontRow-row,fronCol-col]);
        }
        break; 
      }else{
        legalMoves.push([frontRow-row,fronCol-col]);
      }
      frontRow--;
      fronCol++;
    }
    //left up
    frontRow = row-1;
    fronCol = col-1;
    while(frontRow>=0 && fronCol>=0){
      if(board[frontRow][fronCol]){
        if(board[frontRow][fronCol].color !== this.color){
          legalMoves.push([frontRow-row,fronCol-col]);
        }
        break; 
      }else{
        legalMoves.push([frontRow-row,fronCol-col]);
      }
      frontRow--;
      fronCol--;
    }

    return legalMoves;
  }

}
class Queen extends Piece{
  constructor(color,pos){
    super(color,pos,'queen');
  }

  legalMoves(board){
    const {row,col} = this.pos;
    const legalMoves = [];

    //right down
    let frontRow = row+1;
    let frontCol = col+1;
    while(frontRow<=board.length-1 && frontCol<=board.length-1){
      if(board[frontRow][frontCol]){
        if(board[frontRow][frontCol].color !== this.color){
          legalMoves.push([frontRow-row,frontCol-col]);
        }
        break; 
      }else{
        legalMoves.push([frontRow-row,frontCol-col]);
      }
      frontRow++;
      frontCol++;
    }
    //left down
    frontRow = row+1;
    frontCol = col-1;
    while(frontRow<=board.length-1 && frontCol>=0){
      if(board[frontRow][frontCol]){
        if(board[frontRow][frontCol].color !== this.color){
          legalMoves.push([frontRow-row,frontCol-col]);
        }
        break; 
      }else{
        legalMoves.push([frontRow-row,frontCol-col]);
      }
      frontRow++;
      frontCol--;
    }

    //right up
    frontRow = row-1;
    frontCol = col+1;
    while(frontRow>=0 && frontCol<=board.length-1){
      if(board[frontRow][frontCol]){
        if(board[frontRow][frontCol].color !== this.color){
          legalMoves.push([frontRow-row,frontCol-col]);
        }
        break; 
      }else{
        legalMoves.push([frontRow-row,frontCol-col]);
      }
      frontRow--;
      frontCol++;
    }
    //left up
    frontRow = row-1;
    frontCol = col-1;
    while(frontRow>=0 && frontCol>=0){
      if(board[frontRow][frontCol]){
        if(board[frontRow][frontCol].color !== this.color){
          legalMoves.push([frontRow-row,frontCol-col]);
        }
        break; 
      }else{
        legalMoves.push([frontRow-row,frontCol-col]);
      }
      frontRow--;
      frontCol--;
    }

    //vertical down
    let front = row+1;
    while(front<=board.length-1){
      if(board[front][col]){
        if(board[front][col].color !== this.color){
          legalMoves.push([front-row,0])
        }
        break; 
      }else{
        legalMoves.push([front-row,0])
      }
      front++;
    }
    //vertical up
    front = row-1;
    while(front>=0){
      if(board[front][col]){
        if(board[front][col].color !== this.color){
          legalMoves.push([front-row,0])
        }
        break; 
      }else{
        legalMoves.push([front-row,0])
      }
      front--;
    }

    //horizontal right
    front = col + 1;
    while(front<=board.length-1){
      if(board[row][front]){
        if(board[row][front].color !== this.color){
          legalMoves.push([0,front-col]);
        }
        break;
      }else{
        legalMoves.push([0,front-col]);
      }
      front++;
    }
    //horizontal letf
    front = col - 1;
    while(front>=0){
      if(board[row][front]){
        if(board[row][front].color !== this.color){
          legalMoves.push([0,front-col]);
        }
        break;
      }else{
        legalMoves.push([0,front-col]);
      }
      front--;
    }

    return legalMoves;
  }
}
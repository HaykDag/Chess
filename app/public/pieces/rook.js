class Rook extends Piece{
  constructor(color,pos){
    super(color,pos,'rook');
  }

  legalMoves(board){
    const {row,col} = this.pos;
    const legalMoves = [];

    //vertical down
    let front = row+1;
    while(front<board.length){
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
    while(front>0){
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
    while(front<board.length){
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
    while(front>0){
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
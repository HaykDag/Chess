class Pawn extends Piece{
  constructor(color,pos){
    super(color,pos,'pawn');
  }

  legalMoves(board){
    const legalMoves = [];
    const {row,col} = this.pos;
    const isOpponent = this.color !== PLAYER;
    if(isOpponent){
      if(!board[row+1][col]){
        legalMoves.push([1,0]);
        if(row === 1 && !board[row+2][col]){
          legalMoves.push([2,0]);
        }
      }
      if(board[row+1][col-1] && board[row+1][col-1].color !== this.color){
        legalMoves.push([1,-1]);
      }
      if(board[row+1][col+1] && board[row+1][col+1].color !== this.color){
        legalMoves.push([1,1]);
      }
    }else{
      //opponent's pieces
      if(!board[row-1][col]){
        legalMoves.push([-1,0]);
        if(row === 6 && !board[row-2][col]){
          legalMoves.push([-2,0]);
        }
      }
      if(board[row-1][col-1] && board[row-1][col-1].color !== this.color){
        legalMoves.push([-1,-1]);
      }
      if(board[row-1][col+1] && board[row-1][col+1].color !== this.color){
        legalMoves.push([-1,1]);
      }
    }
    
    return legalMoves;
  }
}
class Knight extends Piece{
  constructor(color,pos){
    super(color,pos,'knight');
  }

  legalMoves(board){
    const moves = [[1,-2],[-1,-2],[-2,1],[-2,-1],[1,2],[-1,2],[2,1],[2,-1]];
    const {row,col} = this.pos;
    const legalMoves = [];
    for(let i = 0;i<moves.length;i++){
      const [moveRow,moveCol] = moves[i];
      const targetRow = moveRow+row;
      const targetCol = moveCol+col;
      if(targetRow>=0 && targetRow<board.length && targetCol>=0 && targetCol<board.length ){
        if(board[targetRow][targetCol]){
          if(board[targetRow][targetCol].color !== this.color){
            legalMoves.push(moves[i])
          }
        }else{
          legalMoves.push(moves[i])
        }
      }
    }

    return legalMoves;
  }

}
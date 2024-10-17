module.exports.getBoardCoords = (pos)=>{
  //pos is a string 'a5' or 'c2'
  if(pos.length!==2) return;
  const col = getCol(pos[0]);
  const row = 9-Number(pos[1]);
  return {row,col};
}

module.exports.getPieceCoords = ({row,col})=>{
  const PieceCol = getCol(col);
  const PieceRow = 9-row;
  return `${PieceCol,PieceRow}`;
}

function getCol(s){
  switch (s){
    case 'a':
      return 0;
    case 'b':
      return 1;
    case 'c':
      return 2;
    case 'd':
      return 3;
    case 'e':
      return 4;
    case 'f':
      return 5;
    case 'g':
      return 6;
    case 'h':
      return 7;
    case '0':
      return 'a';
    case 1:
      return 'b';
    case 2:
      return 'c';
    case 3:
      return 'd';
    case 4:
      return 'e';
    case 5:
      return 'f';
    case 6:
      return 'g'
    case 7:
      return 'h';
  }
};
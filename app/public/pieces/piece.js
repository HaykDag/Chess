class Piece{
  constructor(color,pos,type){
    this.color = color;
    this.pos = pos;
    this.oldPos = pos;
    this.type = type;
    this.icon = new Image();
    this.icon.src = `./pieces/img/${color}/${type}.png`;
  }

  draw(ctx,translate=false){
    const {row,col} = this.pos;
    
    ctx.save();
    translate && ctx.translate(-SIZE/2,-SIZE/2);
    this.checked 
      ? ctx.drawImage(this.checkedIcon,col*SIZE+SIZE*0.1,row*SIZE+SIZE*0.1,SIZE*0.8,SIZE*0.8)
      : ctx.drawImage(this.icon,col*SIZE,row*SIZE,SIZE,SIZE);
    ctx.restore();
   
  }
}
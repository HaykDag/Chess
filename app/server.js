const express = require('express');
const path = require('path');

// express app
const app = express();
//socket io
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// middleWares
// app.use(express.json());

let waitingPlayer = null;
const playingMap = new Map();
io.on("connection", (socket) => {
    socket.on("play", () => {
        if(playingMap.get(socket.id)) return;//already playing
        if(waitingPlayer){
            if(waitingPlayer===socket.id) return;//the same player
            //start the game
            playingMap.set(waitingPlayer,socket.id);
            playingMap.set(socket.id,waitingPlayer);
            io.to(waitingPlayer).emit("start",{color:"white"});
            io.to(socket.id).emit("start",{color:"black"});
            waitingPlayer = null;
        }else{
            waitingPlayer = socket.id
            socket.emit('wait');
        }
    });
    socket.on('cancelWait',()=>{
        if(waitingPlayer){
            socket.emit('cancelWait','Playing request canceled');
            waitingPlayer = null;
        }
    });
    //client makes move
    socket.on("madeMove", (data) => {
        const otherPlayer = playingMap.get(socket.id);
        const {from,to,checkedKing} = data;

        from.row = 7-from.row;
        from.col = 7-from.col;
        to.row = 7-to.row;
        to.col = 7-to.col;

        //just change the row and col and send the pos
        if(checkedKing){
            checkedKing.pos.row = 7-checkedKing.pos.row;
            checkedKing.pos.col = 7-checkedKing.pos.col;
        }

        io.to(otherPlayer).emit('move',{...data,from,to});
    });

    socket.on('castle',(data)=>{
      const otherPlayer = playingMap.get(socket.id);  
      const dir = data.dir === 'left' ? 'right' : 'left';

      io.to(otherPlayer).emit('opponent_castle',{dir});
    });

    socket.on('staleMate',()=>{
        const otherPlayer = playingMap.get(socket.id);  
      
        io.to(otherPlayer).emit('staleMate');
    });

    socket.on("disconnect", () => {
        const otherUser = playingMap.get(socket.id);
        playingMap.delete(socket.id);
        playingMap.delete(otherUser);
        io.to(otherUser).emit('opponent quit');
    });
});

app.use(express.static(path.join(__dirname,"public")));
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,"public","index.html"));
})
const PORT = 8080;
server.listen(PORT,()=>{
    console.log('listening to port ' + PORT);
})
   


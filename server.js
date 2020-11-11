
const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const  io = require('socket.io')(http);
const LOCALHOSTPORT = 7000;

let circles = [];

class Circle {
    constructor(id, x, y, size, col){
        this.id = id;
        this.x = x;
        this.y = y;
        this.size = size;
        this.col = col;
    }
}

app.use('/', express.static(__dirname + '/public'));
// app.use('/mobile', express.static(__dirname + '/public/mobile'));

setInterval(heartbeat, 10);

function heartbeat(){
    io.sockets.emit('heartbeat', circles)
}



io.on('connection', function(socket){
    console.log('client connected, new player id is:' + socket.id);

    socket.on('start', (data) => {
        const circle = new Circle(socket.id, data.x, data.y, data.size, data.col)
        circles.push(circle);
    });

    socket.on('update', (data) => {
       circles.forEach(circle => {
           if(circle => circle.id == socket.id){
            circle.x = data.x;
            circle.y = data.y;
            circle.size = data.size;
            circle.col = data.col;
           };
        })
    });


    socket.on('disconnect', function() {
        console.log("Client has disconnected");
      });

})


http.listen(process.env.PORT || LOCALHOSTPORT);
console.log('server running on port:' + LOCALHOSTPORT);
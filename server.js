
const e = require('express');
const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const  io = require('socket.io')(http);
const Client = require('./Client');


const LOCALHOSTPORT = 7000;

// let circles = new Map;
let circles = new Map;

let clients = new Set;



app.use('/', express.static(__dirname + '/public'));
// app.use('/mobile', express.static(__dirname + '/public/mobile'));

// setInterval(heartbeat, 30);

function heartbeat(){
    io.sockets.emit('heartbeat', clients)
}


class Circle {
    constructor(id, x, y, size, col, clicked){
        this.id = id;
        this.x = x;
        this.y = y;
        this.size = size;
        this.col = col;
        this.clicked = clicked;

    }
}



io.on('connection', function(socket){
    console.log('client connected, new player id is:' + socket.id);

    socket.on('start', (data) => {
        const circle = new Circle(socket.id, data.x, data.y, data.size, data.col, data.clicked, data.freq)
        // console.log(data);
        circles.set(socket.id, circle);
        console.log(circles);
    });

    socket.on('update', (data) => {
        // console.log(circles);
        if(data.id){
            circles.set(data.id, data);
        }
        
        // console.log(circles);
        // console.log('update running');
        // console.log(circles);
        const newData = [...circles.values()];
        // console.log('NEW DATa', newData);
        // const circlesSize = circles.size;
        // console.log(otherData);
        socket.emit('state-update', newData );

    });

    socket.on('playSound', (freq) => {
        // console.log('play sound message received', freq);
        socket.broadcast.emit('playFreq', freq);
    })


    socket.on('disconnect', function() {
        console.log("Client has disconnected");
        // console.log(circles);
        circles.delete(socket.id);
        // console.log(circles);
      });

})


http.listen(process.env.PORT || LOCALHOSTPORT);
console.log('server running on port:' + LOCALHOSTPORT);
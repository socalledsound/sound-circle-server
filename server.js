
const e = require('express');
const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const  io = require('socket.io')(http);
const Client = require('./Client');


const LOCALHOSTPORT = 7000;

// let circles = new Map;
let players = new Map;

app.use('/', express.static(__dirname + '/public'));


class Circle {
    constructor(id, x, y, size, col){
        this.id = id;
        this.pos = {x: x, y: y};
        this.size = size;
        this.col = col;
    }
}



class Player {
    constructor(id, circleData){
        this.id = id;
        this.circle = new Circle(id, circleData.pos.x, circleData.pos.y, circleData.size, circleData.col);
        this.messages = [];
    }
}



io.on('connection', function(socket){
    console.log('client connected, new player id is:' + socket.id);

    socket.on('start', (data) => {
        const player = new Player(socket.id, data)
        console.log(data);
        players.set(socket.id, player);
        console.log(players);
    });

    socket.on('update', (data) => {
        // console.log(players);
        if(data.id){
            const updatedPlayer = {
                id: data.id,
                circle: data.circle,
                messages: data.messages,
            }
            players.set(data.id, updatedPlayer);
        }

        const newData = [...players.values()];

        socket.emit('state-update', newData );

    });

    socket.on('playSound', (freq) => {
        // console.log('play sound message received', freq);
        socket.broadcast.emit('playFreq', freq);
    })


    socket.on('disconnect', function() {
        console.log("Client has disconnected");
        // console.log(circles);
        players.delete(socket.id);
        // console.log(circles);
      });

})


http.listen(process.env.PORT || LOCALHOSTPORT);
console.log('server running on port:' + LOCALHOSTPORT);
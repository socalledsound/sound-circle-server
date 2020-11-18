
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
    constructor(id, x, y, size, col, velocityX, velocityY){
        this.id = id;
        this.pos = {x: x, y: y};
        this.size = size;
        this.col = col;
        this.velocity = {x: velocityX, y: velocityY}
    }
}



class Player {
    constructor(id, playingVal, circleData){
        this.id = id;
        this.playing = playingVal;
        this.circle = new Circle(id, circleData.x, circleData.y, circleData.size, circleData.col, circleData.velocity.x, circleData.velocity.y);
        this.messages = [];
    }
}



io.on('connection', function(socket){
    console.log('client connected, new player id is:' + socket.id);
    const playersData = [...players.values()];
    socket.emit('init', playersData);

    socket.on('start', (data) => {
        if(data === 'non-player'){
            console.log('non player joined');
            const player = new Player(socket.id, false, data);
            players.set(socket.id, player);
        } else {
            console.log('player joined');
            const player = new Player(socket.id, true, data)
            players.set(socket.id, player);
            console.log(players);
        }

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

    socket.on('playSound', (num) => {
        // console.log('play sound message received', freq);
        socket.broadcast.emit('playFreq', num);
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
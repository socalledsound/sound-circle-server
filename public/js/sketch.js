function setup(){
    createCanvas(600, 600);
    env = new p5.Envelope(0.01, 0.7, 0.3, 0.0);
    osc = new p5.Oscillator('sine');
    osc.start();
    env.play(osc);
}

function draw(){
    
   background(120,90,200);
   if(myCircle != null){
       updateMyCircle();
   }


   
console.log(otherCircles);

otherCircles.forEach(circle => {
    displayCircle(circle);
})  
    
    drawTextMessage();

    emitUpdate();
}


function mousePressed(){
    const transmitSound = myCircle.checkClick(mouseX, mouseY);
    if(transmitSound){
        // console.log('transmitting');
        // const freq = myCircle.size * 10;
        // playSound(freq);
        // socket.emit('playSound', freq); 
    }
}

function mouseReleased(){
    if(myCircle.clicked){
        myCircle.setSpeed(mouseX, mouseY);
    }  
    myCircle.clicked = false;
}


function displayCircle(circle){
    // console.log(circle.x);
    const { pos, size, col, clicked} = circle;
    fill(col);
    stroke(220, 200, 220);
    const ellipseStroke = clicked ? 9 : 3;
    strokeWeight(ellipseStroke);
    ellipse(pos.x, pos.y, size);
}

function playSound(freq){
    osc.freq(freq);
    // osc.amp(1.0);
    env.play(osc);
}

function transmitSound(){
    console.log('transmitting');
    const freq = myCircle.size * 10;
    playSound(freq);
    socket.emit('playSound', freq); 
}

function updateMyCircle(){
    myCircle.move();
    myCircle.checkEdges();
    myCircle.checkCircles(otherCircles, socket.id, socket);
    myCircle.display();
    
   
}

function emitUpdate(){
    console.log('emitting update');
    if(myCircle != null && joined){
        const circleUpdate = {
            id:socket.id,
            pos: {x: myCircle.pos.x, y: myCircle.pos.y},
            size: myCircle.size,
            col: myCircle.col,
            velocity: {x: myCircle.velocity.x, y: myCircle.velocity.y},  
        } 
        const newData = {
            id: socket.id,
            circle: circleUpdate,
            messages: myMessages,
        }
    
        socket.emit('update', newData);
    } else {

        const offscreenCircle = {
            id: socket.id,
            pos: {x: -200, y: -200},
            size: 0,
            col: 'white',
            velocity: {x: 0, y: 0},  
        } 

        const data = {
            id: socket.id,
            circle: offscreenCircle,
            messages: myMessages,
        }
        socket.emit('update', data);
    }



}

function drawTextMessage(){
    if(!joined){
        stroke('black');
        textSize(20);
        text(sorryText, 10, 100)
    }
}
const socket = io.connect();
let env, osc;
socket.on('connect', () => {
    console.log('client connected')
})

let myCircle;
let otherCircles = new Map;
let myMessages = [];

function setup(){
    createCanvas(600, 600);
    // frameRate(1);
    env = new p5.Envelope(0.01, 0.7, 0.3, 0.0);
    osc = new p5.Oscillator('sine');
    osc.start();
    osc.amp(1.0);
    env.play(osc);
    
    
    const myCircleOpts = {
        x: random(50, width-50),
        y: random(50, height-50),
        size: random(20,40),
        col: [random(255), random(255), random(255)],
    }
    myCircle = new SoundCircle(myCircleOpts.x, myCircleOpts.y, myCircleOpts.size, myCircleOpts.col);
    // circles.push(myCircle);
    // const msg = myCircle;
    // console.log(socket.id);
    const initCircleData = {
        pos: { x: myCircle.pos.x, y: myCircle.pos.y},
        size: myCircle.size,
        col: myCircle.col,
        // clicked: myCircle.clicked,
    }
    

    socket.emit('start', initCircleData);

    socket.on('state-update', (data) => {
        // console.log(data.get(socket.id));
        // console.log('state-update running');
        // console.log(typeof data);
      
        //     console.log(data);
            data.forEach((item, i) => {
                if(item.id){
                    otherCircles.set(item.id, item.circle);
                    myMessages = item.messages;
                }
                

            })  
        

        



   

    })
    
   
    socket.on('playFreq', (freq) => {
        console.log('received play sound message');
        osc.freq(freq);
        env.play(osc);
    })

    // socket.on('newMessage', (message) => {
    //     myMessages.
    // })


}

function draw(){
    
   background(120,90,200);
   myCircle.move();
   myCircle.checkEdges();
   const collision = myCircle.checkCircles(otherCircles, socket.id, socket)
   if(collision){
    console.log(collision);
       console.log("colliding");
       console.log('transmitting');

   };
    

//    if(collision){

// }


// console.log(otherCircles);
otherCircles.forEach(circle => {
    // console.log(circle);
    displayCircle(circle);
})  
   
    myCircle.display();


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


    // console.log('not looping');
    // noLoop();
    
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
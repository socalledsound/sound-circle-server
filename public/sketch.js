const socket = io.connect();
let env, osc;
socket.on('connect', () => {
    console.log('client connected')
})

let myCircle;
let otherCircles = [];

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
    myCircle = new SoundCircle(socket.id, myCircleOpts.x, myCircleOpts.y, myCircleOpts.size, myCircleOpts.col);
    // circles.push(myCircle);
    // const msg = myCircle;

    const data = {
        x: myCircle.pos.x,
        y: myCircle.pos.y,
        size: myCircle.size,
        col: myCircle.col,
        clicked: myCircle.clicked,
    }

    socket.emit('start', data);

    socket.on('heartbeat', (data) => {
        // loop();

        // console.log('looping');
         otherCircles = [];

        data.forEach((item, i) => {
            if(item.id != socket.id){
                otherCircles.push(item);
            }
        })  
        background(120,90,200);
        otherCircles.forEach(circle => {
            displayCircle(circle);
        })  

        myCircle.move();
        myCircle.checkEdges();
        myCircle.display();
   
       const data = {
           x: myCircle.pos.x,
           y: myCircle.pos.y,
           size: myCircle.size,
           col: myCircle.col,
           clicked: myCircle.clicked,
       }
   
   
   
       socket.emit('update', data);
    })
    
   
    socket.on('playFreq', (freq) => {
        console.log('received play sound message');
        osc.freq(freq);
        env.play(osc);
    })


}

// function draw(){
    


    

//     // console.log('not looping');
//     // noLoop();
    
// }


function mousePressed(){
    const transmitSound = myCircle.checkClick(mouseX, mouseY);
    if(transmitSound){
        console.log('transmitting');
        const freq = myCircle.size * 10;
        socket.emit('playSound', freq); 
    }
}

function mouseReleased(){
    if(myCircle.clicked){
        myCircle.setSpeed(mouseX, mouseY);
    }  
    myCircle.clicked = false;
}


function displayCircle(circle){
    const { x, y, size, col, clicked} = circle;
    fill(col);
    stroke(220, 200, 220);
    const ellipseStroke = clicked ? 9 : 3;
    strokeWeight(ellipseStroke);
    ellipse(x, y, size);
}

function playSound(freq){
    osc.freq(freq);
    env.play(osc);
}

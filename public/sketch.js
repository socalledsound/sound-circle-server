const socket = io.connect();
let env;
socket.on('connect', () => {
    console.log('client connected')
})

let myCircle;
let otherCircles = [];

function setup(){
    createCanvas(600, 600);
    env = new p5.Envelope(0.01, 0.7, 0.3, 0.0);
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
        
         otherCircles = [];

        data.forEach(item => {
            if(item.id != socket.id){
                otherCircles.push(item);
            }
        })    
    })

    socket.on('playSound', (freq) => {
        playSound(freq);
    })


}

function draw(){
    background(120,90,200);

    otherCircles.forEach(circle => {
        // playSound(circle);
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

}


function mousePressed(){
    const transmitSound = myCircle.checkClick(mouseX, mouseY);
    if(transmitSound){
        socket.emit('playSound', myCircle.freq); 
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
    const sound = initSound(freq);
    sound.start();
    env.play(sound);
}


function initSound(freq){
    const osc = new p5.Oscillator('sine');
    osc.freq(freq4);
    return osc
}

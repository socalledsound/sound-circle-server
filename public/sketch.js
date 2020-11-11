const socket = io.connect();

socket.on('connect', () => {
    console.log('client connected')
})

let myCircle;
let circles = [];

function setup(){
    createCanvas(600, 600);
    const myCircleOpts = {
        x: random(50, width-50),
        y: random(50, height-50),
        size: random(20,40),
        col: [random(255), random(255), random(255)],
    }
    myCircle = new SoundCircle(socket.id, myCircleOpts.x, myCircleOpts.y, myCircleOpts.size, myCircleOpts.col);
    circles.push(myCircle);
    const data = {
        x: myCircle.pos.x,
        y: myCircle.pos.y,
        size: myCircle.size,
        col: myCircle.col,
    }

    socket.emit('start', data);

    socket.on('heartbeat', (data) => {
        
        // circles = data;

            // console.log(data);

        data.forEach((item) => {
            const { id, x, y, size, col} = item;
            // console.log(id);
            const existingCircles = circles.filter(circle => circle.id === id);
            if(existingCircles.length > 0){
                //console.log(existingCircles);
                existingCircles.forEach(circle => {
                    circle.pos.x = x;
                    circle.pos.y = y;
                    circle.size = size;
                    circle.col = col;
                })

            } else {
                circles.push(new SoundCircle(id, x, y, size, col))
            }
            
        })
    
    })


}

function draw(){
    background(120,90,200);

    circles.forEach(circle => {
        circle.move();
        circle.checkEdges();
        circle.display();
    })


    circles.forEach(circle => {
        const myCircle = circles.filter( circle => circle.id === socket.id);
    })



    const data = {
        x: myCircle.pos.x,
        y: myCircle.pos.y,
        size: myCircle.size,
        col: myCircle.col,
    }



    socket.emit('update', data);

}


function mousePressed(){
    console.log(socket.id);
    circles.forEach(circle => {
        const myCircle = circles.filter( circle => circle.id === socket.id);
    })

    console.log(myCircle);
    myCircle.checkClick(mouseX, mouseY);
    
    console.log(circles);
}

function mouseReleased(){
    circles.forEach(circle => {
        const myCircle = circles.filter( circle => circle.id === socket.id);
    })
    if(myCircle.clicked){
        myCircle.setSpeed(mouseX, mouseY);
    }
   
  
    myCircle.clicked = false;
  
}

class SoundCircle {
    constructor(x, y, size, col){
        this.pos = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        this.fc = 0.1;
        this.friction = 0.001;
        this.maxSpeed = 10.0;
        this.size  = size;
        this.mass = this.size/30;
        this.col = col;
        this.env = new p5.Envelope(0.01, 0.7, 0.3, 0.0);
        this.osc = new p5.Oscillator('sine');
        this.clicked = false;
        this.playing = false;
        this.osc.start();
        this.osc.amp(0.0);
        this.env.play(osc);
 
    }

    checkClick(mx, my){
        const distMouse = dist(mx, my, this.pos.x, this.pos.y);
        if(distMouse < this.size){
            this.clicked = true;
            this.increaseSize();
            return true
        }
    }

    checkCircles(otherCircles, socketId, socket){
        otherCircles.forEach( circle => {
            // console.log(this.pos.x, this.pos.y, circle.x, circle.y);
            const dist = sqrt(((this.pos.x - circle.pos.x) * (this.pos.x - circle.pos.x)) + ((this.pos.y - circle.pos.y) * (this.pos.y - circle.pos.y)));
            const minDist = this.size/2 + circle.size/2;
            // console.log(dist, minDist);
            if(dist < this.size/2 + circle.size/2 && dist > 0 && circle.id != socketId){
              
                 this.resolveCollision(this, circle);
                 console.log('collided');
                 const freq = this.size * 10;
                 if(!this.playing){
                     this.playing = true;
                    //  this.osc.amp(1.0);
                    //  this.env.play(osc);
                     socket.emit('playSound', freq);
                    setTimeout(()=>this.playing = false, 2000);
                 }
                
                

            }
        })
       
    }

    checkEdges(){
        if(this.pos.x < 0){
            this.pos.x = width - this.size/2;
        } else if (this.pos.x > width){
            this.pos.x = 0 + this.size/2;
        }
        if(this.pos.y < 0 ){
            this.pos.y = height;
        } else if(this.pos.y > height){
            this.pos.y = 0;
        }
    }

    display(){
        // fill(this.col);
        // stroke(220, 200, 220);
        // const ellipseStroke = this.clicked ? 9 : 3;
        // strokeWeight(ellipseStroke);
        // ellipse(this.pos.x, this.pos.y, this.size);
        if(this.clicked){
            this.drawLine(this.pos.x, this.pos.y, mouseX, mouseY);   
        } 
    }

    drawLine(cx, cy, mx, my){
        stroke(200, 20, 200);
        strokeWeight(9);
        line(cx, cy, mx, my);
    }

    increaseSize(){
        if(this.size > 100){
            this.size = 20;
        } else {
            this.size += 5;
        }
    }


    move(){
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.pos.add(this.velocity);
        this.acceleration.mult(0);
        this.velocity.mult(0.999);
    }

    playSound(){
        

        
    }


    rotateVel(velocity, angle) {
        var rotatedVelocities = {
          x: velocity.x * cos(angle) - velocity.y * sin(angle),
          y: velocity.x * sin(angle) + velocity.y * cos(angle)
        };
      
        rotatedVelocities = createVector(rotatedVelocities.x, rotatedVelocities.y);
      
        return rotatedVelocities;
      }

    resolveCollision(circle, otherCircle) {
        const xVelocityDiff = circle.velocity.x - otherCircle.velocity.x;
        const yVelocityDiff = circle.velocity.y - otherCircle.velocity.y;
      
        const xDist = otherCircle.pos.x - circle.pos.x;
        const yDist = otherCircle.pos.y - circle.pos.y;
      
        // Prevent accidental overlap of particles
        if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
      
          // Grab angle between the two colliding particles
          const angle = -atan2(otherCircle.pos.y - circle.pos.y, otherCircle.pos.x - circle.pos.x);
      
          // Store mass in var for better readability in collision equation
        //   const m1 = circle.mass;
        //   const m2 = otherCircle.mass;
          const m1 = circle.size;
          const m2 = otherCircle.size;
      
          // Velocity before equation
          const u1 = this.rotateVel(circle.velocity, angle);
          const u2 = this.rotateVel(otherCircle.velocity, angle);
      
          // Velocity after 1d collision equation
          var v1 = {
            x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2),
            y: u1.y
          };
          v1 = createVector(v1.x, v1.y);
          var v2 = {
            x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2),
            y: u2.y
          };
          v2 = createVector(v2.x, v2.y);
      
          // Final velocity after rotating axis back to original location
          const vFinal1 = this.rotateVel(v1, -angle);
          const vFinal2 = this.rotateVel(v2, -angle);
      
          // Swap particle velocities for realistic bounce effect
          circle.velocity.x = vFinal1.x;
          circle.velocity.y = vFinal1.y;
      
          otherCircle.velocity.x = vFinal2.x;
          otherCircle.velocity.y = vFinal2.y;
        }
    }


    setSpeed(mx, my){
        const mousePos = createVector(mx, my);
        const currentPos = createVector(this.pos.x, this.pos.y);
        const dist = currentPos.sub(mousePos);
        this.acceleration = dist.mult(.01, .01);
    }
}
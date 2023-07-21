let window_x;
let window_y;
let number_of_balls = 15;
let probabilty_of_sick = 30;
let probabilty_of_quar = 25;
let probaility_at_home = 75;
let balls = [];
let RADIU = 20;
let pause = false;
let time_to_death = 10000;
let recovery_probabilty = 80;

let sick_count = 0;
let dead_count = 0;
let recovered_count = 0;
let healty_count = number_of_balls;

function setup() {
  let placed_balls = 1;
  window_x = windowWidth - 200;
  window_y = windowHeight;
  let x = random(0, window_x - RADIU);
  let y = random(0, window_y - RADIU);
  let at_home = random(100);
  let quar = random(100);
  let sick = random(100);
  if (quar < probabilty_of_quar) {
    balls[0] = new Ball(
      x,
      y,
      false,
      sick < probabilty_of_sick,
      at_home < probaility_at_home
    );
  } else {
    balls[0] = new Ball(x, y, true, sick < probabilty_of_sick, false);
  }

  while (placed_balls < number_of_balls) {
    x = random(0, window_x - RADIU);
    y = random(0, window_y - RADIU);
    let placeit = true;
    let ball_hit = 0;
    for (let i = 0; i < placed_balls; i++) {
      if (
        (x > balls[i].position.x - RADIU && x < balls[i].position.x + RADIU) ||
        (y > balls[i].position.y - RADIU && y < balls[i].position.y + RADIU)
      ) {
        placeit = false;
        ball_hit = i;
        break;
      }
    }
    if (placeit) {
      //console.log("ball"+placed_balls);
      at_home = random(100);
      quar = random(100);
      sick = random(100);
      if (quar < probabilty_of_quar) {
        balls[placed_balls] = new Ball(
          x,
          y,
          false,
          sick < probabilty_of_sick,
          at_home < probaility_at_home
        );
      } else {
        balls[placed_balls] = new Ball(
          x,
          y,
          true,
          sick < probabilty_of_sick,
          false
        );
      }
      //console.log("\tx :"+balls[placed_balls].position.x);
      //console.log("\ty :"+balls[placed_balls].position.y);
      //console.log("\tquar:"+quar);
      //console.log("\tsick :"+sick);
      placed_balls++;
    } else {
      //console.log("Tried x:"+x+" y:"+y+" hit ball:"+ball_hit);
    }
  }
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(51);
  
  for (let b in balls) {
    //console.log('--')
    //console.log(balls[b])
    if (!pause) balls[b].update();
    balls[b].display();
    if (!pause) balls[b].checkBoundaryCollision();
  }
  if (!pause) {
    for (let i = 0; i < balls.length; i++) {
      for (let j = 0; j < balls.length; j++) {
        balls[i].checkCollision(balls[j]);
      }
    }
  }
  textSize(25);
  text("Total: " + number_of_balls, window_x + 10, 30);
  text("Healthy: " + healty_count, window_x + 10, 60);
  text("Sick: " + sick_count, window_x + 10, 90);
  text("Dead: " + dead_count, window_x + 10, 120);
  text("Recovered: " + recovered_count, window_x + 10, 150);
}

function keyPressed() {
  if (key == 32) {
    pause = !pause;
    //console.log("pause: "+pause);
  }
}

class Ball {
  constructor(x, y, _is_moving, _is_sick, _cannot_spread) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D();
    if (_is_moving) {
      this.velocity.mult(2);
    } else {
      this.velocity.mult(0);
    }
    this.radius = RADIU;
    this.m = this.radius * 0.1;
    this.is_moving = _is_moving;
    this.is_sick = _is_sick;
    this.cannot_spread = _cannot_spread;
    if (this.is_sick) {
      this.time_of_sickness = millis();
      sick_count++;
      healty_count--;
    } else {
      this.time_of_sickness = null;
    }
  }

  update() {
    this.position.add(this.velocity);
    if (this.is_sick && !this.is_dead) {
      if (millis() - this.time_of_sickness > time_to_death) {
        console.log("dead/recovered");
        this.is_dead = true;
        this.cannot_spread = true;
        dead_count++;
        if (random(100) < recovery_probabilty) {
          recovered_count++;
          dead_count--;
          healty_count++;
          this.is_recovered = true;
        }
        sick_count--;
      }
    }
  }

  checkBoundaryCollision() {
    if (this.is_moving) {
      if (this.position.x > window_x - this.radius) {
        this.position.x = window_x - this.radius;
        this.velocity.x *= -1;
      } else if (this.position.x < this.radius) {
        this.position.x = this.radius;
        this.velocity.x *= -1;
      } else if (this.position.y > window_y - this.radius) {
        this.position.y = window_y - this.radius;
        this.velocity.y *= -1;
      } else if (this.position.y < this.radius) {
        this.position.y = this.radius;
        this.velocity.y *= -1;
      }
    }
  }

  checkCollision(other) {
    if (this.is_moving) {
      // Get distances between the balls components
      let distanceVect = p5.Vector.sub(other.position, this.position);

      // Calculate magnitude of the vector separating the balls
      let distanceVectMag = distanceVect.mag();

      // Minimum distance before they are touching
      let minDistance = this.radius + other.radius;

      if (distanceVectMag < minDistance) {
        let distanceCorrection = (minDistance - distanceVectMag) / 2.0;
        let d = distanceVect.copy();
        let correctionVector = d.normalize().mult(distanceCorrection);
        if (other.is_moving) {
          other.position.add(correctionVector);
        }
        this.position.sub(correctionVector);

        // get angle of distanceVect
        let theta = distanceVect.heading();
        // precalculate trig values
        let sine = sin(theta);
        let cosine = cos(theta);

        /* bTemp will hold rotated ball positions. You 
         just need to worry about bTemp[1] position*/
        let bTemp = [createVector(), createVector()];

        /* this ball's position is relative to the other
         so you can use the vector between them (bVect) as the 
         reference polet in the rotation expressions.
         bTemp[0].position.x and bTemp[0].position.y will initialize
         automatically to 0.0, which is what you want
         since b[1] will rotate around b[0] */
        bTemp[1].x = cosine * distanceVect.x + sine * distanceVect.y;
        bTemp[1].y = cosine * distanceVect.y - sine * distanceVect.x;

        // rotate Temporary velocities
        let vTemp = [createVector(), createVector()];

        vTemp[0].x = cosine * this.velocity.x + sine * this.velocity.y;
        vTemp[0].y = cosine * this.velocity.y - sine * this.velocity.x;
        vTemp[1].x = cosine * other.velocity.x + sine * other.velocity.y;
        vTemp[1].y = cosine * other.velocity.y - sine * other.velocity.x;

        /* Now that velocities are rotated, you can use 1D
         conservation of momentum equations to calculate 
         the final velocity along the x-axis. */
        let vFinal = [createVector(), createVector()];

        // final rotated velocity for b[0]
        vFinal[0].x =
          ((this.m - other.m) * vTemp[0].x + 2 * other.m * vTemp[1].x) /
          (this.m + other.m);
        vFinal[0].y = vTemp[0].y;

        // final rotated velocity for b[0]
        vFinal[1].x =
          ((other.m - this.m) * vTemp[1].x + 2 * this.m * vTemp[0].x) /
          (this.m + other.m);
        vFinal[1].y = vTemp[1].y;

        // hack to avoid clumping
        bTemp[0].x += vFinal[0].x;
        bTemp[1].x += vFinal[1].x;

        /* Rotate ball positions and velocities back
         Reverse signs in trig expressions to rotate 
         in the opposite direction */
        // rotate balls
        let bFinal = [createVector(), createVector()];

        bFinal[0].x = cosine * bTemp[0].x - sine * bTemp[0].y;
        bFinal[0].y = cosine * bTemp[0].y + sine * bTemp[0].x;
        bFinal[1].x = cosine * bTemp[1].x - sine * bTemp[1].y;
        bFinal[1].y = cosine * bTemp[1].y + sine * bTemp[1].x;

        // update balls to screen position
        if (other.is_moving) {
          other.position.x = this.position.x + bFinal[1].x;
          other.position.y = this.position.y + bFinal[1].y;
        }
        this.position.add(bFinal[0]);

        // update velocities
        if (other.is_moving) {
          this.velocity.x = cosine * vFinal[0].x - sine * vFinal[0].y;
          this.velocity.y = cosine * vFinal[0].y + sine * vFinal[0].x;
          other.velocity.x = cosine * vFinal[1].x - sine * vFinal[1].y;
          other.velocity.y = cosine * vFinal[1].y + sine * vFinal[1].x;
        }
        if (other.is_sick && !this.cannot_spread && !other.cannot_spread) {
          this.is_sick = true;
          if (!this.time_of_sickness) {
            this.time_of_sickness = millis();
            sick_count++;
            healty_count--;
          }
        }
        if (this.is_sick && !other.cannot_spread && !this.cannot_spread) {
          other.is_sick = true;
          if (!other.time_of_sickness) {
            other.time_of_sickness = millis();
            sick_count++;
            healty_count--;
          }
        }
      }
    }
  }

  display() {
    fill(204);
    stroke(0);
    if (this.is_sick) {
      fill(255, 0, 0);
    }
    if (this.cannot_spread) {
      stroke(255, 255, 0);
    }
    if (this.is_dead) {
      fill(0);
    }
    if (this.is_recovered) {
      fill(0, 0, 255);
    }

    ellipse(this.position.x, this.position.y, this.radius * 2, this.radius * 2);
  }
}

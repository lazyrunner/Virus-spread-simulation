int window_x = 1600;
int window_y = 1000;
int number_of_balls = 37;
float probabilty_of_sick = 10;
float probabilty_of_quar = 50;
float probaility_at_home = 75;
Ball[] balls = new Ball[number_of_balls];
float RADIU = 20;
boolean pause = false;
float time_to_death = 10000;
float recovery_probabilty = 50;

int sick_count = 0;
int dead_count = 0;
int recovered_count = 0;
int healty_count = number_of_balls;
 
 
void setup() {
  int placed_balls = 1;
  float x = random(0,window_x-RADIU);
  float y = random(0,window_y-RADIU);
  float at_home = random(100);
  float quar = random(100);
  float sick = random(100);
  if(quar < probabilty_of_quar){
    balls[0] = new Ball(x,y,false,sick<probabilty_of_sick,at_home<probaility_at_home);  
  } else {
    balls[0] = new Ball(x,y,true,sick<probabilty_of_sick,false);
  }
  
  while (placed_balls < number_of_balls) {
    x = random(0,window_x-RADIU);
    y = random(0,window_y-RADIU);
    boolean placeit = true;
    int ball_hit=0;
    for (int i = 0 ; i<placed_balls;i++){
      if((x > balls[i].position.x-RADIU && x < balls[i].position.x+RADIU) || (y > balls[i].position.y-RADIU && y < balls[i].position.y+RADIU)){
        placeit = false;
        ball_hit=i;
        break;
      }
    }
    if(placeit){
      println("ball"+placed_balls);
      at_home = random(100);
      quar = random(100);
      sick = random(100);
      if(quar<probabilty_of_quar){
        balls[placed_balls] = new Ball(x,y,false,sick<probabilty_of_sick,at_home<probaility_at_home);  
      } else {
        balls[placed_balls] = new Ball(x,y,true,sick<probabilty_of_sick,false);
      }
      println("\tx :"+balls[placed_balls].position.x);
      println("\ty :"+balls[placed_balls].position.y);
      println("\tquar:"+quar);
      println("\tsick :"+sick);
      placed_balls++;
    } else {
      println("Tried x:"+x+" y:"+y+" hit ball:"+ball_hit);
    }
  }
  size(1800, 1000);
}

void draw() {
  background(51);

  for (Ball b : balls) {
    if(!pause) b.update();
    b.display();
    if(!pause) b.checkBoundaryCollision();
  }
  if(!pause){
    
  for (int i = 0; i < balls.length; i++) {
    for (int j = 0; j < balls.length; j++) {
      balls[i].checkCollision(balls[j]);    
    }
  }
  }
  textSize(25);
  text("Total: "+number_of_balls,window_x+10,30);
  text("Healthy: "+healty_count,window_x+10,60);
  text("Sick: "+sick_count,window_x+10,90);
  text("Dead: "+dead_count,window_x+10,120);
  text("Recovered: "+recovered_count,window_x+10,150);
  
}

void keyPressed() {
  if ( key == 32  ){
    pause = !pause;
    println("pause: "+pause);
  }
  
}





class Ball {
  PVector position;
  PVector velocity;
  boolean is_moving;
  boolean is_sick;
  boolean cannot_spread;
  float time_of_sickness=-1;
  boolean is_dead = false;
  float radius, m;
  boolean is_recovered = false;

  Ball(float x, float y, boolean _is_moving, boolean _is_sick, boolean _cannot_spread) {
    position = new PVector(x, y);
    velocity = PVector.random2D();
    if(_is_moving){
         velocity.mult(2);
    } else {
      velocity.mult(0);
    }
    radius = RADIU;
    m = radius*.1;
    is_moving = _is_moving;
    is_sick = _is_sick;
    cannot_spread = _cannot_spread;
    if(is_sick){
      time_of_sickness = millis();
      sick_count++;
      healty_count--;
    }
  }

  void update() {
    position.add(velocity);
    if(is_sick && !is_dead){
      if(millis() - time_of_sickness > time_to_death){
            is_dead = true;
            cannot_spread = true;
            dead_count++;
            if(random(100) < recovery_probabilty){
              recovered_count++;
              dead_count--;
              healty_count++;
              is_recovered = true;
            }
            sick_count--;
      }
    }
  }

  void checkBoundaryCollision() {
    if(is_moving){
      if (position.x > window_x-radius) {
        position.x = window_x-radius;
        velocity.x *= -1;
      } else if (position.x < radius) {
        position.x = radius;
        velocity.x *= -1;
      } else if (position.y > window_y-radius) {
        position.y = window_y-radius;
        velocity.y *= -1;
      } else if (position.y < radius) {
        position.y = radius;
        velocity.y *= -1;
      }
    }
  }

  void checkCollision(Ball other) {
    if(is_moving){

    // Get distances between the balls components
      PVector distanceVect = PVector.sub(other.position, position);
  
      // Calculate magnitude of the vector separating the balls
      float distanceVectMag = distanceVect.mag();
  
      // Minimum distance before they are touching
      float minDistance = radius + other.radius;
  
      if (distanceVectMag < minDistance) {
        float distanceCorrection = (minDistance-distanceVectMag)/2.0;
        PVector d = distanceVect.copy();
        PVector correctionVector = d.normalize().mult(distanceCorrection);
        if(other.is_moving){
          other.position.add(correctionVector);
        }
        position.sub(correctionVector);
  
        // get angle of distanceVect
        float theta  = distanceVect.heading();
        // precalculate trig values
        float sine = sin(theta);
        float cosine = cos(theta);
  
        /* bTemp will hold rotated ball positions. You 
         just need to worry about bTemp[1] position*/
        PVector[] bTemp = {
          new PVector(), new PVector()
        };
  
        /* this ball's position is relative to the other
         so you can use the vector between them (bVect) as the 
         reference point in the rotation expressions.
         bTemp[0].position.x and bTemp[0].position.y will initialize
         automatically to 0.0, which is what you want
         since b[1] will rotate around b[0] */
        bTemp[1].x  = cosine * distanceVect.x + sine * distanceVect.y;
        bTemp[1].y  = cosine * distanceVect.y - sine * distanceVect.x;
  
        // rotate Temporary velocities
        PVector[] vTemp = {
          new PVector(), new PVector()
        };
  
        vTemp[0].x  = cosine * velocity.x + sine * velocity.y;
        vTemp[0].y  = cosine * velocity.y - sine * velocity.x;
        vTemp[1].x  = cosine * other.velocity.x + sine * other.velocity.y;
        vTemp[1].y  = cosine * other.velocity.y - sine * other.velocity.x;
  
        /* Now that velocities are rotated, you can use 1D
         conservation of momentum equations to calculate 
         the final velocity along the x-axis. */
        PVector[] vFinal = {  
          new PVector(), new PVector()
        };
  
        // final rotated velocity for b[0]
        vFinal[0].x = ((m - other.m) * vTemp[0].x + 2 * other.m * vTemp[1].x) / (m + other.m);
        vFinal[0].y = vTemp[0].y;
  
        // final rotated velocity for b[0]
        vFinal[1].x = ((other.m - m) * vTemp[1].x + 2 * m * vTemp[0].x) / (m + other.m);
        vFinal[1].y = vTemp[1].y;
  
        // hack to avoid clumping
        bTemp[0].x += vFinal[0].x;
        bTemp[1].x += vFinal[1].x;
  
        /* Rotate ball positions and velocities back
         Reverse signs in trig expressions to rotate 
         in the opposite direction */
        // rotate balls
        PVector[] bFinal = { 
          new PVector(), new PVector()
        };
  
        bFinal[0].x = cosine * bTemp[0].x - sine * bTemp[0].y;
        bFinal[0].y = cosine * bTemp[0].y + sine * bTemp[0].x;
        bFinal[1].x = cosine * bTemp[1].x - sine * bTemp[1].y;
        bFinal[1].y = cosine * bTemp[1].y + sine * bTemp[1].x;
  
        // update balls to screen position
        if(other.is_moving){
          other.position.x = position.x + bFinal[1].x;
          other.position.y = position.y + bFinal[1].y;
        }
        position.add(bFinal[0]);
  
        // update velocities
        if(other.is_moving){
          velocity.x = cosine * vFinal[0].x - sine * vFinal[0].y;
          velocity.y = cosine * vFinal[0].y + sine * vFinal[0].x;
          other.velocity.x = cosine * vFinal[1].x - sine * vFinal[1].y;
          other.velocity.y = cosine * vFinal[1].y + sine * vFinal[1].x;
        }
        if(other.is_sick && !cannot_spread && !other.cannot_spread){
          is_sick = true;
          if(time_of_sickness<0){
            time_of_sickness = millis();
            sick_count++;
            healty_count--;
          }
        }
        if(is_sick  && !other.cannot_spread && !cannot_spread){
              other.is_sick = true;
              if(other.time_of_sickness<0){
                other.time_of_sickness = millis();
                sick_count++;
                healty_count--;
              }
        }
        
      }
    }
    
    
  }

  void display() {
    fill(204);
    stroke(0);
    if(is_sick){
      fill(255,0,0);
    }
    if(cannot_spread){
      stroke(255,255,0);
    }
    if(is_dead){
      fill(0);
    }
    if(is_recovered){
      fill(0,0,255);
    }
    
    ellipse(position.x, position.y, radius*2, radius*2);
  }
}

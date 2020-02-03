import Vector from './vector'
import {guidGenerator, getRandomFrom} from '../utils'
import {GAME_HEIGHT, GAME_WIDTH, DISTANCE_IN_MS} from '../constants'

const LEFT = new Vector(-1, 0);
const RIGHT = new Vector(1, 0);
const UP = new Vector(0, -1);
const DOWN = new Vector(0, 1);
const LEFT_UP = LEFT.add(UP).normalize();
const RIGHT_UP = RIGHT.add(UP).normalize();
const LEFT_DOWN = LEFT.add(DOWN).normalize();
const RIGHT_DOWN= RIGHT.add(DOWN).normalize();

class Ball {
    constructor(x,y, angle, radius, id){
      this.center = new Vector(x, y);
      this.direction = angle;
      this.radius = radius;
      this.id = id;
    }
}

export class BallPhysics {
    constructor() {
      this.ballsArray = [];
      this.markerBall = new Ball(GAME_WIDTH / 2, GAME_HEIGHT - ( 1 / 5), getRandomFrom(LEFT_UP, RIGHT_UP), 1/5, 0);
      this.firstBall = false;
      this.isStarted = false;
    }
  
  
    reset() {
      this.firstBall = false;
      this.isStarted = false;
    }

    addBall(angle){
      if(Number.isNaN(angle.x) || Number.isNaN(angle.y)){}//check if ball is valid
        else{
          //TODO add ball size as variable
          let id = guidGenerator();
          let newBall = new Ball(this.markerBall.center.x, this.markerBall.center.y, angle, 1/5, id);
          this.ballsArray.push(newBall);
          this.isStarted = true;
      }
    }
  
    boundaryCheck = (objectSide, objectSide2, boundarySide, boundarySide2) => (
        (objectSide >= boundarySide && objectSide <= boundarySide2) ||
        (objectSide2 >= boundarySide && objectSide2 <= boundarySide2)  
    )


    //We will update physics passing in the block state, and then returning updated block and ball state to render
    updatePhysics(state, timespan){
        this.ballsArray.forEach(ball => {
          const { level } = state
          const distance = timespan * DISTANCE_IN_MS
          var ballIndex = this.ballsArray.findIndex(x => x.id == ball.id);
          const { radius } = ball
          const oldDirection = ball.direction
          const newBallCenter = ball.center.add(oldDirection.scaleBy(distance))
          const ballBottom = newBallCenter.y + radius
  
          // Delete if above gameheight 
          if (ballBottom > GAME_HEIGHT) {
            //check if its the first ball to hit the bottom
            if (this.firstBall === false) {
              this.firstBall = true;
              this.markerBall = new Ball(ball.center.x, GAME_HEIGHT - (1/5), {x: 0, y: 0}, 1/5, 0)
            }
            //filter out this element
            let newArray = this.ballsArray.filter(filterBall => filterBall.id != ball.id);
            return (this.ballsArray = newArray);
          }
          
          const withNewBallProps = props => {
              this.ballsArray[ballIndex] = {
                ...ball,
                ...props
              }
            return;
          }
  
          const withNewBallDirection = normal => {
            //  const distorted = distortVector(oldDirection.reflect(normal))
            //  const direction = adjustVector(normal, distorted)
            const direction = oldDirection.reflect(normal);
            return withNewBallProps({ direction }) 
          }
          const ballLeft = newBallCenter.x - radius
          const ballRight = newBallCenter.x + radius
          const ballTop = newBallCenter.y - radius
      
          if (ballTop <= 0) return withNewBallDirection(DOWN)
          if (ballLeft <= 0) return withNewBallDirection(RIGHT)
          if (ballRight >= GAME_WIDTH) return withNewBallDirection(LEFT)
        
          const block = level.levelList.find(({ position, width, height }) => (
            this.boundaryCheck(ballTop, ballBottom, position.y, position.y + height) &&
            this.boundaryCheck(ballLeft, ballRight, position.x, position.x + width) 
          ))
      
      
          if (block) {
            block.density = block.density - 1
            if (block.density <= 0){
              let newArray = state.level.levelList.filter(filterBlock => filterBlock.id != block.id);
              state.level.levelList = newArray;
            }
            const getNewBallNormal = () => {
  
              const blockTop = block.position.y
              const blockBottom = blockTop + block.height
              const blockLeft = block.position.x
                //if in between bottom and top
              if (ballTop > blockTop - radius && ballBottom < blockBottom + radius) {
                if (ballLeft < blockLeft) return LEFT
                if (ballRight > blockLeft + block.width) return RIGHT;
              }
            //else 
            //Handle bottom corners
            if (ballTop>blockTop && ballLeft < blockLeft) return getRandomFrom(LEFT, DOWN);
            if (ballTop>blockTop && ballRight > blockLeft + block.width) return getRandomFrom(RIGHT, DOWN); 
              //handle bottom
            if (ballTop > blockTop) return DOWN
              //handle top corners
            if (ballTop <= blockTop && ballLeft < blockLeft) return getRandomFrom(LEFT, DOWN);
            if (ballTop <= blockTop && ballRight > blockLeft + block.width) return getRandomFrom(RIGHT, DOWN);
              //handle top
            if (ballTop <= blockTop) return UP;

            }
            return {
              ...withNewBallDirection(getNewBallNormal())
            }
          }
          return withNewBallProps({ center: newBallCenter })
        })
  
        return state;
    }
  }
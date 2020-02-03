import Vector from "./vector";
import {getRandomFrom, guidGenerator} from '../utils'
import {GAME_HEIGHT, GAME_WIDTH} from '../constants'

import {Levels} from './levels';
//Game core puts size and positions in relative to game size which then gets projected to the actual size


const DISTANCE_IN_MS = 0.01

export const MOVEMENT = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
}

const LEFT = new Vector(-1, 0)
const RIGHT = new Vector(1, 0)
const UP = new Vector(0, -1)
const DOWN = new Vector(0, 1)

export const LEFT_UP = LEFT.add(UP).normalize()
export const RIGHT_UP = RIGHT.add(UP).normalize()

/**
 * @function getInitialPaddleAndBallState - Returns the initial state of Paddle and Ball
 * @param {Number} gameWidth Game nonprojected width
 * @param {Number} gameHeight Game nonprojected Height
 * @param {Number} paddleWidth Width of the paddle per level.
 * @returns {JSON} Returns paddle and ball state
 */
export const getInitialBallPosition = (gameWidth, gameHeight) => {
    const ball = {
        center: new Vector(GAME_WIDTH / 2, GAME_HEIGHT - ( 1 / 5)),
        radius: 1 / 5,
        direction: getRandomFrom(LEFT_UP, RIGHT_UP)
      }
    return {
        ball
    }
}


export const getInitialLevelState = () => 
{   
    let level = new Levels();
    level.addLevel(1);
    return {
        level: level
      }
}


export const getInitialBallState = () => {
  let balls = new BallPhysics();
  return balls;
}

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
    //TODO: to add a ball, add a new Ball, based off of markerBall X, and Y position, along with angle we are launching from
    //TODO: then we can update physics on each Ball, every iteration
    /*Some special things need to happen in physics, like identifying the first one down.
    * Once the first one is down, we use the same kind of thing, where we make marker ball, the X position and 
    * reset Y position to Game height -  ball radius which is 1/5
    */
    if(Number.isNaN(angle.x) || Number.isNaN(angle.y)){}
      else{
        //TODO add angle calculation here
        let id = guidGenerator();
        console.log(angle);
        console.log(this.markerBall.center.x);
        let newBall = new Ball(this.markerBall.center.x, this.markerBall.center.y, angle, 1/5, id);
        this.ballsArray.push(newBall);
        this.isStarted = true;
    }
  }

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
          boundaryCheck(ballTop, ballBottom, position.y, position.y + height) &&
          boundaryCheck(ballLeft, ballRight, position.x, position.x + width) 
        ))
    
    
        if (block) {
          block.density = block.density - 1
          if (block.density <= 0){
            let newArray = state.level.levelList.filter(filterBlock => filterBlock.id != block.id);
            state.level.levelList = newArray;
          }
          // const newBlock = { ...block, density }
          // const blocks = density < 0 ? withoutElement(state.blocks, block) : updateElement(state.blocks, block, newBlock)
          const getNewBallNormal = () => {

            const blockTop = block.position.y
            const blockBottom = blockTop + block.height
            const blockLeft = block.position.x

            if (ballTop > blockTop - radius && ballBottom < blockBottom + radius) {
              if (ballLeft < blockLeft) return LEFT
              if (ballRight > blockLeft + block.width) return RIGHT
            }

            if (ballTop > blockTop) return DOWN
            if (ballTop <= blockTop) return UP

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


/**
 * @function getProjection - gets the scaling size for the screen and container size
 * @param {*} containerSize - Size of the container {width: number, height: number}
 * @param {*} gameSize - Game Size to be projected on the container {width: number, height: number}
 * @returns {Function} - Returns two functions projectDistance, and projectVector
 */

export const getProjection = (containerSize, gameSize) => {
    //Find the ratios between width and height compare to find the smallest
    const widthRatio = containerSize.width / GAME_WIDTH
    const heightRatio = containerSize.height / GAME_HEIGHT;
    const screenUnit = Math.min(heightRatio, widthRatio);
    return {
        /**
         * @function projectDistance - projects the distance onto the current screen size
         * @param {Number} distance - distance to project
         * @returns {Number} returns the position on screen
         */

        projectDistance: distance => distance * screenUnit,
        projectDistanceReverse : distance => distance / screenUnit,
        /**
         * @function projectVector - projects the distance onto the current screen size
         * @param {Vector} vector - vector to project to screen size
         * @returns {Vector} returns scaled vector
         */
        projectVector: vector => vector.scaleBy(screenUnit),
        projectVectorReverse: vector => vector.scaleBy(1 / screenUnit)

    }
}


/**
 * @function distortVector - adds randomness to a vector
 * @param {*} vector -input vector to distort
 * @param {*} distortionLevel - Amount to distort
 */

const distortVector = (vector, distortionLevel = 0.3) => {
    //get random components for the vector based on distortion level and create a new vector
    const getComponent = () => Math.random() * distortionLevel - distortionLevel / 2
    const distortion = new Vector(getComponent(), getComponent());
    //add it to the vector and normalize it.
    return vector.add(distortion).normalize()
}


/**
 * @function boundaryCheck - checks if we are inside another objects boundaries
 * @param {*} objectSide -Object we are checking side 1
 * @param {*} objectSide2 -object checking side 2
 * @param {*} boundarySide - boundary object side 1
 * @param {*} boundarySide2 - boundary object side 2
 */
const boundaryCheck = (objectSide, objectSide2, boundarySide, boundarySide2) => (
    (objectSide >= boundarySide && objectSide <= boundarySide2) ||
    (objectSide2 >= boundarySide && objectSide2 <= boundarySide2)  
)

/**
 * @function adjustVector - Adjusts ball so it never goes below certain degrees +90 and -90 degrees
 */
const adjustVector = (normal, vector, minAngle = 15) => {
    const angle = normal.angleBetween(vector)
    const maxAngle = 90 - minAngle
    if (angle < 0) {
      if (angle > -minAngle) {
        return normal.rotate(-minAngle)
      }
      if (angle < -maxAngle) {
        return normal.rotate(-maxAngle)
      }
    } else {
      if (angle < minAngle) {
        return normal.rotate(minAngle)
      }
      if (angle > maxAngle) {
        return normal.rotate(maxAngle)
      }
    }
    return vector
}

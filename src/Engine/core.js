import Vector from "./vector";
import {getRandomFrom} from '../utils'
import {GAME_HEIGHT, GAME_WIDTH} from '../constants'

import {Levels} from './levels';
//Game core puts size and positions in relative to game size which then gets projected to the actual size


const DISTANCE_IN_MS = 0.005

export const MOVEMENT = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
}

const LEFT = new Vector(-1, 0)
const RIGHT = new Vector(1, 0)
const UP = new Vector(0, -1)
const DOWN = new Vector(0, 1)

const LEFT_UP = LEFT.add(UP).normalize()
const RIGHT_UP = RIGHT.add(UP).normalize()

/**
 * @function getInitialPaddleAndBallState - Returns the initial state of Paddle and Ball
 * @param {Number} gameWidth Game nonprojected width
 * @param {Number} gameHeight Game nonprojected Height
 * @param {Number} paddleWidth Width of the paddle per level.
 * @returns {JSON} Returns paddle and ball state
 */
export const getInitialBallPosition = (gameWidth, gameHeight) => {
    //TODO: turn the paddle area and ball radius into constants
    const ball = {
        center: new Vector(GAME_WIDTH / 2, GAME_HEIGHT - ( 1 / 5)),
        radius: 1 / 5,
        direction: getRandomFrom(LEFT_UP, RIGHT_UP)
      }

    return {
        ball
    }
}

export const getGroundedBallPosition = (ballX) => {
 
  let ball = {
      center: new Vector(ballX, GAME_HEIGHT - (1/5)),
      radius: 1 / 5,
      direction: getRandomFrom(LEFT_UP, RIGHT_UP)
    }

  console.log(ball);
  return ball;
}


class Ball {
  constructor(x,y, angle, radius){
    this.center = new Vector(x, y);
    this.direction = angle
    this.radius = radius;
  }
}

class BallPhysics {
  constructor() {
    this.ballsArray = [];
    this.markerBall = new Ball(GAME_WIDTH / 2, GAME_HEIGHT - ( 1 / 5), getRandomFrom(LEFT_UP, RIGHT_UP), 1/5);
  }

  addBall(angle){
    //TODO: to add a ball, add a new Ball, based off of markerBall X, and Y position, along with angle we are launching from
    //TODO: then we can update physics on each Ball, every iteration
    /*Some special things need to happen in physics, like identifying the first one down.
    * Once the first one is down, we use the same kind of thing, where we make marker ball, the X position and 
    * reset Y position to Game height -  ball radius which is 1/5
    */
  }

  //We will update physics passing in the block state, and then returning updated block and ball state to render
  updatePhysics(state){
      this.ballsArray.forEach(ball => {
        
      })
  }



}





export const getInitialLevelState = () => 
{   
    let level = new Levels();
    level.addLevel(1);
    return {
        level: level,
        ...getInitialBallPosition()
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
        projectVector: vector => vector.scaleBy(screenUnit)
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
 * @function updatePaddlePosition - gets the new position of the paddle
 * @param {*} paddle - contains {positon: Vector, width, height} as paddle paramaters
 * @param {*} size - size of the play area in blocks
 * @param {*} distance - distance that it can move a tick
 * @param {*} movement - Are we moving?
 * @returns {JSON} - Returns paddle with update position
 */
const updatePaddlePosition = (paddle, size, distance, movement) => {
    //If we have no movement, return paddle
    if(!movement) return paddle;
    const movementDirection =  movement === MOVEMENT.LEFT ? LEFT : RIGHT
    //calculate new position
    const { x } = paddle.position.add(movementDirection.scaleBy(distance)) 
    
    const returnNewPosition = (x) => ({
        ...paddle,
        position: new Vector(x, paddle.position.y)
    })
    
    //Check if it falls off any of the edges
    if (x < 0) {
        return returnNewPosition(0);
    }
    if (x + paddle.width > size.width){
        return returnNewPosition(size.width - paddle.width);
    }

    return returnNewPosition(x);
}


const getNewAngle = (Ball, Mouse) => {
  //TODO: pythagorean theorem on 3 points ([BallX, BallY], [MouseX, MouseY], [MouseX, BallY])

  const distanceFormula = (x1,y1,x2,y2) => {
    return Math.sqrt(((x2 - x1)^2) + ((y2-y1)^2)).toFixed(3);
  }
  var hypoDistance = distanceFormula(Mouse.x, Mouse.y, Ball.x, Ball.y); //this is the hypo of the right triangle
  var leg1Distance = distanceFormula(Ball.x, Ball.y, Mouse.x, Ball.y); //This the the horizontal (ball) ------- (mouseX, ballY)
  var leg2Distance = distanceFormula(Mouse.x, Mouse.y, Mouse.x, Ball.y); //this is the vertical leg from mouse to bottom

  let mouseAngle = (leg2Distance / hypoDistance).toFixed(3);

  console.log(mouseAngle);

  
}




// const updatePaddlePositionMouse = (paddle, gameSize, containerSize, oldMousePosition, newMousePosition, projectDistanceReverse) => {
//   if(oldMousePosition === newMousePosition) return paddle;
//   const  x  = projectDistanceReverse(newMousePosition.mouseX);
//   const returnNewPosition = (newMousePosition) =>({
//         ...paddle,
//         position: new Vector(x, paddle.position.y)
//     })

//     //Check if it falls off any of the edges
//   if (x < 0) {
//       return returnNewPosition(0);
//   }
//   if (x + paddle.width > gameSize.width){
//       return returnNewPosition(gameSize.width - paddle.width);
//   }

// }



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
/**
 * @function updateGameState - update the game state
 * @param {*} state - current game state
 * @param {*} movement - is the paddle moving
 * @param {*} timespan - time between last update and now
 * @returns {*} - new state of the game
 */


export const updateGameState = (state, timespan) => {
    //Step 1: Update Position of the paddle from current state

    const { ball, level } = state
    const distance = timespan * DISTANCE_IN_MS

    const { radius } = state.ball
    const oldDirection = state.ball.direction
    const newBallCenter = state.ball.center.add(oldDirection.scaleBy(distance))
    const ballBottom = newBallCenter.y + radius

    if (ballBottom > GAME_HEIGHT) {

      return {
        ...state,
        ball: {
          ...getGroundedBallPosition(ball.center.x)
        },
        shouldMakeNewLevel: true
      }
    }
    
    const withNewBallProps = props => ({
      ...state,
      ball: {
        ...state.ball,
        ...props
      }
    })
  
    const withNewBallDirection = normal => {
      const distorted = distortVector(oldDirection.reflect(normal))
      const direction = adjustVector(normal, distorted)
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
      // const density = block.density - 1
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

}

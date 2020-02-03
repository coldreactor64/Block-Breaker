import Vector from "./vector";
import {getRandomFrom, guidGenerator} from '../utils'
import {GAME_HEIGHT, GAME_WIDTH} from '../constants'
import {BallPhysics} from './ballphysics'
import {Levels} from './levels';
//Game core puts size and positions in relative to game size which then gets projected to the actual size



/**
 * @function getInitialPaddleAndBallState - Returns the initial state and Ball
 * @param {Number} gameWidth Game nonprojected width
 * @param {Number} gameHeight Game nonprojected Height
 * @param {Number} paddleWidth Width of the paddle per level.
 * @returns {JSON} Returns paddle and ball state
 */
// export const getInitialBallPosition = (gameWidth, gameHeight) => {
//     const ball = {
//         center: new Vector(GAME_WIDTH / 2, GAME_HEIGHT - ( 1 / 5)),
//         radius: 1 / 5,
//         direction: getRandomFrom(LEFT_UP, RIGHT_UP)
//       }
//     return {
//         ball
//     }
// }


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

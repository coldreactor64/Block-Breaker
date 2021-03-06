import { MOVEMENT, updateGameState, getProjection, RIGHT_UP, LEFT_UP } from '../Engine/core'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants'
import Vector from '../Engine/vector'

 
export const ACTION = {
    CONTAINER_SIZE_CHANGE: 'CONTAINER_SIZE_CHANGE',
    KEY_UP: 'KEY_UP',
    MOUSE_MOVE: 'MOUSE_MOVE',
    TICK: 'TICK'
  }
  
 /** Game Constants */
  const MOVEMENT_KEYS = {
    LEFT: [65, 37, "ArrowLeft"],
    RIGHT: [68, 39, "ArrowRight"]
  }

  const STOP_KEY = 32

export const reducer = (state, { type, payload }) => {
    switch(type) {
        case ACTION.CONTAINER_SIZE_CHANGE:
            return containerSizeChange(state, payload);
        case ACTION.KEY_UP:
            return onKeyUp(state, payload);
        case ACTION.AIMING:
            return aimBalls(state, payload)
        case ACTION.MOUSE_MOVE:
            return mouseMove(state, payload);
        case ACTION.TICK:
            return tick(state); 
        default:
             return state;
    }
  }
  
const containerSizeChange = (state, containerSize)=> ({
    ...state,
    containerSize,
    ...getProjection(containerSize, {x: GAME_WIDTH, y: GAME_HEIGHT})
  })

const aimBalls = (state, props) => {
  state.isAiming = false;
  for (let i = 0; i < state.levelNumber - 1; i++) {
      setTimeout((i) => {
        // console.log(props.angle);
        state.ball.addBall(new Vector(Math.cos(props.angle), Math.sin(props.angle)));
      }, 100 * i);
  }
  return state;
}
const mouseMove = (state, mousePosition) => {
    return {
        ...state,
        oldMousePosition: state.newMousePosition,
        newMousePosition: mousePosition
    }
  }
const onKeyUp = (state, key) => {
    const newState = { ...state, movement: undefined }
    return newState
}

const tick = (state) => {
    if (state.isAiming) return state;
    const time = Date.now()
    // let newState = updateGameState({...state}, time - state.time)
    let newState = state.ball.updatePhysics(state, (time - state.time));
    if (newState.ball.isStarted && newState.ball.ballsArray.length === 0){
      newState.ball.isStarted = false;
      newState.level.addLevel();
      newState.isAiming = true;
      newState.levelNumber++;
      newState.ball.reset();
    }
    newState = { ...newState, time }
    return { ...newState }
}

 
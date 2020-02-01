import { MOVEMENT, updateGameState, getProjection, RIGHT_UP } from '../Engine/core'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants'

 
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

const aimBalls = (state, key) => {
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
    if (key === STOP_KEY) {
       if (state.isAiming === true) {
        return { ...newState, isAiming: false, time: Date.now()}
      } else {
        return { ...newState, isAiming: true }
      }
    }
    return newState
}

const tick = (state) => {
    if (state.isAiming) return state;
    const time = Date.now()
    let newState = updateGameState({...state}, time - state.time)
    state.newBalls.updatePhysics(state, time - state.time);

    newState = { ...newState, time }
    //console.log(newState);
    if(newState.shouldMakeNewLevel === true){
      newState.shouldMakeNewLevel = false;
      newState.level.addLevel();
    }
    return { ...newState }
}

 
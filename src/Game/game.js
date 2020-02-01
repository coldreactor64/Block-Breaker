import React, { useRef, useEffect, useState, useReducer } from 'react'
import {registerListener, getRandomFrom} from '../utils'
import {GameBall, Block} from './gameComponents'
import { getInitialLevelState, getProjection, getInitialBallPosition, getInitialBallState, RIGHT_UP, LEFT_UP } from '../Engine/core'
import {reducer, ACTION} from './state'
import {UPDATE_EVERY, GAME_WIDTH, GAME_HEIGHT} from '../constants'


export const GamePage = () => {
    const gameContainer = useRef();
    const [size, setSize] = useState();
    const [mouse, setMouse] = useState({x: 0, y: 0});
    useEffect(() => {
      //TODO: Optimize the calls for listeners
        const onResize = ()=>{
            //On resize get the current size ofthe screen and set it
            const {width, height} = gameContainer.current.getBoundingClientRect(); 
            setSize({width, height})
        }
        const unregisterResizeListener = registerListener('resize', onResize);

        const onMouseOver = (e) => {
          setMouse({x: e.clientX, y: e.clientY})
        }

        const unregisterMouseMoveListener = registerListener('mousemove',(e)=> onMouseOver(e));

        const onMouseDown = (e) => {
        }
        const unregisterMouseDownListener = registerListener('mousedown',(e)=> onMouseDown(e));

        const onMouseUp = (e) => {
        }
        const unregisterMouseUpListener = registerListener('mousedown',(e)=> onMouseUp(e));
        onResize();

        return {unregisterResizeListener, unregisterMouseMoveListener, unregisterMouseDownListener, unregisterMouseUpListener}; //unregister the listener when not rendered anymore
    }, [])


    return (
        <div className = 'page'>
            <div className = 'scene-container' ref = {gameContainer}>
                {size && <Scene width = {size.width} height = {size.height} mouse = {mouse} />}
            </div>
        </div>
    )

    // {size && makes it not render at first, only when we have the size}
}

/**
 * @function getSavedLevel - gets the current level saved in local storage, or if none 0
 * @returns {Number} - returns the level saved in local storage
 */
const getSavedLevel = () => {
    const inState = localStorage.getItem('level')
    return inState ? parseInt(inState, 10) : 0
  }
  
  /**
   * @function getInitialState - gets the inital state of the level
   * @param {*} containerSize 
   * @returns State 
   */
  const getInitialState = containerSize => {
    //const level = getSavedLevel(); //Grabs level we're at
    const {level, ball} = getInitialLevelState();
    const newBall = getInitialBallState();
    const { projectDistance, projectVector, projectDistanceReverse } = getProjection(containerSize, {x: GAME_WIDTH, y: GAME_HEIGHT});
    let addingBalls = setInterval(()=> {
      newBall.addBall(getRandomFrom(RIGHT_UP, LEFT_UP));
    }, 500)

    return {
      level,
      ball,
      newBalls: newBall,
      containerSize,
      projectDistance,
      projectVector,
      projectDistanceReverse,
      oldMousePosition: 0,
      newMousePosition: 0,
      levelNumber: 2,
      time: Date.now(),
      isAiming: true,
      movement: undefined
    }
  }
  
  /**
   * @param {props} props - width and height props
   */
  const Scene = (props) => {
    //UseReducer to manage state like redux
    const [state, dispatch] = useReducer(reducer, props, getInitialState)
    //act as an action dispatcher to the state, for useReducer
    const act = (type, payload) => dispatch({ type, payload })

    //Extract each component from the current State
    const {
      projectDistance,
      projectVector,
      projectDistanceReverse,
      level,
      ball,
    } = state;
    //when the size of the screen size changes, update container size.
    useEffect(() => act(ACTION.CONTAINER_SIZE_CHANGE, {width: props.width, height: props.height}),
    [props.width, props.height]);

    
    useEffect(()=>{
      
      act(ACTION.AIMING, {mouseX: props.mouse.x});
      
      },[props.mouse.x]);




    useEffect(() => {
        const tick = () => act(ACTION.TICK, state)//Tick tock, update state
        const timerId = setInterval(tick, UPDATE_EVERY)//update state based on constant
        //see what pressed the keyboard, and what to do
        const onMouseDown = ({ which }) => act(ACTION.MOUSE_DOWN, which);
        const onKeyUp = ({ which }) => act(ACTION.KEY_UP, which)
        const unregisterKeydown = registerListener('MOUSE_DOWN', onMouseDown)
        const unregisterKeyup = registerListener('keyup', onKeyUp)
        //unregister when unmounting
        return () => {
        clearInterval(timerId)
        unregisterKeydown()
        unregisterKeyup()
        }
    }, [])
  
    //get current sizes for objects
    const viewWidth = projectDistance(GAME_WIDTH);
    const viewHeight = projectDistance(GAME_HEIGHT);
    const unit = projectDistance(ball.radius)
    return (
      <svg width={viewWidth} height={viewHeight} className='scene'>

          {state.level.levelList.map((props) => (
            <Block
              density={props.density}
              key={`${props.position.x}-${props.position.y}`}
              width={projectDistance(props.width)}
              height={projectDistance(props.height)}
              {...projectVector(props.position)}
            />)
          )}
          {
            state.newBalls.ballsArray.map((props)=> (<GameBall {...projectVector(props.center)} radius= {unit} key = {props.id}/>))
          }
        <GameBall {...projectVector(state.newBalls.markerBall.center)} radius={unit}/>
      </svg>
    )
  }
import React, { useRef, useEffect, useState, useReducer } from 'react'
import {registerListener,registerListenerByReference, getRandomFrom, mapNumbers} from '../utils'
import {GameBall, Block, trajectoryPointer} from './gameComponents'
import { getInitialLevelState, getProjection, getInitialBallPosition, getInitialBallState, RIGHT_UP, LEFT_UP } from '../Engine/core'
import {reducer, ACTION} from './state'
import {UPDATE_EVERY, GAME_WIDTH, GAME_HEIGHT} from '../constants'
import Vector from '../Engine/vector'


export const GamePage = () => {
    const gameContainer = useRef();
    const [size, setSize] = useState();
    const [mouse, setMouse] = useState({x: 0, y: 0});
    const [click, setClick] = useState(false);
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
          setClick(true);
        }
        const unregisterMouseDownListener = registerListener('mousedown',(e)=> onMouseDown(e));

        const onMouseUp = (e) => {
          setClick(false);
        }
        const unregisterMouseUpListener = registerListener('mouseup',(e)=> onMouseUp(e));
        onResize();

        return {unregisterResizeListener, unregisterMouseMoveListener, unregisterMouseDownListener, unregisterMouseUpListener}; //unregister the listener when not rendered anymore
    }, [])


    return (
        <div className = 'page'>
            <div className = 'scene-container' ref = {gameContainer}>
                {size && <Scene width = {size.width} height = {size.height} mouse = {mouse} click = {click} />}
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
    const {level} = getInitialLevelState();
    const ball = getInitialBallState();

    const { projectDistance, projectVector, projectDistanceReverse, projectVectorReverse } = getProjection(containerSize, {x: GAME_WIDTH, y: GAME_HEIGHT});
    

    return {
      level,
      ball: ball,
      containerSize,
      projectDistance,
      projectVector,
      projectDistanceReverse,
      projectVectorReverse,
      oldMousePosition: 0,
      newMousePosition: 0,
      levelNumber: 2,
      time: Date.now(),
      isAiming: true
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
    const svgContainer = useRef();
    const pointer = useRef();
    const ballPointer1 = useRef();
    const ballPointer2 = useRef();
    const ballPointer3 = useRef();
    const ballPointer4 = useRef();
    const ballPointer5 = useRef();

    const [mousePosition, setMousePosition] = useState({x:0, y: 0});
    const [ballAngle, setBallAngle] = useState({x:0, y: 0});

    //Extract each component from the current State
    const {
      projectDistance,
      projectVector,
      projectDistanceReverse,
      projectVectorReverse,
      level,
      isAiming
    } = state;

    const viewWidth = projectDistance(GAME_WIDTH);
    const viewHeight = projectDistance(GAME_HEIGHT);
    const unit = projectDistance((1/5))

    // let pointerCords = projectVector(state.ball.markerBall.center);
    let mouseVector = new Vector(props.mouse.x, props.mouse.y);
    let pointerCordX = projectDistanceReverse(mousePosition.x);
    let pointerCordY = projectDistanceReverse(mousePosition.y);
    let pointerCords = projectVector(new Vector(pointerCordX, pointerCordY));

    let lineCords = projectVector(state.ball.markerBall.center);



    //when the size of the screen size changes, update container size.
    useEffect(() => {
      act(ACTION.CONTAINER_SIZE_CHANGE, {width: props.width, height: props.height})
      console.log(props.width)
    },
    [props.width, props.height]);

    
    useEffect(()=>{
      if(props.click && state.isAiming) {
        act(ACTION.AIMING, {angle: ballAngle});
      }
      },[state.isAiming, props.click, ballAngle]);


      useEffect(()=> {
        const onMouseMove = (e)=>{
          setMousePosition({x: e.offsetX, y: e.offsetY})
          var newDegree = Math.atan2(e.offsetY - lineCords.y, e.offsetX - lineCords.x);
          setBallAngle(newDegree)
          rotateElement(ballPointer1.current, lineCords.x, lineCords.y, e.offsetX, e.offsetY)
          rotateElement(ballPointer2.current, lineCords.x, lineCords.y, e.offsetX, e.offsetY)
          rotateElement(ballPointer3.current, lineCords.x, lineCords.y, e.offsetX, e.offsetY)
          rotateElement(ballPointer4.current, lineCords.x, lineCords.y, e.offsetX, e.offsetY)
          rotateElement(ballPointer5.current, lineCords.x, lineCords.y, e.offsetX, e.offsetY)

      }
      const unregisterMouseMoveListener = registerListenerByReference('mousemove', (e)=> onMouseMove(e), svgContainer);
      return unregisterMouseMoveListener;

      }, [lineCords.x, lineCords.y, setBallAngle])


       const rotateElement = (el,originX,originY,towardsX,towardsY)=>{
        var degrees = Math.atan2(towardsY-originY,towardsX-originX)*180/Math.PI + 90;
        el.setAttribute(
          'transform',
          'translate('+originX+','+originY+') rotate('+degrees+') translate('+(-originX)+','+(-originY)+')'
        );
      }



    useEffect(() => {
        const tick = () => act(ACTION.TICK)//Tick tock, update state
        const timerId = setInterval(tick, UPDATE_EVERY)//update state based on constant
        //see what pressed the keyboard, and what to do
        const onKeyUp = ({ which }) => act(ACTION.KEY_UP, which)
        const unregisterKeyup = registerListener('keyup', onKeyUp)
        //unregister when unmounting
        return () => {
        clearInterval(timerId)
        unregisterKeyup()
        }
    }, [])
  
    //get current sizes for objects



    return (
      <svg width={viewWidth} height={viewHeight} className='scene' ref = {svgContainer}>
          {state.level.levelList.map((props) => (
            <Block
              density={props.density}
              key={`${props.position.x}-${props.position.y}`}
              width={projectDistance(props.width)}
              height={projectDistance(props.height)}
              color = {props.color}
              {...projectVector(props.position)}
            />)
          )}
          {
            state.ball.ballsArray.map((props)=> (<GameBall {...projectVector(props.center)} radius= {unit} key = {props.id}/>))
          }
        <GameBall {...projectVector(state.ball.markerBall.center)} radius={unit}/>
        <circle  cx={lineCords.x} cy={lineCords.y - (((unit * 7) * 1.15) + (unit * .5))} r = {unit * .5} className = 'ball' ref = {ballPointer1}/>
        <circle  cx={lineCords.x} cy={lineCords.y - (((unit * 7) * .90) + (unit * .6))} r = {unit * .6} className = 'ball' ref = {ballPointer2}/>
        <circle  cx={lineCords.x} cy={lineCords.y - (((unit * 7) * .65) + (unit * .7))} r = {unit * .7} className = 'ball' ref = {ballPointer3}/>
        <circle  cx={lineCords.x} cy={lineCords.y - (((unit * 7) * .40) + (unit * .8))} r = {unit * .8} className = 'ball' ref = {ballPointer4}/>
        <circle  cx={lineCords.x} cy={lineCords.y - (((unit * 7) * .15) + (unit * .9))} r = {unit * .9} className = 'ball' ref = {ballPointer5}/>
      </svg>
    )
  }
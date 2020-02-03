import React from 'react';
import {colors} from '../constants'
export const GameBall = ({x,y, radius}) => (
    <circle className = 'ball' cx={x} cy={y} r = {radius}/>
)

export const Block =({ x, y, width, height, density }) => (
    <rect className='block' fill={colors[density]} x={x} y={y}  rx = {width / 16} width={width - 5} height={height-3} />
);

export const LevelLabel = ({level, unit}) => (
    <text x={unit} y = {unit * 2} className = 'level'>
        LEVEL: {level}
    </text>
)



export const Paddle = ({ x, y, width, height }) => (
    <rect className='paddle' x={x} y={y} width={width} height={height}  rx = {width / 16} />
  )


export const trajectoryPointer = (circlemarker, projectvector) => {
    let {x, y} = projectvector(circlemarker);
    return (
    <>
    <circle className = 'ball' cx={x} cy={y} r = {1/5} style = {{transformOrigin: "0px 10px", transform: "rotate(30)"}} />
    </>
    )
}
import React from 'react';
import {colors} from '../constants'
export const GameBall = ({x,y, radius}) => (
    <circle className = 'ball' cx={x} cy={y} r = {radius}/>
)

const getBlockColors = (density) => {
    if (density % 2){
        return colors[1]
    }
    if (density % 3){
        return colors[2]
    }
    if (density % 4){
        return colors[3]
    }
    if (density % 5){
        return colors[4]
    }
}

export const Block =({ x, y, width, height, density, color }) => {
    return (
    <g>
    <rect className='block' fill={color} x={x} y={y}  rx = {width / 16} width={width - 5} height={height-3} />
    <text x={(x + (width / 2) - 6)} y = {y + (height / 2) + 3} font-size = {20} className = 'ballid'>
        {density}
    </text>
    </g>
);
}

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
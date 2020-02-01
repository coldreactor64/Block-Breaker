import {GAME_WIDTH} from '../constants'
//import { flatten } from '../utils'
import Vector from './vector'
//TODO: generate Block other position parameters based on position

const DOWN = new Vector(0, 1);

class Block {
    constructor(levelNumber, index) {
        this.makeBlock = this.randomize();
        this.density = levelNumber;
        this.position = new Vector(index, 0) // X, Y cords1Q ``` 
        this.width = 1;
        this.height = 1;
    }

    add(x, y) {
        this.position.add(x, y);
    }

    randomize() {
        return Math.floor(Math.random() * 1.6);
    }

}

export class Levels  {
    constructor(){
        this.levelList = [];
        this.currentLevel = 0;
    }

    addLevel(){
        this.currentLevel++;
        let newlevelArray = [];
        if (this.levelList !== []){
            this.transformLevelsDown();
        }
        for( let i = 0;  i < GAME_WIDTH; i++){
            let newBlock = new Block(this.currentLevel, i);
            if (newBlock.makeBlock !== 0) {
                newlevelArray.push(newBlock);
            }

        }
        this.levelList.unshift(newlevelArray);
        this.levelList = this.levelList.flat();

    }

    transformLevelsDown(){   
        this.levelList.forEach(element => {
            const elementPosition = element.position;
            const newElementPosition = new Vector(elementPosition.x, elementPosition.y + 1);
            element.position = newElementPosition;
        })
    }
    
}




export const registerListener = (eventName, handler) => {
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
}

export const registerListenerByReference = (eventName, handler, reference) => {
    reference.current.addEventListener(eventName, handler);
    return () => reference.current.removeEventListener(eventName, handler);
}

export const mapNumbers = (num, in_min, in_max, out_min, out_max) => {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }
  
export function guidGenerator() {
    var S4 = function() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4());
  }

export const flatten = arrays => arrays.reduce((acc, row)=>[...acc, ...row], []);
export const getRange = length => [...Array(length).keys()];
export const toDegrees = radians => (radians * 180) / Math.PI
export const toRadians = degrees => (degrees * Math.PI) / 180
export const withoutElement = (array, element) => array.filter(e => e !== element)
export const updateElement = (array, oldElement, newElement) => array.map(e => e === oldElement ? newElement : e)
export const getRandomFrom = (...args) => args[Math.floor(Math.random()* args.length)]
